import { useState } from 'react';
import type { Lead, FilterOptions } from '@leadloop/shared';
import { Filter, X } from 'lucide-react';

interface DashboardFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  leads: Lead[];
}

export default function DashboardFilters({ filters, onFiltersChange, leads }: DashboardFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const allStages = Array.from(new Set(leads.map((lead) => lead.stage)));
  const allSources = Array.from(new Set(leads.map((lead) => lead.source)));
  const allTrends = ['up', 'down', 'stable'];

  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <K extends keyof FilterOptions>(key: K, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as FilterOptions[K]);
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      scoreRange: [0, 100],
      stages: [],
      sources: [],
      dateRange: null,
      trend: []
    });
  };

  const hasActiveFilters =
    filters.scoreRange[0] > 0 ||
    filters.scoreRange[1] < 100 ||
    filters.stages.length > 0 ||
    filters.sources.length > 0 ||
    filters.trend.length > 0;

  const chipOn = 'border-teal-300 bg-teal-50 text-teal-900 shadow-sm';
  const chipOff = 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50';

  return (
    <div className="ll-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-teal-800"
        >
          <Filter className="h-5 w-5 text-teal-600" strokeWidth={2} />
          Advanced filters
          {hasActiveFilters ? (
            <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
              Active
            </span>
          ) : null}
        </button>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <X className="h-4 w-4" />
            Clear all
          </button>
        ) : null}
      </div>

      {showFilters ? (
        <div className="space-y-5 border-t border-slate-100 p-4 sm:p-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Lead score: {filters.scoreRange[0]} – {filters.scoreRange[1]}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.scoreRange[0]}
                onChange={(e) =>
                  updateFilter('scoreRange', [parseInt(e.target.value, 10), filters.scoreRange[1]])
                }
                className="h-2 w-full flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-600"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={filters.scoreRange[1]}
                onChange={(e) =>
                  updateFilter('scoreRange', [filters.scoreRange[0], parseInt(e.target.value, 10)])
                }
                className="h-2 w-full flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Stages</label>
            <div className="flex flex-wrap gap-2">
              {allStages.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => toggleArrayFilter('stages', stage)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    filters.stages.includes(stage) ? chipOn : chipOff
                  }`}
                >
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Sources</label>
            <div className="flex flex-wrap gap-2">
              {allSources.map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => toggleArrayFilter('sources', source)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    filters.sources.includes(source) ? chipOn : chipOff
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Trends</label>
            <div className="flex flex-wrap gap-2">
              {allTrends.map((trend) => (
                <button
                  key={trend}
                  type="button"
                  onClick={() => toggleArrayFilter('trend', trend)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                    filters.trend.includes(trend) ? chipOn : chipOff
                  }`}
                >
                  {trend}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
