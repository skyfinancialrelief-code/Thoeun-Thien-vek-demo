import { useState } from 'react';
import type { EvidenceEnvelope } from '../types';
import { Download, FileCode, Check } from 'lucide-react';

interface EvidenceInspectorProps {
  envelope: EvidenceEnvelope;
}

export function EvidenceInspector({ envelope }: EvidenceInspectorProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/evidence/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ envelope }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vek_evidence_envelope_${envelope.execution_id}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" /> Evidence Envelope Artifact Inspector
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tamper-evident evidence envelope bound by dual canonical SHA-256 hashes
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all shrink-0"
        >
          {downloaded ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Downloaded Evidence Envelope</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Evidence Envelope (.json)</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 max-h-80 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
        <pre>{JSON.stringify(envelope, null, 2)}</pre>
      </div>
    </div>
  );
}
