import { useMemo } from 'react';
import type { ScoreHistory } from '@leadloop/shared';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ScoreHistoryChartProps {
  history: ScoreHistory[];
}

export default function ScoreHistoryChart({ history }: ScoreHistoryChartProps) {
  const chartData = useMemo(() => {
    if (history.length === 0) {
      return {
        points: '',
        viewBox: '0 0 400 200',
        minScore: 0,
        maxScore: 100,
        width: 400,
        height: 200,
        padding: 40
      };
    }

    const minScore = Math.min(...history.map((h) => h.score));
    const maxScore = Math.max(...history.map((h) => h.score));
    const scoreRange = maxScore - minScore || 1;

    const width = 800;
    const height = 200;
    const padding = 40;

    const points = history
      .map((item, index) => {
        const x = padding + (index * (width - 2 * padding)) / (history.length - 1);
        const y = height - padding - ((item.score - minScore) / scoreRange) * (height - 2 * padding);
        return `${x},${y}`;
      })
      .join(' ');

    return {
      points,
      viewBox: `0 0 ${width} ${height}`,
      minScore,
      maxScore,
      width,
      height,
      padding
    };
  }, [history]);

  const totalChange = history.length > 1 ? history[history.length - 1].score - history[0].score : 0;
  const averageScore = history.length > 0 ? history.reduce((sum, h) => sum + h.score, 0) / history.length : 0;

  if (history.length === 0) {
    return (
      <div className="ll-card-muted py-14 text-center">
        <p className="font-medium text-slate-700">No score history yet</p>
        <p className="mt-1 text-sm text-slate-500">Historical data appears as interactions are processed.</p>
      </div>
    );
  }

  const statCard = 'll-card-muted p-4 sm:p-5';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className={statCard}>
          <div className="mb-2 flex items-center gap-2">
            {totalChange >= 0 ? (
              <TrendingUp className="h-5 w-5 text-emerald-600" strokeWidth={2} />
            ) : (
              <TrendingDown className="h-5 w-5 text-rose-600" strokeWidth={2} />
            )}
            <span className="text-sm text-slate-500">30-day change</span>
          </div>
          <div
            className={`font-display text-2xl font-semibold tabular-nums ${
              totalChange >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {totalChange >= 0 ? '+' : ''}
            {totalChange.toFixed(1)}
          </div>
        </div>

        <div className={statCard}>
          <div className="mb-2 text-sm text-slate-500">Average score</div>
          <div className="font-display text-2xl font-semibold tabular-nums text-teal-700">
            {averageScore.toFixed(1)}
          </div>
        </div>

        <div className={statCard}>
          <div className="mb-2 text-sm text-slate-500">Current score</div>
          <div className="font-display text-2xl font-semibold tabular-nums text-slate-900">
            {history[history.length - 1]?.score.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="ll-card p-6 sm:p-8">
        <h3 className="font-display mb-6 text-lg font-semibold text-slate-900">Score trend (last 30 days)</h3>

        <div className="relative">
          <svg viewBox={chartData.viewBox} className="h-56 w-full">
            {[0, 25, 50, 75, 100].map((score) => {
              const y =
                chartData.height -
                chartData.padding -
                ((score - chartData.minScore) / (chartData.maxScore - chartData.minScore || 1)) *
                  (chartData.height - 2 * chartData.padding);
              return (
                <g key={score}>
                  <line
                    x1={chartData.padding}
                    y1={y}
                    x2={chartData.width - chartData.padding}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={chartData.padding - 10}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="12"
                    textAnchor="end"
                  >
                    {score}
                  </text>
                </g>
              );
            })}

            <path
              d={`M${chartData.padding},${chartData.height - chartData.padding} L${chartData.points} L${
                chartData.width - chartData.padding
              },${chartData.height - chartData.padding} Z`}
              fill="url(#scoreGradientLight)"
              opacity="0.35"
            />

            <polyline
              points={chartData.points}
              fill="none"
              stroke="#0d9488"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {history.map((item, index) => {
              const x =
                chartData.padding +
                (index * (chartData.width - 2 * chartData.padding)) / (history.length - 1);
              const y =
                chartData.height -
                chartData.padding -
                ((item.score - chartData.minScore) / (chartData.maxScore - chartData.minScore || 1)) *
                  (chartData.height - 2 * chartData.padding);

              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#ffffff"
                    stroke="#0d9488"
                    strokeWidth="2"
                    className="cursor-pointer transition hover:r-[5]"
                  />
                  {item.majorEvents && item.majorEvents.length > 0 ? (
                    <circle cx={x} cy={y - 14} r="3" fill="#d97706" className="animate-pulse" />
                  ) : null}
                </g>
              );
            })}

            <defs>
              <linearGradient id="scoreGradientLight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0d9488" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
          <span>30 days ago</span>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-teal-600" />
              <span>Lead score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>Major events</span>
            </div>
          </div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
