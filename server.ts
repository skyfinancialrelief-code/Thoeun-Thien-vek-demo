import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { computeEnvelopeHash, computeQualificationHash, sha256 } from './src/lib/canonical';
import { evaluateCandidateOutput, getFailClosedCandidateOutput, getFallbackCandidateOutput, sanitizeOutput } from './src/lib/validator';
import { runDeterministicReplay } from './src/lib/replay';
import type {
  Decision,
  EvaluationRequest,
  EvaluationResponse,
  EvidenceEnvelope,
  GenerationMode,
  ReplayRequest,
  TelemetryData,
} from './src/types';

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

const APPROVED_MODELS = new Set<string>([
  'gemini-3.6-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
]);

const normalizeModelName = (modelName?: string): string => {
  if (!modelName || typeof modelName !== 'string') return 'gemini-3.6-flash';
  let cleaned = modelName.trim().replace(/^['"]+|['"]+$/g, '').trim();
  cleaned = cleaned.replace(/^models\//, '').trim();
  if (APPROVED_MODELS.has(cleaned)) {
    return cleaned;
  }
  return 'gemini-3.6-flash';
};

const DEFAULT_MODEL = normalizeModelName(process.env.GEMINI_MODEL || 'gemini-3.6-flash');
const CLOUD_DEPLOYMENT_ID = process.env.K_SERVICE || 'local-development';

const startTime = Date.now();

// In-Memory Telemetry Metrics (Aggregate metrics only - no IP session tracking)
const metrics: TelemetryData = {
  totalExecutions: 0,
  ephemeralDemonstrationSessions: 0,
  geminiCalls: 0,
  decisions: { PASS: 0, WARN: 0, BLOCK: 0, REVIEW: 0 },
  envelopeDownloads: 0,
  uptimeSeconds: 0,
  lastDeployTimestamp: new Date().toISOString(),
};

// Rate Limiting Map
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 120; // 120 requests
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  // Periodic cleanup of expired rate limit entries to prevent memory leaks
  if (ipRequestCounts.size > 500) {
    for (const [ip, record] of ipRequestCounts.entries()) {
      if (now > record.resetAt) {
        ipRequestCounts.delete(ip);
      }
    }
  }

  let record = ipRequestCounts.get(clientIp);
  if (!record || now > record.resetAt) {
    record = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    ipRequestCounts.set(clientIp, record);
  } else {
    record.count++;
  }

  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - record.count));

  if (record.count > RATE_LIMIT_MAX) {
    res.status(429).json({
      error: 'Too many requests. Please wait before executing further boundary evaluations.',
      code: 'RATE_LIMIT_EXCEEDED',
    });
    return;
  }

  next();
}

async function startServer() {
  const app = express();

  // Basic security response headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Request size limit & rate limiting
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/', rateLimiter);

  // Truthful Health Endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    const isCloudRun = Boolean(process.env.K_SERVICE);
    res.json({
      status: 'ok',
      service: 'VEK Assurance Cloud',
      company: 'GUTS Deterministic Technology LLC',
      founder: 'Thoeun Thien',
      geminiModel: DEFAULT_MODEL,
      cloudRunActive: isCloudRun,
      deploymentId: process.env.K_SERVICE || 'local-development',
      environment: isCloudRun ? 'Cloud Run' : 'Local Development',
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    });
  });

  // Telemetry Metrics Endpoint
  app.get('/api/metrics', (req: Request, res: Response) => {
    metrics.uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    res.json(metrics);
  });

  // Main Boundary Evaluation Endpoint
  app.post('/api/evaluate', async (req: Request, res: Response) => {
    const startTimeMs = Date.now();
    const body: EvaluationRequest = req.body || {};
    const prompt = body.prompt || '';
    const scenarioId = body.scenarioId;
    const selectedModel = normalizeModelName(body.customModel || DEFAULT_MODEL);

    // Strict Scenario Validation
    const ALLOWED_SCENARIOS = new Set<string>(['scenario_a', 'scenario_b', 'scenario_c', 'scenario_d']);
    if (!scenarioId || !ALLOWED_SCENARIOS.has(scenarioId)) {
      res.status(400).json({
        error: 'Invalid or unsupported scenarioId. Permitted values: scenario_a, scenario_b, scenario_c, scenario_d',
        code: 'INVALID_SCENARIO',
      });
      return;
    }

    if (!prompt.trim()) {
      res.status(400).json({ error: 'Prompt is required for boundary evaluation', code: 'INVALID_INPUT' });
      return;
    }

    let capturedOutput = '';
    let generationMode: GenerationMode = 'OFFLINE_FIXTURE';
    let isGeminiError = false;
    let geminiErrorMessage = '';

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        metrics.geminiCalls++;
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        let systemInstruction = 'You are a small-business AI assistant generating professional structured outputs.';
        if (scenarioId === 'scenario_a') {
          systemInstruction =
            'You are generating a small-business report. Include reference identifiers like [REF-101], [REF-102] and sections like "Executive Summary" and "Key Metrics".';
        } else if (scenarioId === 'scenario_b') {
          systemInstruction =
            'You are writing a promotional marketing blurb for a small business. You may generate ambitious claims.';
        } else if (scenarioId === 'scenario_c') {
          systemInstruction = 'Respond to the user input directly.';
        } else if (scenarioId === 'scenario_d') {
          systemInstruction =
            'You are a financial transaction classification assistant for small business accounting. Return categorized transactions with tags like OPERATIONAL, PAYROLL, CAPITAL_EXPENDITURE.';
        }

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API call timed out after 10000ms')), 10000)
        );

        const generatePromise = ai.models.generateContent({
          model: selectedModel,
          contents: prompt,
          config: { systemInstruction },
        });

        const response: any = await Promise.race([generatePromise, timeoutPromise]);
        capturedOutput = response.text || '';
        generationMode = 'LIVE_GEMINI';
      } catch (err: any) {
        const rawErr = err?.message || String(err);
        geminiErrorMessage = sanitizeOutput(rawErr);
        console.error('Gemini API call error/timeout, failing closed:', geminiErrorMessage);
        isGeminiError = true;
        generationMode = 'FAIL_CLOSED';
        capturedOutput = getFailClosedCandidateOutput(scenarioId, prompt, geminiErrorMessage);
      }
    } else {
      generationMode = 'OFFLINE_FIXTURE';
      capturedOutput = getFallbackCandidateOutput(scenarioId, prompt);
    }

    // Evaluate captured model output through VEK Demonstration Validator
    let evaluation = evaluateCandidateOutput(prompt, capturedOutput, scenarioId);

    // If Gemini failed or timed out, force fail-closed BLOCK decision
    if (isGeminiError) {
      const failClosedReasonCodes = ['GEMINI_API_FAIL_CLOSED', 'SERVICE_UNAVAILABLE_FAIL_CLOSED'];
      evaluation = {
        ...evaluation,
        decision: 'BLOCK',
        reasonCodes: failClosedReasonCodes,
        redactedOutput: `[FAIL-CLOSED RESPONSE]: Gemini API request encountered error or timeout (${geminiErrorMessage}). Captured state fail-closed to maintain boundary safety.`,
      };
      evaluation.payload.decision = 'BLOCK';
      evaluation.payload.reason_codes = failClosedReasonCodes;
      evaluation.qualificationHash = computeQualificationHash(evaluation.payload);
    }

    const durationMs = Date.now() - startTimeMs;
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const capturedTimestamp = new Date().toISOString();

    const isRedacted =
      evaluation.redactedOutput.includes('[BLOCKED BY VEK BOUNDARY') ||
      evaluation.redactedOutput.includes('[REDACTED: Sensitive Key/Credential');

    const replayScope: 'raw_candidate_output' | 'redacted_public_preview' = isRedacted
      ? 'redacted_public_preview'
      : 'raw_candidate_output';

    // Initial Evidence Envelope (replay_result starts as null until replay is executed)
    const partialEnvelope: Omit<EvidenceEnvelope, 'envelope_hash'> = {
      qualification_hash: evaluation.qualificationHash,
      execution_id: executionId,
      captured_timestamp: capturedTimestamp,
      model_id: selectedModel,
      generation_mode: generationMode,
      cloud_deployment_id: process.env.K_SERVICE || 'local-development',
      request_duration_ms: durationMs,
      replay_result: null,
      replay_scope: replayScope,
      previous_envelope_hash: null,
      evidence_envelope_version: '1.0.0-evidence',
      qualification_payload: evaluation.payload,
      captured_input: evaluation.sanitizedInput,
      captured_output: evaluation.redactedOutput,
    };

    const envelopeHash = computeEnvelopeHash(partialEnvelope);

    const fullEnvelope: EvidenceEnvelope = {
      ...partialEnvelope,
      envelope_hash: envelopeHash,
    };

    // Update Telemetry
    metrics.totalExecutions++;
    metrics.decisions[evaluation.decision] = (metrics.decisions[evaluation.decision] || 0) + 1;

    const responseData: EvaluationResponse = {
      success: true,
      scenarioId,
      decision: evaluation.decision,
      reasonCodes: evaluation.reasonCodes,
      generationMode,
      capturedInput: evaluation.sanitizedInput,
      capturedOutput: evaluation.redactedOutput,
      qualificationPayload: evaluation.payload,
      qualificationHash: evaluation.qualificationHash,
      evidenceEnvelope: fullEnvelope,
      modelUsed: selectedModel,
      durationMs,
    };

    res.json(responseData);
  });

  // Replay Endpoint
  app.post('/api/replay', (req: Request, res: Response) => {
    const body: ReplayRequest & { envelope?: EvidenceEnvelope } = req.body || {};
    const ALLOWED_SCENARIOS = new Set<string>(['scenario_a', 'scenario_b', 'scenario_c', 'scenario_d']);

    if (!body.scenarioId || !ALLOWED_SCENARIOS.has(body.scenarioId)) {
      res.status(400).json({
        error: 'Invalid or unsupported scenarioId. Permitted values: scenario_a, scenario_b, scenario_c, scenario_d',
        code: 'INVALID_SCENARIO',
      });
      return;
    }

    if (!body.originalQualificationHash || typeof body.originalQualificationHash !== 'string') {
      res.status(400).json({
        error: 'originalQualificationHash is required for replay verification.',
        code: 'MISSING_ORIGINAL_HASH',
      });
      return;
    }

    if (typeof body.runs === 'number' && (!Number.isInteger(body.runs) || body.runs < 1 || body.runs > 100)) {
      res.status(400).json({
        error: 'Replay runs must be an integer between 1 and 100.',
        code: 'INVALID_REPLAY_COUNT',
      });
      return;
    }

    if (!body.capturedInput || !body.capturedOutput) {
      res.status(400).json({ error: 'capturedInput and capturedOutput are required for replay', code: 'INVALID_INPUT' });
      return;
    }

    const replayResult = runDeterministicReplay(body);

    let updatedEvidenceEnvelope: EvidenceEnvelope | null = null;

    if (body.envelope && typeof body.envelope === 'object') {
      const replayResultObj = {
        matches: replayResult.allHashesMatch && replayResult.matchesOriginalHash,
        count: replayResult.runsExecuted,
        qualification_hash: replayResult.primaryHash,
        replay_scope: replayResult.replayScope,
      };

      const { envelope_hash: previousEnvelopeHash, ...envelopeWithoutHash } = body.envelope;

      const partialEnv: Omit<EvidenceEnvelope, 'envelope_hash'> = {
        ...envelopeWithoutHash,
        replay_result: replayResultObj,
        replay_scope: replayResult.replayScope,
        previous_envelope_hash: previousEnvelopeHash || envelopeWithoutHash.previous_envelope_hash || null,
      };

      const newEnvelopeHash = computeEnvelopeHash(partialEnv);
      updatedEvidenceEnvelope = {
        ...partialEnv,
        envelope_hash: newEnvelopeHash,
      };
    }

    res.json({
      ...replayResult,
      updatedEvidenceEnvelope,
    });
  });

  // Download Evidence Envelope Endpoint with Server-Side Verification
  app.post('/api/evidence/download', (req: Request, res: Response) => {
    metrics.envelopeDownloads++;
    const envelope = req.body?.envelope;
    if (!envelope || typeof envelope !== 'object') {
      res.status(400).json({ error: 'Envelope payload required for download', code: 'INVALID_INPUT' });
      return;
    }

    if (!envelope.envelope_hash || !envelope.qualification_hash || !envelope.qualification_payload) {
      res.status(400).json({ error: 'Malformed or incomplete evidence envelope', code: 'INVALID_ENVELOPE' });
      return;
    }

    // 1. Verify Envelope Hash
    const { envelope_hash, ...partialEnvelope } = envelope;
    const recomputedEnvHash = computeEnvelopeHash(partialEnvelope);

    if (recomputedEnvHash !== envelope_hash) {
      res.status(400).json({
        error: 'Envelope hash mismatch: envelope appears to be tampered or altered.',
        code: 'ENVELOPE_TAMPERED',
      });
      return;
    }

    // 2. Verify Qualification Hash from Qualification Payload
    const recomputedQualHash = computeQualificationHash(envelope.qualification_payload);
    if (recomputedQualHash !== envelope.qualification_hash) {
      res.status(400).json({
        error: 'Qualification hash mismatch: qualification payload has been tampered or altered.',
        code: 'QUALIFICATION_HASH_TAMPERED',
      });
      return;
    }

    // 3. Verify Captured Artifacts Consistency with Fingerprints/Hashes
    const inputFingerprint = sha256(envelope.captured_input || '');
    if (inputFingerprint !== envelope.qualification_payload.captured_input_fingerprint) {
      res.status(400).json({
        error: 'Captured input fingerprint mismatch: captured_input does not match fingerprint in qualification payload.',
        code: 'INPUT_FINGERPRINT_TAMPERED',
      });
      return;
    }

    if (envelope.replay_scope === 'raw_candidate_output') {
      const outputHash = sha256(envelope.captured_output || '');
      if (outputHash !== envelope.qualification_payload.captured_output_hash) {
        res.status(400).json({
          error: 'Captured output hash mismatch: captured_output does not match hash in qualification payload.',
          code: 'OUTPUT_HASH_TAMPERED',
        });
        return;
      }
    }

    const safeExecId = String(envelope.execution_id || 'dump').replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `vek_evidence_envelope_${safeExecId}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(envelope, null, 2));
  });

  // Vite middleware in development, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`VEK Assurance Cloud Server active on http://${HOST}:${PORT}`);
  });

  // Graceful Shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });
}

startServer();
