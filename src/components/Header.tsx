import { ShieldCheck, Cpu, Cloud, Lock, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  modelName: string;
  deploymentId: string;
}

export function Header({ modelName, deploymentId }: HeaderProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-emerald-500 p-2 rounded-lg text-white shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-50">VEK Assurance Cloud</h1>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  XPRIZE XP
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Deterministic post-generation qualification boundary for AI-generated outputs
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-md text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Model:</span>
            <span className="font-mono text-indigo-300 font-medium">{modelName}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-md text-slate-300">
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">Host:</span>
            <span className="font-mono text-sky-300 font-medium">Google Cloud Run</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-md text-slate-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Profile:</span>
            <span className="font-mono text-emerald-300 font-medium">RFC 8785 JCS</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-md text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>GUTS Deterministic Technology LLC</span>
          </div>
        </div>
      </div>
    </header>
  );
}
