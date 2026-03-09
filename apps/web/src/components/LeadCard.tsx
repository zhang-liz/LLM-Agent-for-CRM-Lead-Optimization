import type { Lead } from '@leadloop/shared';
import ScoreGauge from './ScoreGauge';
import { Building, Mail, Calendar, MessageCircle, ExternalLink } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

export default function LeadCard({ lead, onClick }: LeadCardProps) {
  const getStageStyles = (stage: string) => {
    switch (stage) {
      case 'prospect':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'qualified':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'opportunity':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'customer':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatLastInteraction = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(lead);
        }
      }}
      className="ll-card group cursor-pointer p-6 transition hover:border-teal-200/80 hover:shadow-ll-lg"
      onClick={() => onClick(lead)}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 text-sm font-bold text-teal-900 shadow-sm ring-1 ring-teal-200/50">
              {lead.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-display text-lg font-semibold text-slate-900 transition group-hover:text-teal-800">
                {lead.name}
              </h3>
              <p className="truncate text-sm text-slate-500">{lead.position}</p>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
            <div className="flex min-w-0 items-center gap-1.5">
              <Building className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{lead.company}</span>
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate max-w-[11rem]">{lead.email}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${getStageStyles(lead.stage)}`}
            >
              {lead.stage}
            </span>
            <span className="text-xs font-medium text-slate-500">{lead.source}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <ScoreGauge
            score={lead.engagementScore}
            previousScore={lead.previousScore}
            trend={lead.trend}
            size="sm"
            animated={true}
          />
          {lead.mlScore != null ? (
            <span className="text-[11px] font-medium text-violet-600" title="ML conversion score">
              ML {lead.mlScore}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>{formatLastInteraction(lead.lastInteraction)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4 text-slate-400" />
          <span>{lead.totalInteractions} touches</span>
        </div>
        <ExternalLink className="h-4 w-4 opacity-0 transition group-hover:opacity-60" />
      </div>
    </div>
  );
}
