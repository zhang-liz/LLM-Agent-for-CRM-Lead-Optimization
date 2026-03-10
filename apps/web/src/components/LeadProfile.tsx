import { useState, useMemo } from 'react';
import type { Lead, RecommendationSuggestion } from '@leadloop/shared';
import ScoreGauge from './ScoreGauge';
import InteractionTimeline from './InteractionTimeline';
import ScoreHistoryChart from './ScoreHistoryChart';
import { recordFeedback, buildFeedbackMetadata } from '../services/agentService';
import { ArrowLeft, Building, Mail, Calendar, ExternalLink, MessageCircle, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { mockInteractions, generateScoreHistory } from '../data/mockData';

interface LeadProfileProps {
  lead: Lead;
  onBack: () => void;
  suggestion?: RecommendationSuggestion | null;
}

type ScoreBreakdownRow = { label: string; score: number; color: string; contribution?: string };

export default function LeadProfile({ lead, onBack, suggestion }: LeadProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'interactions' | 'history'>('overview');

  const leadInteractions = useMemo(() => {
    return mockInteractions.filter((interaction) => interaction.leadId === lead.id);
  }, [lead.id]);

  const scoreHistory = useMemo(() => {
    return generateScoreHistory(lead.id);
  }, [lead.id]);

  const scoreBreakdown = useMemo((): ScoreBreakdownRow[] => {
    const fc = lead.featureContributions;
    if (fc && Object.keys(fc).length > 0) {
      const entries = Object.entries(fc).filter(([k]) => k !== 'bias');
      const maxAbs = Math.max(...entries.map(([, v]) => Math.abs(v)), 0.01);
      const palette = [
        'bg-emerald-400',
        'bg-teal-400',
        'bg-violet-400',
        'bg-amber-400',
        'bg-rose-400',
        'bg-sky-400',
        'bg-fuchsia-400',
        'bg-lime-400'
      ];
      return entries.map(([key, value], i) => ({
        label: key.startsWith('stage_') ? `Stage · ${key.replace('stage_', '')}` : key.replace(/_/g, ' '),
        score: Math.min(100, Math.round((Math.abs(value) / maxAbs) * 100)),
        color: palette[i % palette.length],
        contribution: value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2)
      }));
    }
    const fallback: ScoreBreakdownRow[] = [
      { label: 'Positivity', score: Math.min(100, Math.round(lead.engagementScore * 0.9)), color: 'bg-emerald-400' },
      { label: 'Engagement', score: Math.min(100, Math.round(lead.engagementScore * 0.85)), color: 'bg-teal-400' },
      { label: 'Responsiveness', score: Math.min(100, Math.round(lead.engagementScore * 0.88)), color: 'bg-violet-400' },
      { label: 'Interest level', score: Math.min(100, Math.round(lead.engagementScore * 0.8)), color: 'bg-amber-400' }
    ];
    return fallback;
  }, [lead]);

  const getStageStyles = (stage: string) => {
    switch (stage) {
      case 'prospect':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'qualified':
        return 'bg-sky-50 text-sky-900 border-sky-200';
      case 'opportunity':
        return 'bg-amber-50 text-amber-950 border-amber-200';
      case 'customer':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'interactions', label: 'Interactions' },
    { id: 'history', label: 'Score history' }
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onBack}
          className="ll-btn-secondary self-start gap-2"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back
        </button>
        <div>
          <p className="ll-label mb-1">Lead profile</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Engagement detail
          </h1>
          <p className="mt-1 text-slate-600">Score breakdown, interactions, and history in one place.</p>
        </div>
      </div>

      <div className="ll-card relative overflow-hidden bg-gradient-to-br from-white via-teal-50/30 to-indigo-50/40 p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-200/25 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-400 to-indigo-500 text-2xl font-bold text-white shadow-lg shadow-teal-900/15">
              {lead.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-slate-900">{lead.name}</h2>
                <p className="text-lg text-slate-600">{lead.position}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 sm:gap-x-8 sm:gap-y-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <Building className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>{lead.company}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="break-all">{lead.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>Last active: {lead.lastInteraction.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <MessageCircle className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>{lead.totalInteractions} total interactions</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-sm font-medium capitalize ${getStageStyles(lead.stage)}`}
                >
                  {lead.stage}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">
                  {lead.source}
                </span>
                {lead.intentSummary ? (
                  <span
                    className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm text-sky-900"
                    title="Buyer intent signals"
                  >
                    {lead.intentSummary}
                  </span>
                ) : null}
                {lead.hubspotId ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-900 transition hover:bg-orange-100"
                  >
                    <ExternalLink className="h-3 w-3" />
                    HubSpot
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mx-auto text-center lg:mx-0 lg:text-right">
            <ScoreGauge score={lead.engagementScore} previousScore={lead.previousScore} trend={lead.trend} size="lg" />
            <div className="mt-3">
              <div className="mb-1 text-sm font-medium text-slate-500">Lead score</div>
              {lead.mlScore != null ? (
                <div className="mb-1 text-xs font-medium text-violet-700">ML score: {lead.mlScore}</div>
              ) : null}
              <div className="text-xs text-slate-400">Based on latest interactions</div>
            </div>
          </div>
        </div>

        {suggestion ? (
          <div className="relative mt-8 flex flex-col gap-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Sparkles className="h-5 w-5 shrink-0 text-amber-600" strokeWidth={2} />
              <div>
                <div className="text-sm font-semibold text-amber-950">Suggested: {suggestion.action}</div>
                <div className="text-xs text-slate-600">{suggestion.reason}</div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  recordFeedback(lead.id, 'helpful', undefined, buildFeedbackMetadata(lead, leadInteractions))
                }
                className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-emerald-600"
                title="Helpful"
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  recordFeedback(lead.id, 'not_helpful', undefined, buildFeedbackMetadata(lead, leadInteractions))
                }
                className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-rose-600"
                title="Not helpful"
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-t-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'border border-b-0 border-slate-200 bg-white text-teal-800 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-96">
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="ll-card p-6 sm:p-8">
              <h3 className="font-display mb-1 text-lg font-semibold text-slate-900">Score breakdown</h3>
              <p className="mb-4 text-xs text-slate-500">
                {lead.featureContributions
                  ? 'ML feature contributions (linear terms)'
                  : 'Illustrative weights when ML data is unavailable'}
              </p>
              <div className="space-y-4">
                {scoreBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="capitalize text-slate-600">{item.label}</span>
                      <span className="font-medium tabular-nums text-slate-900">
                        {item.score}%
                        {item.contribution != null ? (
                          <span className="ml-2 font-normal text-slate-400">({item.contribution})</span>
                        ) : null}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`${item.color} h-2.5 rounded-full transition-all duration-700`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ll-card p-6 sm:p-8">
              <h3 className="font-display mb-4 text-lg font-semibold text-slate-900">Recent activity</h3>
              <div className="space-y-3">
                {leadInteractions.slice(0, 3).map((interaction) => (
                  <div
                    key={interaction.id}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3"
                  >
                    <div
                      className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                        interaction.sentiment === 'positive'
                          ? 'bg-emerald-400'
                          : interaction.sentiment === 'negative'
                            ? 'bg-rose-400'
                            : 'bg-amber-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-sm font-medium capitalize text-slate-900">
                          {interaction.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-500">
                          {interaction.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-slate-600">{interaction.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'interactions' ? (
          <InteractionTimeline interactions={leadInteractions} />
        ) : null}

        {activeTab === 'history' ? <ScoreHistoryChart history={scoreHistory} /> : null}
      </div>
    </div>
  );
}
