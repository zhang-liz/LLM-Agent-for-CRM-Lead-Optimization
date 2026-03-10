import { mockTeamMetrics, mockLeads } from '../data/mockData';
import MetricsCards from './MetricsCards';
import { BarChart3, TrendingUp, Users, Target, Activity } from 'lucide-react';

export default function Analytics() {
  const scoreDistribution = {
    'Excellent (80-100)': mockLeads.filter((l) => l.engagementScore >= 80).length,
    'Good (60-79)': mockLeads.filter((l) => l.engagementScore >= 60 && l.engagementScore < 80).length,
    'Average (40-59)': mockLeads.filter((l) => l.engagementScore >= 40 && l.engagementScore < 60).length,
    'Poor (0-39)': mockLeads.filter((l) => l.engagementScore < 40).length
  };

  const stageDistribution = mockLeads.reduce(
    (acc, lead) => {
      acc[lead.stage] = (acc[lead.stage] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const sourceDistribution = mockLeads.reduce(
    (acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const panel = 'll-card p-6 sm:p-8';

  return (
    <div className="space-y-8">
      <div className="ll-card relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/40 to-teal-50/50 p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="ll-label mb-2">Analytics</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Pipeline intelligence
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Distribution and source mix aligned with the dashboard—same data, executive-ready layout.
          </p>
        </div>
      </div>

      <MetricsCards metrics={mockTeamMetrics} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={panel}>
          <h3 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <BarChart3 className="h-5 w-5 text-teal-600" strokeWidth={2} />
            Score distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(scoreDistribution).map(([range, count]) => {
              const percentage = (count / mockLeads.length) * 100;
              const colors = {
                'Excellent (80-100)': 'bg-emerald-400',
                'Good (60-79)': 'bg-sky-400',
                'Average (40-59)': 'bg-amber-300',
                'Poor (0-39)': 'bg-rose-400'
              };

              return (
                <div key={range} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{range}</span>
                    <span className="font-medium tabular-nums text-slate-900">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`${colors[range as keyof typeof colors]} h-2.5 rounded-full transition-all duration-700`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={panel}>
          <h3 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Target className="h-5 w-5 text-violet-600" strokeWidth={2} />
            Pipeline distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(stageDistribution).map(([stage, count]) => {
              const percentage = (count / mockLeads.length) * 100;
              const colors = {
                prospect: 'bg-slate-400',
                qualified: 'bg-sky-400',
                opportunity: 'bg-amber-300',
                customer: 'bg-emerald-400'
              };

              return (
                <div key={stage} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-slate-600">{stage}</span>
                    <span className="font-medium tabular-nums text-slate-900">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`${colors[stage as keyof typeof colors]} h-2.5 rounded-full transition-all duration-700`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={panel}>
          <h3 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Users className="h-5 w-5 text-teal-600" strokeWidth={2} />
            Lead sources
          </h3>
          <div className="space-y-4">
            {Object.entries(sourceDistribution).map(([source, count]) => {
              const percentage = (count / mockLeads.length) * 100;

              return (
                <div key={source} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{source}</span>
                    <span className="font-medium tabular-nums text-slate-900">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-2.5 rounded-full bg-fuchsia-400 transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={panel}>
          <h3 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <TrendingUp className="h-5 w-5 text-amber-600" strokeWidth={2} />
            Performance insights
          </h3>
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-emerald-900">Strong performance</span>
              </div>
              <p className="text-sm leading-relaxed text-emerald-900/80">
                {mockLeads.filter((l) => l.engagementScore >= 80).length} leads have excellent scores (80+)
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-200 bg-cyan-50/80 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-500" />
                <span className="font-medium text-cyan-950">Engagement trend</span>
              </div>
              <p className="text-sm leading-relaxed text-cyan-900/80">
                {mockTeamMetrics.interactionsToday} interactions logged today across the workspace
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="font-medium text-amber-950">Opportunity</span>
              </div>
              <p className="text-sm leading-relaxed text-amber-950/80">
                {mockLeads.filter((l) => l.engagementScore < 60).length} leads could use targeted engagement
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="ll-card border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-6 sm:p-8">
        <h3 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Activity className="h-5 w-5 text-indigo-600" strokeWidth={2} />
          Recommended actions
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-sm">
            <h4 className="font-medium text-indigo-900">Focus on high scorers</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Prioritize follow-up with {mockLeads.filter((l) => l.engagementScore >= 80).length} high-scoring leads
              for faster conversion.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white/80 p-4 shadow-sm">
            <h4 className="font-medium text-amber-950">Re-engage cold leads</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {mockLeads.filter((l) => l.engagementScore < 40).length} leads need nurturing to improve sentiment.
            </p>
          </div>
          <div className="rounded-2xl border border-teal-100 bg-white/80 p-4 shadow-sm md:col-span-2 lg:col-span-1">
            <h4 className="font-medium text-teal-900">Optimize sources</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              LinkedIn and referrals often outperform—shift spend toward what your funnel already rewards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
