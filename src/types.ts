export type Decision = 'PASS' | 'WARN' | 'BLOCK' | 'REVIEW';

export type ScenarioId = 'scenario_a' | 'scenario_b' | 'scenario_c' | 'scenario_d';

export type GenerationMode = 'LIVE_GEMINI' | 'OFFLINE_FIXTURE' | 'FAIL_CLOSED';

export interface ConstraintResult {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  reasonCode: string;
  details: string;
}

export interface QualificationPayload {
  schema_version: string;
  captured_input_fingerprint: string;
  captured_output_hash: string;
  policy_id: string;
  policy_version: string;
  validator_version: string;
  canonicalization_profile: string;
  configuration_hash: string;
  initial_state_hash: string;
  decision: Decision;
  reason_codes: string[];
  constraint_results: ConstraintResult[];
}

export interface EvidenceEnvelope {
  qualification_hash: string;
  execution_id: string;
  captured_timestamp: string;
  model_id: string;
  generation_mode: GenerationMode;
  cloud_deployment_id: string;
  request_duration_ms: number;
  replay_result: {
    matches: boolean;
    count: number;
    qualification_hash: string;
    replay_scope: 'raw_candidate_output' | 'redacted_public_preview';
  } | null;
  replay_scope: 'raw_candidate_output' | 'redacted_public_preview';
  previous_envelope_hash: string | null;
  evidence_envelope_version: string;
  qualification_payload: QualificationPayload;
  captured_input: string;
  captured_output: string;
  envelope_hash: string;
}

export interface EvaluationRequest {
  prompt: string;
  scenarioId: ScenarioId;
  customModel?: string;
}

export interface EvaluationResponse {
  success: boolean;
  scenarioId: ScenarioId;
  decision: Decision;
  reasonCodes: string[];
  generationMode: GenerationMode;
  capturedInput: string;
  capturedOutput: string;
  qualificationPayload: QualificationPayload;
  qualificationHash: string;
  evidenceEnvelope: EvidenceEnvelope;
  modelUsed: string;
  durationMs: number;
  error?: string;
}

export interface ReplayRequest {
  capturedInput: string;
  capturedOutput: string;
  scenarioId: ScenarioId;
  runs?: number;
  originalQualificationHash?: string;
}

export interface ReplayResponse {
  success: boolean;
  runsExecuted: number;
  allHashesMatch: boolean;
  matchesOriginalHash: boolean;
  uniqueHashesCount: number;
  primaryHash: string;
  replayScope: 'raw_candidate_output' | 'redacted_public_preview';
  executionLog: Array<{
    iteration: number;
    qualificationHash: string;
    timestamp: string;
  }>;
  wallClockExclusionVerified: boolean;
  disclaimer?: string;
  error?: string;
}

export interface TelemetryData {
  totalExecutions: number;
  ephemeralDemonstrationSessions: number;
  geminiCalls: number;
  decisions: Record<Decision, number>;
  envelopeDownloads: number;
  uptimeSeconds: number;
  lastDeployTimestamp: string;
}

export interface ScenarioDefinition {
  id: ScenarioId;
  title: string;
  description: string;
  expectedDecision: Decision;
  defaultPrompt: string;
  policyName: string;
  disclaimer?: string;
}
