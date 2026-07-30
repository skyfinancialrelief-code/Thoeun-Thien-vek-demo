import { evaluateCandidateOutput } from './validator';
import type { ReplayRequest, ReplayResponse, ScenarioId } from '../types';

/**
 * Runs deterministic local replays of a captured model output.
 * NEVER invokes the Gemini API during replay. Evaluates the fixed captured
 * packet up to 100 times in-memory.
 */
export function runDeterministicReplay(request: ReplayRequest): ReplayResponse {
  let runs = 100;
  if (typeof request.runs === 'number') {
    if (isNaN(request.runs) || request.runs < 1) {
      return {
        success: false,
        runsExecuted: 0,
        allHashesMatch: false,
        matchesOriginalHash: false,
        uniqueHashesCount: 0,
        primaryHash: '',
        replayScope: 'redacted_public_preview',
        executionLog: [],
        wallClockExclusionVerified: false,
        error: 'Replay runs must be an integer >= 1.',
      };
    }
    runs = Math.min(100, Math.floor(request.runs));
  }

  const capturedInput = request.capturedInput || '';
  const capturedOutput = request.capturedOutput || '';
  const scenarioId: ScenarioId = request.scenarioId;
  const originalQualificationHash = request.originalQualificationHash;

  const isRedacted =
    capturedOutput.includes('[BLOCKED BY VEK BOUNDARY') ||
    capturedOutput.includes('[REDACTED: Sensitive Key/Credential');

  const replayScope: 'raw_candidate_output' | 'redacted_public_preview' = isRedacted
    ? 'redacted_public_preview'
    : 'raw_candidate_output';

  const executionLog: Array<{
    iteration: number;
    qualificationHash: string;
    timestamp: string;
  }> = [];

  const hashesSet = new Set<string>();

  for (let i = 1; i <= runs; i++) {
    const evaluation = evaluateCandidateOutput(capturedInput, capturedOutput, scenarioId);
    hashesSet.add(evaluation.qualificationHash);

    executionLog.push({
      iteration: i,
      qualificationHash: evaluation.qualificationHash,
      timestamp: new Date().toISOString(),
    });
  }

  const primaryHash = executionLog[0]?.qualificationHash || '';
  const uniqueHashesCount = hashesSet.size;
  const internalMatches = uniqueHashesCount === 1;

  const matchesOriginalHash = Boolean(
    originalQualificationHash ? primaryHash === originalQualificationHash : true
  );

  const allHashesMatch = internalMatches && matchesOriginalHash;

  const disclaimer = isRedacted
    ? 'Note: Redacted public preview artifact cannot independently reconstruct raw-output qualification hash because raw secrets were removed for security.'
    : undefined;

  return {
    success: true,
    runsExecuted: runs,
    allHashesMatch,
    matchesOriginalHash,
    uniqueHashesCount,
    primaryHash,
    replayScope,
    executionLog,
    wallClockExclusionVerified: allHashesMatch,
    disclaimer,
  };
}
