import { RotateCcw, Code2, Presentation } from 'lucide-react';
import { demoScenarios, type DemoScenarioId } from '../../data/mockData';

type DemoTrack = 'business' | 'developer';

interface DashboardDemoStudioProps {
  demoTrack: DemoTrack;
  onDemoTrack: (t: DemoTrack) => void;
  activeScenario: DemoScenarioId;
  onScenario: (id: DemoScenarioId) => void;
  onReset: () => void;
  demoScript: string[];
}

export default function DashboardDemoStudio({
  demoTrack,
  onDemoTrack,
  activeScenario,
  onScenario,
  onReset,
  demoScript,
}: DashboardDemoStudioProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="ll-card relative overflow-hidden xl:col-span-2">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-teal-200/40 to-indigo-200/30 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="ll-label mb-1.5">Demo</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Lead Demo Studio
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                Run business or developer walkthroughs with deterministic scenarios and guided scripts.
              </p>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="ll-btn-secondary shrink-0 gap-2"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={2} />
              Reset demo
            </button>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <p className="ll-label mb-2">Track</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onDemoTrack('business')}
                  className={`ll-pill ${
                    demoTrack === 'business' ? 'll-pill-active' : 'll-pill-ghost'
                  }`}
                >
                  <Presentation className="h-4 w-4" strokeWidth={2} />
                  Business
                </button>
                <button
                  type="button"
                  onClick={() => onDemoTrack('developer')}
                  className={`ll-pill ${
                    demoTrack === 'developer' ? 'll-pill-active' : 'll-pill-ghost'
                  }`}
                >
                  <Code2 className="h-4 w-4" strokeWidth={2} />
                  Developer
                </button>
              </div>
            </div>
            <div>
              <p className="ll-label mb-2">Scenarios</p>
              <div className="flex flex-wrap gap-2">
                {demoScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => onScenario(scenario.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeScenario === scenario.id
                        ? 'border-teal-400 bg-teal-50 text-teal-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    title={scenario.description}
                  >
                    {scenario.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ll-card flex flex-col p-6 sm:p-7">
        <p className="ll-label mb-2">Script</p>
        <h3 className="font-display text-lg font-semibold text-slate-900">
          {demoTrack === 'business' ? 'Business flow' : 'Developer flow'}
        </h3>
        <ol className="mt-4 flex-1 list-decimal space-y-2.5 pl-4 text-sm leading-relaxed text-slate-600">
          {demoScript.map((step) => (
            <li key={step} className="marker:text-teal-600">
              {step}
            </li>
          ))}
        </ol>
        <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
          Success:{' '}
          {demoTrack === 'business' ? 'value story in under 60s' : 'system understanding in under 3m'}
        </p>
      </div>
    </div>
  );
}
