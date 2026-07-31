import { useState } from 'react';
import type { EvaluationResponse, EvidenceEnvelope, ReplayResponse } from '../types';
import { RefreshCw, CheckCircle2, AlertTriangle, Cpu, Lock, ShieldAlert } from 'lucide-react';

interface ReplayPanelProps {
  evaluation: EvaluationResponse;
  onUpdateEnvelope?: (envelope: EvidenceEnvelope) => void;
}

export function ReplayPanel({ evaluation, onUpdateEnvelope }: ReplayPanelProps) {
  const [replaying, setReplaying] = useState(false);
  const [replayResult, setReplayResult] = useState<ReplayResponse | null>(null);

  const handleRunReplay = async () => {
    setReplaying(true);
    try {
      const res = await fetch('/api/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capturedInput: evaluation.capturedInput,
          capturedOutput: evaluation.capturedOutput,
          scenarioId: evaluation.scenarioId,
          originalQualificationHash: evaluation.qualificationHash,
          runs: 100,
          envelope: evaluation.evidenceEnvelope,
        }),
      });
      const data = await res.json();
      setReplayResult(data);
      if (data.updatedEvidenceEnvelope && onUpdateEnvelope) {
        onUpdateEnvelope(data.updatedEvidenceEnvelope);
      }
    } catch (err) {
      console.error('Replay error:', err);
    } finally {
      setReplaying(false);
    }
  };

  const isFullyVerified = Boolean(
    replayResult && replayResult.allHashesMatch && replayResult.matchesOriginalHash
  );

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-400" /> 100-Replay Deterministic Consistency Engine
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluates captured packet locally 100 times without making extra Gemini calls
          </p>
        </div>

        <button
          onClick={handleRunReplay}
          disabled={replaying}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${replaying ? 'animate-spin' : ''}`} />
          <span>{replaying ? 'Executing 100 Local Replays...' : 'Execute 100 Deterministic Replays'}</span>
        </button>
      </div>

      {replayResult ? (
        <div className="space-y-4">
          {/* Consistency Badge */}
          {isFullyVerified ? (
            <div className="bg-emerald-950/60 border border-emerald-800/80 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">
                    Replay Consistency &amp; Original Hash Match Verified ({replayResult.runsExecuted}/{replayResult.runsExecuted} Identical Hashes)
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Exactly {replayResult.uniqueHashesCount} unique qualification hash matching original qualification hash across all {replayResult.runsExecuted} iterations
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800 font-mono text-xs text-emerald-400 shrink-0">
                Hash: {replayResult.primaryHash.substring(0, 16)}...
              </div>
            </div>
          ) : (
            <div className="bg-amber-950/60 border border-amber-800/80 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/20 text-amber-400 p-2 rounded-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-300">
                    NOT EQUIVALENT: Replay Qualification Hash Does Not Match Original Hash
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Replay Scope: <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">{replayResult.replayScope}</code> ({replayResult.runsExecuted}/{replayResult.runsExecuted} internal replay runs identical)
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800 font-mono text-xs text-amber-400 shrink-0">
                Replay Hash: {replayResult.primaryHash.substring(0, 16)}...
              </div>
            </div>
          )}

          {/* Scope and Disclaimer Box */}
          {replayResult.disclaimer && (
            <div className="bg-rose-950/40 border border-rose-800/80 p-3.5 rounded-lg text-xs text-rose-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-rose-300">Redacted Public Preview Replay Limitation:</strong>
                <span>{replayResult.disclaimer}</span>
              </div>
            </div>
          )}

          {/* Explanation Box */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Lock className="w-4 h-4" /> Why is the qualification hash invariant across 100 replays?
            </div>
            <p className="leading-relaxed">
              Wall-clock time, execution UUIDs, request durations, and host metadata are intentionally <strong>EXCLUDED</strong> from the qualification hash. Only the RFC 8785-aligned demonstration canonicalization of the captured input fingerprint, captured output hash, policy ID, validator version, reason codes, and constraint evaluations enter the qualification hash commitment.
            </p>
          </div>

          {/* Iteration Snapshot List */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Sample Execution Log Snapshot (Iterations 1-5 &amp; 96-100)
            </div>
            <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 font-mono text-[11px] space-y-1 text-slate-400">
              {replayResult.executionLog.slice(0, 5).map((log) => (
                <div key={log.iteration} className="flex justify-between border-b border-slate-900 pb-1">
                  <span>Replay #{log.iteration}</span>
                  <span className={isFullyVerified ? 'text-emerald-400' : 'text-amber-400'}>{log.qualificationHash}</span>
                  <span className="text-slate-500">{log.timestamp.split('T')[1]}</span>
                </div>
              ))}
              <div className="text-center text-slate-600 py-1">... [90 identical iterations omitted for brevity] ...</div>
              {replayResult.executionLog.slice(95, 100).map((log) => (
                <div key={log.iteration} className="flex justify-between border-b border-slate-900 pb-1">
                  <span>Replay #{log.iteration}</span>
                  <span className={isFullyVerified ? 'text-emerald-400' : 'text-amber-400'}>{log.qualificationHash}</span>
                  <span className="text-slate-500">{log.timestamp.split('T')[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 text-center space-y-2">
          <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">
            Click <strong>&quot;Execute 100 Deterministic Replays&quot;</strong> above to verify replay consistency on this captured packet.
          </p>
        </div>
      )}
    </div>
  );
}
