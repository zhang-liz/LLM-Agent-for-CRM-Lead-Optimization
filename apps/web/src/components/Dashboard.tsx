import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Lead, FilterOptions, RecommendationSuggestion, TeamMetrics, Recommendations } from '@leadloop/shared';
import LeadCard from './LeadCard';
import DashboardFilters from './DashboardFilters';
import MetricsCards from './MetricsCards';
import DashboardDemoStudio from './dashboard/DashboardDemoStudio';
import DashboardEngagementBars from './dashboard/DashboardEngagementBars';
import {
  mockLeads,
  mockTeamMetrics,
  mockInteractions,
  applyAttributionToLeads,
  applyDemoScenario,
  type DemoScenarioId
} from '../data/mockData';
import {
  getRecommendations,
  recordFeedback,
  buildFeedbackMetadata,
  getMLScores,
  getSystemStatus
} from '../services/agentService';
import { useConfig } from '../contexts/ConfigContext';
import { Search, ThumbsUp, ThumbsDown, Sparkles, RefreshCw } from 'lucide-react';

interface DashboardProps {
  onLeadSelect: (lead: Lead, suggestion?: RecommendationSuggestion) => void;
}

export default function Dashboard({ onLeadSelect }: DashboardProps) {
  const { config } = useConfig();
  const [activeScenario, setActiveScenario] = useState<DemoScenarioId>('default');
  const [demoTrack, setDemoTrack] = useState<'business' | 'developer'>('business');
  const [leads, setLeads] = useState<Lead[]>(applyDemoScenario(mockLeads, 'default'));
  const [systemStatus, setSystemStatus] = useState<{
    sentimentProvider: string;
    apiOk: boolean;
    attributionMode: string;
    timeDecayLambda: number;
  } | null>(null);

  useEffect(() => {
    const scenarioLeads = applyDemoScenario(mockLeads, activeScenario);
    if (config) {
      const attributed = applyAttributionToLeads(scenarioLeads, mockInteractions, config);
      setLeads(attributed);
      getMLScores(attributed, mockInteractions).then((result) => {
        if (!result?.scores?.length) return;
        const byId = new Map(result.scores.map((s) => [s.leadId, s]));
        setLeads((prev) =>
          prev.map((l) => {
            const s = byId.get(l.id);
            if (!s) return l;
            return { ...l, mlScore: s.mlScore, featureContributions: s.featureContributions };
          })
        );
      });
    } else {
      setLeads(scenarioLeads);
    }
  }, [config, activeScenario]);

  useEffect(() => {
    getSystemStatus().then(setSystemStatus);
  }, []);

  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsOpen, setRecommendationsOpen] = useState(true);

  const suggestionByLead = useMemo(() => {
    const m: Record<string, RecommendationSuggestion> = {};
    recommendations?.suggestions?.forEach((s) => {
      m[s.leadId] = s;
    });
    return m;
  }, [recommendations]);

  const teamMetrics: TeamMetrics = useMemo(
    () => ({
      ...mockTeamMetrics,
      totalLeads: leads.length,
      averageEngagementScore:
        Math.round(leads.reduce((sum, l) => sum + l.engagementScore, 0) / leads.length) || 0,
      highQualityLeads: leads.filter((l) => l.engagementScore > 75).length
    }),
    [leads]
  );

  const fetchRecommendations = useCallback(async () => {
    setRecommendationsLoading(true);
    const result = await getRecommendations(leads, teamMetrics, mockInteractions);
    setRecommendations(result ?? null);
    setRecommendationsLoading(false);
  }, [leads, teamMetrics]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleFeedback = async (e: React.MouseEvent, leadId: string, helpful: boolean) => {
    e.stopPropagation();
    const lead = leads.find((l) => l.id === leadId);
    const interactions = lead ? mockInteractions.filter((i) => i.leadId === lead.id) : [];
    const metadata = lead ? buildFeedbackMetadata(lead, interactions) : undefined;
    await recordFeedback(leadId, helpful ? 'helpful' : 'not_helpful', undefined, metadata);
  };

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    scoreRange: [0, 100],
    stages: [],
    sources: [],
    dateRange: null,
    trend: []
  });
  const [sortBy, setSortBy] = useState<'engagementScore' | 'lastInteraction' | 'name'>('engagementScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const hotLeads = leads.filter((lead) => lead.engagementScore >= 80);
  const warmLeads = leads.filter((lead) => lead.engagementScore >= 60 && lead.engagementScore < 80);
  const coldLeads = leads.filter((lead) => lead.engagementScore < 60);

  const [temperatureFilter, setTemperatureFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');

  const filteredAndSortedLeads = useMemo(() => {
    const filtered = leads.filter((lead) => {
      if (temperatureFilter !== 'all') {
        if (temperatureFilter === 'hot' && lead.engagementScore < 80) return false;
        if (temperatureFilter === 'warm' && (lead.engagementScore < 60 || lead.engagementScore >= 80))
          return false;
        if (temperatureFilter === 'cold' && lead.engagementScore >= 60) return false;
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !lead.name.toLowerCase().includes(searchLower) &&
          !lead.email.toLowerCase().includes(searchLower) &&
          !lead.company.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      if (lead.engagementScore < filters.scoreRange[0] || lead.engagementScore > filters.scoreRange[1]) {
        return false;
      }

      if (filters.stages.length > 0 && !filters.stages.includes(lead.stage)) {
        return false;
      }

      if (filters.sources.length > 0 && !filters.sources.includes(lead.source)) {
        return false;
      }

      if (filters.trend.length > 0 && !filters.trend.includes(lead.trend)) {
        return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case 'engagementScore':
          aValue = a.engagementScore;
          bValue = b.engagementScore;
          break;
        case 'lastInteraction':
          aValue = a.lastInteraction.getTime();
          bValue = b.lastInteraction.getTime();
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });

    return filtered;
  }, [leads, filters, sortBy, sortOrder, temperatureFilter]);

  const demoScript = useMemo(() => {
    if (demoTrack === 'business') {
      return [
        'Set scenario to High Intent Week and show KPI lift in the top row.',
        'Open AI Recommendations and click the top lead to show rationale.',
        'Switch to Stalled Pipeline and explain targeted recovery plan.',
        'Close with expected uplift and confidence from recommendation quality.'
      ];
    }
    return [
      'Open Developer track and show system flow + status indicators.',
      'Trigger refresh recommendations and inspect diagnostics payload.',
      'Open one lead to explain score, trend, intent, and ML contributions.',
      'Capture thumbs up/down feedback to show closed-loop learning.'
    ];
  }, [demoTrack]);

  const expectedUplift = useMemo(() => {
    const hot = leads.filter((l) => l.engagementScore >= 80).length;
    const highQualityRate = leads.length ? hot / leads.length : 0;
    return Math.round((highQualityRate * 12 + 4) * 10) / 10;
  }, [leads]);

  const recommendationConfidence = useMemo(() => {
    if (!recommendations?.suggestions?.length) return 0;
    return Math.min(96, 68 + recommendations.suggestions.length * 2);
  }, [recommendations]);

  const resetDemo = () => {
    setActiveScenario('default');
    setDemoTrack('business');
    setTemperatureFilter('all');
    setSortBy('engagementScore');
    setSortOrder('desc');
    setFilters({
      search: '',
      scoreRange: [0, 100],
      stages: [],
      sources: [],
      dateRange: null,
      trend: []
    });
  };

  const kpiTiles = [
    {
      label: 'Pipeline health',
      value: `${Math.round(teamMetrics.averageEngagementScore)}/100`,
      accent: 'from-sky-50 to-cyan-50 border-sky-100',
      text: 'text-sky-800'
    },
    {
      label: 'Top opportunities',
      value: String(teamMetrics.highQualityLeads),
      accent: 'from-emerald-50 to-teal-50 border-emerald-100',
      text: 'text-emerald-800'
    },
    {
      label: 'Rec. confidence',
      value: `${recommendationConfidence}%`,
      accent: 'from-violet-50 to-purple-50 border-violet-100',
      text: 'text-violet-800'
    },
    {
      label: 'Expected uplift',
      value: `+${expectedUplift}%`,
      accent: 'from-amber-50 to-orange-50 border-amber-100',
      text: 'text-amber-900'
    }
  ];

  const tempBtn = (active: boolean) =>
    active
      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50';

  return (
    <div className="space-y-8">
      <DashboardDemoStudio
        demoTrack={demoTrack}
        onDemoTrack={setDemoTrack}
        activeScenario={activeScenario}
        onScenario={setActiveScenario}
        onReset={resetDemo}
        demoScript={demoScript}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {kpiTiles.map((tile) => (
          <div
            key={tile.label}
            className={`ll-card bg-gradient-to-br ${tile.accent} border-slate-200/80 p-4 sm:p-5`}
          >
            <p className="ll-label text-slate-500">{tile.label}</p>
            <p className={`mt-2 font-display text-2xl font-semibold tabular-nums ${tile.text}`}>
              {tile.value}
            </p>
          </div>
        ))}
      </div>

      {/* Page title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ll-label mb-1">Workspace</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Lead dashboard
          </h1>
          <p className="mt-2 max-w-xl text-slate-600">
            Monitor sentiment, engagement scores, and AI-ranked next actions in one calm view.
          </p>
        </div>
        <div className="ll-card-muted flex items-center gap-3 rounded-2xl px-5 py-4">
          <div className="text-right">
            <div className="font-display text-3xl font-semibold tabular-nums text-slate-900">
              {filteredAndSortedLeads.length}
            </div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Active leads</div>
          </div>
        </div>
      </div>

      {/* Bento: recommendations + engagement bars */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2">
          <div className="ll-card overflow-hidden">
            <button
              type="button"
              onClick={() => setRecommendationsOpen((prev) => !prev)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-50/80"
            >
              <span className="flex items-center gap-2 font-semibold text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <Sparkles className="h-5 w-5" strokeWidth={2} />
                </span>
                AI recommendations
              </span>
              <span className="text-sm font-medium text-slate-500">
                {recommendationsOpen ? 'Hide' : 'Show'}
              </span>
            </button>
            {recommendationsOpen ? (
              <div className="border-t border-slate-100 px-5 pb-5 pt-2">
                {recommendationsLoading ? (
                  <div className="flex items-center gap-2 py-6 text-slate-500">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading recommendations…
                  </div>
                ) : recommendations ? (
                  <div className="space-y-4 pt-2">
                    {recommendations.summary ? (
                      <p className="text-sm leading-relaxed text-slate-600">{recommendations.summary}</p>
                    ) : null}
                    {recommendations.diagnostics ? (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>
                          Engine{' '}
                          <span className="font-medium text-slate-800">
                            {recommendations.diagnostics.recommendationEngine}
                          </span>
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span>
                          Sentiment{' '}
                          <span className="font-medium text-slate-800">
                            {recommendations.diagnostics.sentimentProvider}
                          </span>
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span>
                          Cache{' '}
                          <span className="font-medium text-slate-800">
                            {recommendations.diagnostics.cached ? 'hit' : 'miss'}
                          </span>
                        </span>
                      </div>
                    ) : null}
                    <ul className="space-y-2">
                      {recommendations.suggestions.map((s) => {
                        const lead = leads.find((l) => l.id === s.leadId);
                        return (
                          <li
                            key={s.leadId}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 transition hover:border-teal-200 hover:bg-white"
                          >
                            <button
                              type="button"
                              className="min-w-0 flex-1 text-left"
                              onClick={() => lead && onLeadSelect(lead, s)}
                            >
                              <span className="block truncate font-medium text-slate-900">
                                {lead?.name ?? s.leadId}
                              </span>
                              <span className="text-sm text-slate-500">
                                {s.action} — {s.reason}
                              </span>
                            </button>
                            <div className="flex shrink-0 items-center gap-0.5">
                              <button
                                type="button"
                                onClick={(e) => handleFeedback(e, s.leadId, true)}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                                title="Helpful"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleFeedback(e, s.leadId, false)}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                title="Not helpful"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      type="button"
                      onClick={fetchRecommendations}
                      disabled={recommendationsLoading}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${recommendationsLoading ? 'animate-spin' : ''}`} />
                      Refresh recommendations
                    </button>
                  </div>
                ) : (
                  <p className="py-6 text-sm text-slate-500">
                    Start the backend server to see AI recommendations.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
        <div className="lg:col-span-1">
          <DashboardEngagementBars leads={leads} />
        </div>
      </div>

      <MetricsCards metrics={teamMetrics} />

      {/* Temperature */}
      <div className="ll-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span className="text-sm font-semibold text-slate-700">Lead temperature</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTemperatureFilter('all')}
            className={`ll-pill ${tempBtn(temperatureFilter === 'all')}`}
          >
            All ({leads.length})
          </button>
          <button
            type="button"
            onClick={() => setTemperatureFilter('hot')}
            className={`ll-pill ${tempBtn(temperatureFilter === 'hot')}`}
          >
            Hot ({hotLeads.length})
          </button>
          <button
            type="button"
            onClick={() => setTemperatureFilter('warm')}
            className={`ll-pill ${tempBtn(temperatureFilter === 'warm')}`}
          >
            Warm ({warmLeads.length})
          </button>
          <button
            type="button"
            onClick={() => setTemperatureFilter('cold')}
            className={`ll-pill ${tempBtn(temperatureFilter === 'cold')}`}
          >
            Cold ({coldLeads.length})
          </button>
        </div>
      </div>

      {/* Search & sort */}
      <div className="ll-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads…"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="ll-input pl-10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                (e.target.value as 'engagementScore' | 'lastInteraction' | 'name') || 'engagementScore'
              )
            }
            className="ll-input w-auto min-w-[10rem] py-2 text-sm"
          >
            <option value="engagementScore">Sort by score</option>
            <option value="lastInteraction">Sort by last touch</option>
            <option value="name">Sort by name</option>
          </select>
          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="ll-btn-secondary min-w-[2.75rem] px-3"
            aria-label={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      <DashboardFilters filters={filters} onFiltersChange={setFilters} leads={leads} />

      {demoTrack === 'developer' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="ll-card-muted p-5">
            <h3 className="font-display text-base font-semibold text-slate-900">System view</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Interactions → Sentiment and intent → Engagement scoring → Recommendation engine → Feedback loop
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Each lead decision is derived from signals, then improved with user feedback.
            </p>
          </div>
          <div className="ll-card-muted p-5">
            <h3 className="font-display text-base font-semibold text-slate-900">Diagnostics</h3>
            <dl className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between gap-2">
                <dt>API</dt>
                <dd className="font-medium text-slate-900">
                  {systemStatus?.apiOk ? 'Online' : 'Offline / fallback'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Sentiment</dt>
                <dd className="font-medium text-slate-900">{systemStatus?.sentimentProvider ?? 'keyword'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Attribution</dt>
                <dd className="font-medium text-slate-900">
                  {systemStatus?.attributionMode ?? 'time_decay'} (λ {systemStatus?.timeDecayLambda ?? 0.1})
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Engine</dt>
                <dd className="font-medium text-slate-900">
                  {recommendations?.diagnostics?.recommendationEngine ?? 'heuristic'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Cache</dt>
                <dd className="font-medium text-slate-900">
                  {recommendations?.diagnostics?.cached ? 'hit' : 'miss'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="font-display mb-4 text-xl font-semibold text-slate-900">Pipeline</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredAndSortedLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onLeadSelect(lead, suggestionByLead[lead.id])}
            />
          ))}
        </div>
      </div>

      {filteredAndSortedLeads.length === 0 ? (
        <div className="ll-card-muted py-14 text-center">
          <p className="font-medium text-slate-700">No leads match</p>
          <p className="mt-1 text-sm text-slate-500">Try adjusting filters or temperature.</p>
        </div>
      ) : null}
    </div>
  );
}
