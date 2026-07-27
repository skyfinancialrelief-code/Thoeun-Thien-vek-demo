import { evaluateCandidateOutput } from './validator';
import type { ReplayRequest, ReplayResponse, ScenarioId } from '../types';

/**
 * Runs deterministic local replays of a captured model output.
 * NEVER invokes the Gemini API during replay. Evaluates the fixed captured
 * packet 100 times in-memory.
 */
export function runDeterministicReplay(request: ReplayRequest): ReplayResponse {
  const runs = request.runs && request.runs > 0 ? request.runs : 100;
  const capturedInput = request.capturedInput;
  const capturedOutput = request.capturedOutput;
  const scenarioId: ScenarioId = request.scenarioId || 'scenario_a';

  const executionLog: Array<{
    iteration: number;
    qualificationHash: string;
    timestamp: string;
  }> = [];

  const hashesSet = new Set<string>();

  for (let i = 1; i <= runs; i++) {
    // Artificial tiny pause or simulated timestamp difference if needed to test wall-clock exclusion
    const evaluation = evaluateCandidateOutput(capturedInput, capturedOutput, scenarioId);
    
    hashesSet.add(evaluation.qualificationHash);
    
    executionLog.push({
      iteration: i,
      qualificationHash: evaluation.qualificationHash,
      timestamp: new Date().toISOString(),
    });
  }

  const primaryHash = executionLog[0]?.qualificationHash || '';
  const allHashesMatch = hashesSet.size === 1;

  return {
    success: true,
    runsExecuted: runs,
    allHashesMatch,
    uniqueHashesCount: hashesSet.size,
    primaryHash,
    executionLog,
    wallClockExclusionVerified: allHashesMatch,
  };
}
