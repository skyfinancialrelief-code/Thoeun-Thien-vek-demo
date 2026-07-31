import { useState, useEffect } from 'react';
import type { EvaluationResponse, ScenarioId } from './types';
import { SCENARIOS } from './data/scenarios';
import { Header } from './components/Header';
import { ClaimBoundaryBanner } from './components/ClaimBoundaryBanner';
import { ScenarioLauncher } from './components/ScenarioLauncher';
import { EvaluationResults } from './components/EvaluationResults';
import { ReplayPanel } from './components/ReplayPanel';
import { EvidenceInspector } from './components/EvidenceInspector';
import { DocumentationDrawer } from './components/DocumentationDrawer';

export default function App() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>('scenario_a');
  const [prompt, setPrompt] = useState<string>(SCENARIOS[0].defaultPrompt);
  const [loading, setLoading] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [health, setHealth] = useState<{ geminiModel: string; deploymentId: string; cloudRunActive: boolean }>({
    geminiModel: 'gemini-3.6-flash',
    deploymentId: 'local-development',
    cloudRunActive: false,
  });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.geminiModel) {
          setHealth({
            geminiModel: data.geminiModel,
            deploymentId: data.deploymentId || 'local-development',
            cloudRunActive: Boolean(data.cloudRunActive),
          });
        }
      })
      .catch((err) => console.error('Health fetch error:', err));
  }, []);

  const handleSelectScenario = (scenarioId: ScenarioId) => {
    setSelectedScenario(scenarioId);
    const def = SCENARIOS.find((s) => s.id === scenarioId);
    if (def) {
      setPrompt(def.defaultPrompt);
    }
  };

  const handleExecuteEvaluation = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          scenarioId: selectedScenario,
        }),
      });

      const data: EvaluationResponse = await res.json();
      setEvaluation(data);
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* App Header */}
      <Header
        modelName={health.geminiModel}
        deploymentId={health.deploymentId}
        cloudRunActive={health.cloudRunActive}
      />

      {/* Mandatory Scientific Claim Boundary Callout */}
      <ClaimBoundaryBanner />

      {/* Main Workspace */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1 space-y-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: Scenario Launcher */}
          <div className="lg:col-span-5 space-y-6">
            <ScenarioLauncher
              selectedScenario={selectedScenario}
              onSelectScenario={handleSelectScenario}
              prompt={prompt}
              onChangePrompt={setPrompt}
              onSubmit={handleExecuteEvaluation}
              loading={loading}
              modelName={health.geminiModel}
            />
          </div>

          {/* Right Column: Results Dashboard */}
          <div className="lg:col-span-7 space-y-6">
            {evaluation ? (
              <>
                <EvaluationResults evaluation={evaluation} />
                <ReplayPanel
                  evaluation={evaluation}
                  onUpdateEnvelope={(updatedEnvelope) =>
                    setEvaluation((prev) => (prev ? { ...prev, evidenceEnvelope: updatedEnvelope } : null))
                  }
                />
                <EvidenceInspector envelope={evaluation.evidenceEnvelope} />
              </>
            ) : (
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center space-y-3 shadow-lg my-auto flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 rounded-full bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <span className="text-xl font-bold">VEK</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-200">Ready for Boundary Evaluation</h3>
                <p className="text-xs text-slate-400 max-w-md">
                  Select a demonstration scenario on the left and click <strong>&quot;Execute Gemini API &amp; VEK Qualification Boundary&quot;</strong> to generate captured output, evaluate disclosed demonstration policies, and verify replay consistency.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* XPRIZE Compliance Repository Drawer */}
        <DocumentationDrawer />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        VEK Assurance Cloud &copy; 2026 GUTS Deterministic Technology LLC | Founder: Thoeun Thien | Build with Gemini XPRIZE Submission
      </footer>
    </div>
  );
}
