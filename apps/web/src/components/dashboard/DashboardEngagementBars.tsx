/** Simple decorative bar chart for pipeline “overview” — derived from lead score buckets */
interface DashboardEngagementBarsProps {
  leads: { engagementScore: number }[];
}

export default function DashboardEngagementBars({ leads }: DashboardEngagementBarsProps) {
  const buckets = [0, 0, 0, 0, 0];
  for (const l of leads) {
    const i = Math.min(4, Math.floor(l.engagementScore / 20));
    buckets[i] += 1;
  }
  const max = Math.max(1, ...buckets);
  const labels = ['0–19', '20–39', '40–59', '60–79', '80–100'];
  const barColors = [
    'bg-rose-200',
    'bg-amber-200',
    'bg-sky-200',
    'bg-teal-200',
    'bg-emerald-300',
  ];

  return (
    <div className="ll-card flex h-full flex-col p-6">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="ll-label mb-1">Overview</p>
          <h3 className="font-display text-lg font-semibold text-slate-900">Engagement spread</h3>
          <p className="mt-1 text-xs text-slate-500">Score distribution across the pipeline</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
          Live
        </span>
      </div>
      <div className="flex flex-1 items-end justify-between gap-2 pt-2">
        {buckets.map((count, idx) => {
          const h = Math.round((count / max) * 100);
          return (
            <div key={labels[idx]} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-28 w-full items-end justify-center rounded-t-lg bg-slate-100/80">
                <div
                  className={`w-[72%] max-w-[2.5rem] rounded-t-md ${barColors[idx]} transition-all duration-500`}
                  style={{ height: `${Math.max(8, h)}%` }}
                  title={`${labels[idx]}: ${count}`}
                />
              </div>
              <span className="text-[10px] font-medium text-slate-500">{labels[idx]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
