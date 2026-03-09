import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  previousScore?: number;
  trend: 'up' | 'down' | 'stable';
  size?: 'sm' | 'md' | 'lg';
  showTrend?: boolean;
  animated?: boolean;
}

export default function ScoreGauge({
  score,
  previousScore,
  trend,
  size = 'md',
  showTrend = true,
  animated = true
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    if (animated) {
      const duration = 800;
      const steps = 40;
      const increment = score / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setAnimatedScore(Math.min(score, increment * currentStep));

        if (currentStep >= steps) {
          clearInterval(timer);
          setIsJumping(true);
          setTimeout(() => setIsJumping(false), 400);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setAnimatedScore(score);
    }
  }, [score, animated]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg'
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-700';
    if (s >= 60) return 'text-sky-700';
    if (s >= 40) return 'text-amber-700';
    return 'text-rose-600';
  };

  const getStrokeColor = (s: number) => {
    if (s >= 80) return 'stroke-emerald-500';
    if (s >= 60) return 'stroke-sky-500';
    if (s >= 40) return 'stroke-amber-500';
    return 'stroke-rose-500';
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />;
      case 'down':
        return <TrendingDown className="h-3.5 w-3.5 text-rose-600" strokeWidth={2} />;
      default:
        return <Minus className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />;
    }
  };

  const scoreChange = previousScore ? score - previousScore : 0;

  return (
    <div className="relative flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]} ${isJumping ? 'animate-bounce' : ''}`}>
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-200"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${getStrokeColor(animatedScore)} ${
              animated ? 'transition-all duration-700 ease-out' : ''
            }`}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-semibold tabular-nums ${getScoreColor(animatedScore)} ${textSizeClasses[size]}`}>
            {Math.round(animatedScore)}
          </span>
        </div>
      </div>

      {showTrend ? (
        <div className="mt-1.5 flex items-center gap-1">
          {getTrendIcon()}
          {scoreChange !== 0 ? (
            <span className={`text-[10px] font-medium ${scoreChange > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {scoreChange > 0 ? '+' : ''}
              {scoreChange.toFixed(1)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
