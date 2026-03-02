import { SlidersHorizontal, X } from 'lucide-react';
import type { Filters } from '../types';

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  allModels: string[];
  allOrgs: string[];
}

export default function FilterBar({ filters, onChange, allModels, allOrgs }: FilterBarProps) {
  const update = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  const hasActiveFilters = filters.dateFrom || filters.dateTo || filters.username
    || filters.models.length > 0 || filters.organizations.length > 0;

  return (
    <div className="card p-4 mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Filters</span>
        {hasActiveFilters && (
          <span className="badge badge-primary text-[10px] ml-1">Active</span>
        )}
      </div>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
            className="input text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update({ dateTo: e.target.value })}
            className="input text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Username</label>
          <input
            type="text"
            value={filters.username}
            onChange={(e) => update({ username: e.target.value })}
            placeholder="Search username..."
            className="input text-sm w-44"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Models</label>
          <div className="relative">
            <select
              multiple
              value={filters.models}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                if (selected.includes('ALL')) {
                  update({ models: [] });
                } else {
                  update({ models: selected });
                }
              }}
              className="input h-20 min-w-32"
            >
              <option value="ALL" className={filters.models.length === 0 ? 'font-bold' : ''}>
                All Models ({allModels.length})
              </option>
              {allModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {filters.models.length === 0 && (
              <span className="absolute top-2 right-2 text-[10px] text-primary font-semibold pointer-events-none">
                All
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            Organizations
          </label>
          <div className="relative">
            <select
              multiple
              value={filters.organizations}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (o) => o.value);
                if (selected.includes('ALL')) {
                  update({ organizations: [] });
                } else {
                  update({ organizations: selected });
                }
              }}
              className="input h-20 min-w-40"
            >
              <option value="ALL" className={filters.organizations.length === 0 ? 'font-bold' : ''}>
                All Organizations ({allOrgs.length})
              </option>
              {allOrgs.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            {filters.organizations.length === 0 && (
              <span className="absolute top-2 right-2 text-[10px] text-primary font-semibold pointer-events-none">
                All
              </span>
            )}
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => onChange({ dateFrom: '', dateTo: '', username: '', models: [], organizations: [] })}
            className="btn btn-ghost self-end gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
