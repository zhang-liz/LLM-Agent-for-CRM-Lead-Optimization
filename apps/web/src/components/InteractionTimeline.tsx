import type { Interaction } from '@leadloop/shared';
import { Mail, MessageCircle, Phone, HelpCircle, ExternalLink } from 'lucide-react';

interface InteractionTimelineProps {
  interactions: Interaction[];
}

export default function InteractionTimeline({ interactions }: InteractionTimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'email':
        return Mail;
      case 'chat':
        return MessageCircle;
      case 'call':
        return Phone;
      case 'support_ticket':
        return HelpCircle;
      default:
        return MessageCircle;
    }
  };

  const getSentimentStyles = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'negative':
        return 'text-rose-800 bg-rose-50 border-rose-200';
      default:
        return 'text-amber-900 bg-amber-50 border-amber-200';
    }
  };

  const sortedInteractions = [...interactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (interactions.length === 0) {
    return (
      <div className="ll-card-muted py-14 text-center">
        <MessageCircle className="mx-auto mb-4 h-12 w-12 text-slate-300" strokeWidth={1.5} />
        <h3 className="font-display text-lg font-semibold text-slate-700">No interactions yet</h3>
        <p className="mt-1 text-sm text-slate-500">They will appear here as they are processed.</p>
      </div>
    );
  }

  return (
    <div className="ll-card p-6 sm:p-8">
      <h3 className="font-display mb-6 text-lg font-semibold text-slate-900">Interaction timeline</h3>

      <div className="space-y-6">
        {sortedInteractions.map((interaction, index) => {
          const Icon = getIcon(interaction.type);
          const isLast = index === sortedInteractions.length - 1;

          return (
            <div key={interaction.id} className="relative">
              {!isLast ? (
                <div className="absolute left-6 top-14 bottom-0 w-px bg-slate-200" aria-hidden />
              ) : null}

              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 ${getSentimentStyles(
                    interaction.sentiment
                  )}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>

                <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium capitalize text-slate-900">
                        {interaction.type.replace('_', ' ')}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getSentimentStyles(
                          interaction.sentiment
                        )}`}
                      >
                        {interaction.sentiment}
                      </span>
                      <span className="text-sm text-slate-500">
                        Score {(interaction.sentimentScore * 100).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>{interaction.timestamp.toLocaleDateString()}</span>
                      <span>{interaction.timestamp.toLocaleTimeString()}</span>
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  {interaction.metadata?.subject ? (
                    <div className="mb-2 text-sm font-medium text-slate-700">
                      Subject: {interaction.metadata.subject}
                    </div>
                  ) : null}

                  <div className="leading-relaxed text-slate-600">{interaction.content}</div>

                  {interaction.intentSignals && interaction.intentSignals.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {interaction.intentSignals.map((s, idx) => (
                        <span
                          key={idx}
                          className={`rounded-lg border px-2 py-0.5 text-xs font-medium ${
                            s.strength === 'high'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : s.strength === 'low'
                                ? 'border-amber-200 bg-amber-50 text-amber-900'
                                : 'border-sky-200 bg-sky-50 text-sky-800'
                          }`}
                          title={`${s.intent} (${s.strength})`}
                        >
                          {s.intent.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3 text-xs text-slate-400">Source: {interaction.source}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
