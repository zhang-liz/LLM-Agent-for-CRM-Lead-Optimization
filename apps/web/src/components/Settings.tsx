import { useState, useEffect } from 'react';
import { Database, Zap, Bell, Shield, Download, Upload, ExternalLink, RefreshCw, BarChart3 } from 'lucide-react';
import { runImprove } from '../services/agentService';
import { useConfig } from '../contexts/ConfigContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ATTRIBUTION_MODES = [
  { value: 'first_touch', label: 'First touch', desc: 'Credit to first interaction only' },
  { value: 'last_touch', label: 'Last touch', desc: 'Credit to most recent interaction only' },
  { value: 'linear', label: 'Linear', desc: 'Equal weight per touch' },
  { value: 'time_decay', label: 'Time decay', desc: 'Recent interactions weighted higher' }
] as const;

const selectClass =
  'll-input py-2.5 text-sm text-slate-900';

export default function Settings() {
  const { config, updateConfig, refreshConfig } = useConfig();
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [improveRunning, setImproveRunning] = useState(false);
  const [improveMessage, setImproveMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((res) => res.ok)
      .then(setBackendConnected)
      .catch(() => setBackendConnected(false));
  }, []);

  const handleRunImprove = async () => {
    setImproveRunning(true);
    setImproveMessage(null);
    const result = await runImprove();
    setImproveMessage(result.success ? (result.message ?? 'Done') : 'Failed');
    if (result.success) await refreshConfig();
    setImproveRunning(false);
  };

  const [hubspotConnected, setHubspotConnected] = useState(false);
  const [notifications, setNotifications] = useState({
    scoreAlerts: true,
    dailyDigest: true,
    lowScoreWarnings: true,
    newLeadAlerts: false
  });

  const [scoreThresholds, setScoreThresholds] = useState({
    excellent: 80,
    good: 60,
    poor: 40
  });

  const card = 'll-card p-6 sm:p-8';

  return (
    <div className="space-y-8">
      <div>
        <p className="ll-label mb-2">Configuration</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-slate-600">Configure scoring, integrations, and notifications.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={card}>
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-slate-900">
            <Database className="h-5 w-5 text-teal-600" strokeWidth={2} />
            HubSpot integration
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium text-slate-900">Connection status</div>
                <div className={`text-sm ${hubspotConnected ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {hubspotConnected ? 'Connected' : 'Not connected'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHubspotConnected(!hubspotConnected)}
                className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
                  hubspotConnected ? 'bg-rose-600 hover:bg-rose-700' : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {hubspotConnected ? 'Disconnect' : 'Connect HubSpot'}
              </button>
            </div>

            {hubspotConnected ? (
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Sync frequency</span>
                  <span className="font-medium text-sky-700">Every 15 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Last sync</span>
                  <span className="font-medium text-emerald-700">2 minutes ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Synced contacts</span>
                  <span className="font-medium text-slate-900">1,247</span>
                </div>
              </div>
            ) : null}

            <p className="text-sm text-slate-500">
              Connect HubSpot to sync lead data and push scores back to your CRM.
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
            >
              <ExternalLink className="h-4 w-4" />
              View integration documentation
            </button>
          </div>
        </div>

        <div className={card}>
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-slate-900">
            <Zap className="h-5 w-5 text-amber-600" strokeWidth={2} />
            AI sentiment engine
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Sentiment provider</label>
              <select className={selectClass}>
                <option>OpenAI GPT-4</option>
                <option>Google Cloud Natural Language</option>
                <option>Custom model</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Processing mode</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="radio" name="processing" defaultChecked className="text-teal-600" />
                  Real-time (recommended)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="radio" name="processing" className="text-teal-600" />
                  Batch (hourly)
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-sm font-medium text-slate-700">Backend</div>
              <div
                className={`text-lg font-semibold ${
                  backendConnected === true
                    ? 'text-emerald-600'
                    : backendConnected === false
                      ? 'text-rose-600'
                      : 'text-slate-400'
                }`}
              >
                {backendConnected === null ? 'Checking…' : backendConnected ? 'Connected' : 'Disconnected'}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {backendConnected
                  ? 'Recommendations and feedback are active.'
                  : 'Start the API server to enable AI recommendations.'}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleRunImprove}
                disabled={!backendConnected || improveRunning}
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:pointer-events-none disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${improveRunning ? 'animate-spin' : ''}`} />
                Run agent improvement
              </button>
              {improveMessage ? <p className="mt-2 text-sm text-slate-600">{improveMessage}</p> : null}
              {(config?.stageWeights && Object.keys(config.stageWeights).length > 0) ||
              (config?.sourceWeights && Object.keys(config.sourceWeights).length > 0) ||
              (config?.mlFeatureImportance && Object.keys(config.mlFeatureImportance).length > 0) ? (
                <div className="mt-3 space-y-1 rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-600">
                  <div className="font-medium text-slate-800">Learned from feedback</div>
                  {config?.stageWeights && Object.keys(config.stageWeights).length > 0 ? (
                    <div>
                      Stage:{' '}
                      {Object.entries(config.stageWeights)
                        .map(([k, v]) => `${k}=${v.toFixed(2)}`)
                        .join(', ')}
                    </div>
                  ) : null}
                  {config?.sourceWeights && Object.keys(config.sourceWeights).length > 0 ? (
                    <div>
                      Source:{' '}
                      {Object.entries(config.sourceWeights)
                        .map(([k, v]) => `${k}=${v.toFixed(2)}`)
                        .join(', ')}
                    </div>
                  ) : null}
                  {config?.mlFeatureImportance && Object.keys(config.mlFeatureImportance).length > 0 ? (
                    <div className="mt-2 border-t border-slate-100 pt-2">
                      ML feature importance:{' '}
                      {Object.entries(config.mlFeatureImportance)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([k, v]) => `${k}=${v.toFixed(2)}`)
                        .join(', ')}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className={card}>
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-slate-900">
            <BarChart3 className="h-5 w-5 text-violet-600" strokeWidth={2} />
            Multi-touch attribution
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Attribution mode</label>
              <select
                value={config?.attributionMode ?? 'time_decay'}
                onChange={(e) =>
                  updateConfig({
                    attributionMode: e.target.value as 'first_touch' | 'last_touch' | 'linear' | 'time_decay'
                  })
                }
                className={selectClass}
              >
                {ATTRIBUTION_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label} – {m.desc}
                  </option>
                ))}
              </select>
            </div>

            {(config?.attributionMode ?? 'time_decay') === 'time_decay' ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Decay rate (λ): {(config?.timeDecayLambda ?? 0.1).toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.02"
                  max="0.5"
                  step="0.01"
                  value={config?.timeDecayLambda ?? 0.1}
                  onChange={(e) => updateConfig({ timeDecayLambda: parseFloat(e.target.value) })}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-600"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Higher = faster decay (recent interactions matter more)
                </p>
              </div>
            ) : null}

            <p className="text-sm text-slate-500">
              How interaction contributions aggregate into lead scores.
            </p>
          </div>
        </div>

        <div className={card}>
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-slate-900">
            <Shield className="h-5 w-5 text-slate-700" strokeWidth={2} />
            Score thresholds
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Excellent: {scoreThresholds.excellent}
              </label>
              <input
                type="range"
                min="70"
                max="100"
                value={scoreThresholds.excellent}
                onChange={(e) =>
                  setScoreThresholds((prev) => ({ ...prev, excellent: parseInt(e.target.value, 10) }))
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Good: {scoreThresholds.good}
              </label>
              <input
                type="range"
                min="40"
                max="80"
                value={scoreThresholds.good}
                onChange={(e) =>
                  setScoreThresholds((prev) => ({ ...prev, good: parseInt(e.target.value, 10) }))
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Poor: {scoreThresholds.poor}
              </label>
              <input
                type="range"
                min="0"
                max="60"
                value={scoreThresholds.poor}
                onChange={(e) =>
                  setScoreThresholds((prev) => ({ ...prev, poor: parseInt(e.target.value, 10) }))
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-600"
              />
            </div>

            <p className="text-sm text-slate-500">Match thresholds to your qualification criteria.</p>
          </div>
        </div>

        <div className={`${card} lg:col-span-2`}>
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-slate-900">
            <Bell className="h-5 w-5 text-slate-700" strokeWidth={2} />
            Notifications
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.entries(notifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <div>
                  <div className="font-medium capitalize text-slate-900">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </div>
                  <div className="text-sm text-slate-500">
                    {key === 'scoreAlerts' && 'Notify when lead scores change significantly'}
                    {key === 'dailyDigest' && 'Daily summary of lead activity'}
                    {key === 'lowScoreWarnings' && 'Alert when leads fall below poor threshold'}
                    {key === 'newLeadAlerts' && 'New lead additions'}
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotifications((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-teal-600 peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-400/30" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ll-card p-6 sm:p-8">
        <h3 className="mb-4 font-display text-lg font-semibold text-slate-900">Data management</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 py-4 font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            <Download className="h-5 w-5" />
            Export lead data
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Upload className="h-5 w-5" />
            Import lead data
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Export CSV or bulk import leads from your existing systems.
        </p>
      </div>
    </div>
  );
}
