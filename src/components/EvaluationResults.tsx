import type { EvaluationResponse } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle, Hash, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface EvaluationResultsProps {
  evaluation: EvaluationResponse;
}

export function EvaluationResults({ evaluation }: EvaluationResultsProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getDecisionBadge = () => {
    switch (evaluation.decision) {
      case 'PASS':
        return (
          <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-4 py-2 rounded-lg font-bold text-lg">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>QUALIFICATION: PASS</span>
          </div>
        );
      case 'WARN':
        return (
          <div className="flex items-center gap-2 bg-amber-500/20 text-amber-400 border border-amber-500/40 px-4 py-2 rounded-lg font-bold text-lg">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span>QUALIFICATION: WARN</span>
          </div>
        );
      case 'BLOCK':
        return (
          <div className="flex items-center gap-2 bg-rose-500/20 text-rose-400 border border-rose-500/40 px-4 py-2 rounded-lg font-bold text-lg">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>QUALIFICATION: BLOCK</span>
          </div>
        );
      case 'REVIEW':
        return (
          <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 px-4 py-2 rounded-lg font-bold text-lg">
            <HelpCircle className="w-6 h-6 text-indigo-400" />
            <span>QUALIFICATION: REVIEW</span>
          </div>
        );
    }
  };

  const isBlocked = evaluation.decision === 'BLOCK';

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-5">
      {/* Header Decision Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        {getDecisionBadge()}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div>
            Model: <strong className="text-slate-200 font-mono">{evaluation.modelUsed}</strong>
          </div>
          <div>
            Duration: <strong className="text-slate-200 font-mono">{evaluation.durationMs}ms</strong>
          </div>
          <div>
            Policy: <strong className="text-slate-200 font-mono">{evaluation.qualificationPayload.policy_id}</strong>
          </div>
        </div>
      </div>

      {/* Captured Model Output Box */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Captured Candidate Output</span>
          {isBlocked && <span className="text-rose-400 font-normal">Redacted Preview Applied</span>}
        </label>
        <div
          className={`p-4 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed ${
            isBlocked
              ? 'bg-rose-950/40 border border-rose-800/80 text-rose-200'
              : 'bg-slate-950 border border-slate-800 text-slate-200'
          }`}
        >
          {evaluation.capturedOutput}
        </div>
      </div>

      {/* Deterministic Reason Codes */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Deterministic Reason Codes
        </h4>
        <div className="flex flex-wrap gap-2">
          {evaluation.reasonCodes.map((code) => (
            <span
              key={code}
              className="bg-slate-800 border border-slate-700 text-indigo-300 font-mono text-xs px-2.5 py-1 rounded-md"
            >
              {code}
            </span>
          ))}
        </div>
      </div>

      {/* Constraint Evaluation Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Demonstration Constraint Evaluations
        </h4>
        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Constraint</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Reason Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300 bg-slate-900">
              {evaluation.qualificationPayload.constraint_results.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-200 font-semibold">{c.id}</td>
                  <td className="py-2.5 px-3 text-slate-300">{c.description}</td>
                  <td className="py-2.5 px-3 text-center">
                    {c.passed ? (
                      <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-semibold text-[11px]">
                        PASS
                      </span>
                    ) : (
                      <span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-semibold text-[11px]">
                        FAIL
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{c.reasonCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hash Commitments Panel */}
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Hash className="w-4 h-4 text-emerald-400" /> Hash Bound Commitments & Canonical Hashes
        </h4>

        <div className="grid md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>QUALIFICATION HASH (RFC 8785 JCS)</span>
              <button
                onClick={() => copyToClipboard(evaluation.qualificationHash, 'qual')}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                {copiedHash === 'qual' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-emerald-400 font-bold truncate">{evaluation.qualificationHash}</div>
          </div>

          <div className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>EVIDENCE ENVELOPE HASH</span>
              <button
                onClick={() =>
                  copyToClipboard(evaluation.evidenceEnvelope.envelope_hash, 'env')
                }
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                {copiedHash === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-indigo-400 font-bold truncate">
              {evaluation.evidenceEnvelope.envelope_hash}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
