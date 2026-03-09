import { useEffect, useState } from 'react';
import type { TeamMetrics } from '@leadloop/shared';
import { Users, TrendingUp, Target, Activity, Zap, BarChart3 } from 'lucide-react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

function AnimatedNumber({ value, duration = 1200, suffix = '', prefix = '' }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const steps = 40;
    const increment = value / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setDisplayValue(Math.min(value, increment * currentStep));

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span className="font-display text-3xl font-semibold tabular-nums text-slate-900">
      {prefix}
      {Math.round(displayValue)}
      {suffix}
    </span>
  );
}

interface MetricsCardsProps {
  metrics: TeamMetrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Total leads',
      value: metrics.totalLeads,
      icon: Users,
      accent: 'bg-sky-50 text-sky-700 border-sky-100',
      iconWrap: 'bg-white border-sky-100'
    },
    {
      title: 'Average score',
      value: metrics.averageEngagementScore,
      icon: BarChart3,
      accent: 'bg-emerald-50 text-emerald-800 border-emerald-100',
      iconWrap: 'bg-white border-emerald-100'
    },
    {
      title: 'High quality',
      value: metrics.highQualityLeads,
      icon: Target,
      accent: 'bg-violet-50 text-violet-800 border-violet-100',
      iconWrap: 'bg-white border-violet-100'
    },
    {
      title: 'Score improvement',
      value: metrics.scoreImprovement,
      icon: TrendingUp,
      accent: 'bg-amber-50 text-amber-900 border-amber-100',
      iconWrap: 'bg-white border-amber-100',
      prefix: '+',
      suffix: '%'
    },
    {
      title: 'Interactions today',
      value: metrics.interactionsToday,
      icon: Activity,
      accent: 'bg-cyan-50 text-cyan-800 border-cyan-100',
      iconWrap: 'bg-white border-cyan-100'
    },
    {
      title: 'Conversion rate',
      value: metrics.conversionRate,
      icon: Zap,
      accent: 'bg-orange-50 text-orange-900 border-orange-100',
      iconWrap: 'bg-white border-orange-100',
      suffix: '%'
    }
  ];

  return (
    <div>
      <h2 className="font-display mb-4 text-xl font-semibold text-slate-900">Team metrics</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`ll-card border bg-gradient-to-br p-6 transition hover:-translate-y-0.5 hover:shadow-ll-lg ${card.accent}`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm ${card.iconWrap}`}
              >
                <card.icon className="h-5 w-5 opacity-90" strokeWidth={1.75} />
              </div>
            </div>
            <div className="mb-1">
              <AnimatedNumber
                value={card.value}
                prefix={card.prefix || ''}
                suffix={card.suffix || ''}
              />
            </div>
            <div className="text-sm font-medium text-slate-600">{card.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
