import { AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function ClaimBoundaryBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-900 border-y border-amber-500/30 px-6 py-4 text-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start gap-3">
          <div className="bg-amber-500/20 text-amber-400 p-2 rounded-lg mt-0.5 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Mandatory Scientific Claim Boundary (Build with Gemini XPRIZE)
              </h2>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-slate-400 hover:text-white text-xs flex items-center gap-1 font-medium transition-colors"
              >
                {expanded ? 'Hide Disclaimers' : 'View Prohibited Statements & Approved Terms'}
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-sm font-medium text-slate-100 mt-1.5 leading-relaxed bg-slate-950/60 p-3 rounded-md border border-slate-800">
              “VEK Assurance Cloud does not make Gemini or any other probabilistic model deterministic and does not independently prove factual truth. It deterministically evaluates a captured model output against a disclosed demonstration policy. Given the same captured input, captured output, policy version, validator version, canonicalization profile, configuration, and initial state, the qualification process is designed to return the same decision and qualification hash.”
            </p>

            {expanded && (
              <div className="mt-4 pt-3 border-t border-slate-800 grid md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/80 p-3 rounded-md border border-slate-800/80">
                  <h3 className="font-semibold text-rose-400 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4" /> Prohibited & Overstated Claims (Strictly Excluded)
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>Does NOT eliminate hallucinations or guarantee factual truth</li>
                    <li>Does NOT make Gemini or LLMs deterministic</li>
                    <li>Does NOT provide FIPS validation or government certification</li>
                    <li>Does NOT claim to be unhackable or mathematically infallible</li>
                    <li>Does NOT replace qualified legal, financial, medical, or cybersecurity professionals</li>
                  </ul>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-md border border-slate-800/80">
                  <h3 className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
                    <Info className="w-4 h-4" /> Approved Technical Terminology
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>Deterministic qualification & replay consistency</li>
                    <li>Fail-closed handling & constraint evaluation</li>
                    <li>Tamper-evident evidence envelope</li>
                    <li>Hash-bound commitment to captured model output</li>
                    <li>Disclosed demonstration policy & tested configuration</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
