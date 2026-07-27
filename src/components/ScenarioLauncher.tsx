import { SCENARIOS } from '../data/scenarios';
import type { ScenarioId } from '../types';
import { Play, Sparkles, AlertCircle, FileText, ShieldAlert, DollarSign } from 'lucide-react';

interface ScenarioLauncherProps {
  selectedScenario: ScenarioId;
  onSelectScenario: (scenarioId: ScenarioId) => void;
  prompt: string;
  onChangePrompt: (prompt: string) => void;
  onSubmit: () => void;
  loading: boolean;
  modelName: string;
}

export function ScenarioLauncher({
  selectedScenario,
  onSelectScenario,
  prompt,
  onChangePrompt,
  onSubmit,
  loading,
  modelName,
}: ScenarioLauncherProps) {
  const activeDef = SCENARIOS.find((s) => s.id === selectedScenario);

  const getScenarioIcon = (id: ScenarioId) => {
    switch (id) {
      case 'scenario_a':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'scenario_b':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'scenario_c':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'scenario_d':
        return <DollarSign className="w-4 h-4 text-indigo-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" /> Scenario Boundary Launcher
        </h3>
        <span className="text-xs text-slate-400">Select demonstration preset:</span>
      </div>

      {/* Scenario Selector Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {SCENARIOS.map((scenario) => {
          const isSelected = selectedScenario === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario.id)}
              className={`flex flex-col items-start gap-1 p-3 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-md'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="font-semibold text-xs text-slate-200 truncate">
                  {scenario.title.split(':')[0]}
                </span>
                {getScenarioIcon(scenario.id)}
              </div>
              <span className="text-[11px] text-slate-400 line-clamp-1">
                Expected: <strong className="text-slate-200">{scenario.expectedDecision}</strong>
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Scenario Info Box */}
      {activeDef && (
        <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-lg text-xs space-y-1.5">
          <div className="flex items-center justify-between font-semibold text-slate-200">
            <span>{activeDef.title}</span>
            <span className="text-indigo-400 font-mono text-[11px]">{activeDef.policyName}</span>
          </div>
          <p className="text-slate-300">{activeDef.description}</p>
          {activeDef.disclaimer && (
            <p className="text-amber-400/90 text-[11px] italic pt-1 border-t border-slate-800/80">
              Note: {activeDef.disclaimer}
            </p>
          )}
        </div>
      )}

      {/* Prompt Editor */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
          <span>Candidate Prompt to Gemini ({modelName})</span>
          <span className="text-[11px] text-slate-500">Editable for custom boundary testing</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => onChangePrompt(e.target.value)}
          rows={4}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
          placeholder="Type or modify prompt to test boundary evaluation..."
        />
      </div>

      {/* Submit Trigger */}
      <button
        onClick={onSubmit}
        disabled={loading || !prompt.trim()}
        className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Executing Gemini Request & VEK Boundary Evaluation...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-white" />
            <span>Execute Gemini API & VEK Qualification Boundary</span>
          </>
        )}
      </button>
    </div>
  );
}
