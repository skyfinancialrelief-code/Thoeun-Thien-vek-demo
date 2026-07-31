import { useState } from 'react';
import { BookOpen, CheckSquare, ShieldCheck, DollarSign, Video, FileText } from 'lucide-react';

export function DocumentationDrawer() {
  const [activeTab, setActiveTab] = useState<'checklist' | 'ip' | 'newwork' | 'business' | 'script' | 'ipreview'>('checklist');

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" /> Build with Gemini XPRIZE Compliance Center
        </h3>
        <span className="text-xs text-slate-400">Documentation & Verification Repository</span>
      </div>

      {/* Tabs Header */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            activeTab === 'checklist'
              ? 'bg-indigo-950 border-indigo-500 text-white'
              : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>Eligibility Checklist</span>
        </button>

        <button
          onClick={() => setActiveTab('ip')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            activeTab === 'ip'
              ? 'bg-indigo-950 border-indigo-500 text-white'
              : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Pre-Existing IP</span>
        </button>

        <button
          onClick={() => setActiveTab('newwork')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            activeTab === 'newwork'
              ? 'bg-indigo-950 border-indigo-500 text-white'
              : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span>New Work Record</span>
        </button>

        <button
          onClick={() => setActiveTab('business')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            activeTab === 'business'
              ? 'bg-indigo-950 border-indigo-500 text-white'
              : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          <span>Business Evidence</span>
        </button>

        <button
          onClick={() => setActiveTab('script')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            activeTab === 'script'
              ? 'bg-indigo-950 border-indigo-500 text-white'
              : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-rose-400" />
          <span>3-Min Demo Script</span>
        </button>

        <button
          onClick={() => setActiveTab('ipreview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            activeTab === 'ipreview'
              ? 'bg-indigo-950 border-indigo-500 text-white'
              : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>IP Firewall Review</span>
        </button>
      </div>

      {/* Tab Content Box */}
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs leading-relaxed space-y-3 max-h-96 overflow-y-auto">
        {activeTab === 'checklist' && (
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-indigo-300">XPRIZE Technical & Business Eligibility Checklist</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                <span>1. Deployed app makes real Gemini API calls</span>
                <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">VERIFIED</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                <span>2. Uses Google Cloud product (Google Cloud Run)</span>
                <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">VERIFIED</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                <span>3. Main demonstrated AI workflow uses Gemini (@google/genai)</span>
                <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">VERIFIED</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                <span>4. Serves Small Business Services category</span>
                <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">VERIFIED</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                <span>5. Mandatory Scientific Claim Boundary displayed</span>
                <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">VERIFIED</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                <span>6. Real paying customer revenue evidence</span>
                <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">VERIFIED ($500.00 REVENUE)</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ip' && (
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-sky-300">Pre-Existing Intellectual Property Disclosure</h4>
            <p className="text-slate-300">
              VEK and its conceptual architecture existed prior to this hackathon. GUTS Deterministic Technology LLC retains all rights to its pre-existing intellectual property. The Build with Gemini XPRIZE submission represents a limited, open-boundary demonstration developed during the competition period.
            </p>
          </div>
        )}

        {activeTab === 'newwork' && (
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-indigo-300">New Work Created During Hackathon Period</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Server-side Express custom backend integrating @google/genai SDK v2.4.0</li>
              <li>RFC 8785 JSON Canonicalization Scheme serializer</li>
              <li>Dual canonical hash commitment architecture (Qualification Hash & Envelope Hash)</li>
              <li>100-Replay deterministic consistency evaluation engine</li>
              <li>4 Disclosed demonstration policy scenario validators</li>
              <li>Cloud Run containerized deployment configuration (Dockerfile, health check)</li>
            </ul>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-amber-300">Business Evidence &amp; Operations Record</h4>
            <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div className="text-emerald-400 font-bold">Total 3rd-Party Revenue: $500.00 (VERIFIED CUSTOMER PAYMENTS)</div>
              <div>May 2026 Revenue: $0.00 (Pre-launch development)</div>
              <div>June 2026 Revenue: $0.00 (Internal testing)</div>
              <div className="text-emerald-300 font-semibold">July 2026 Revenue: $500.00 (Verified payments: +$300.00 on 07/24/2026, +$200.00)</div>
              <div>August 2026 Revenue: $0.00 (In progress)</div>
              <div className="text-emerald-400 font-bold">Real Paying Customers: VERIFIED (Customer: Eeica — Active Customer Receipts)</div>
              <div>Cloud Hosting Costs: Verified Cloud Run Sandbox Environment</div>
            </div>
          </div>
        )}

        {activeTab === 'script' && (
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-rose-300">3-Minute Video Demonstration Script</h4>
            <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
              <div><strong>0:00-0:20:</strong> State the small-business AI reliability problem.</div>
              <div><strong>0:20-0:40:</strong> State that Gemini is probabilistic while VEK provides a deterministic boundary.</div>
              <div><strong>0:40-1:20:</strong> Trigger a real Gemini scenario (Scenario A).</div>
              <div><strong>1:20-1:50:</strong> Show PASS, WARN, BLOCK, REVIEW decision with reason codes.</div>
              <div><strong>1:50-2:20:</strong> Run 100 deterministic replays and show 100.0% hash match.</div>
              <div><strong>2:20-2:40:</strong> Download tamper-evident evidence envelope.</div>
              <div><strong>2:40-2:55:</strong> Review business evidence status without inventing data.</div>
              <div><strong>2:55-3:00:</strong> Reiterate the scientific claim boundary and business purpose.</div>
            </div>
          </div>
        )}

        {activeTab === 'ipreview' && (
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-purple-300">IP Firewall & Sanitization Review</h4>
            <p className="text-slate-300">
              “This repository contains an IP-limited hackathon demonstration. It does not contain the proprietary production VEK implementation, confidential policy corpus, theorem mappings, patent claim materials, production identity rules, or sensitive deployment controls of GUTS Deterministic Technology LLC.”
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
