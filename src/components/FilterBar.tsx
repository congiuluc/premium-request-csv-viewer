import { useState, useRef, useEffect, useCallback } from 'react';
import {
  SlidersHorizontal, X, ChevronDown, ChevronUp, Search,
  Calendar, User, Cpu, Building2, RotateCcw, Check
} from 'lucide-react';
import type { Filters } from '../types';

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  allModels: string[];
  allOrgs: string[];
}

/* ── Dropdown with checkboxes ── */
function MultiSelectDropdown({
  label,
  icon: Icon,
  items,
  selected,
  onChangeSelected,
}: {
  label: string;
  icon: React.ElementType;
  items: string[];
  selected: string[];
  onChangeSelected: (sel: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = items.filter((i) =>
    i.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = useCallback(
    (item: string) => {
      onChangeSelected(
        selected.includes(item)
          ? selected.filter((s) => s !== item)
          : [...selected, item]
      );
    },
    [selected, onChangeSelected]
  );

  const allSelected = selected.length === 0;
  const displayText = allSelected
    ? `All ${label} (${items.length})`
    : selected.length === 1
      ? selected[0]
      : `${selected.length} selected`;

  return (
    <div ref={ref} className="filter-dropdown-wrapper">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`filter-dropdown-trigger ${!allSelected ? 'filter-active' : ''}`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{displayText}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 ml-auto transition-transform
          ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="filter-dropdown-panel animate-slide-down">
          {items.length > 6 && (
            <div className="filter-dropdown-search">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="filter-dropdown-search-input"
                autoFocus
              />
            </div>
          )}
          <div className="filter-dropdown-list">
            <label
              className={`filter-dropdown-item ${allSelected ? 'filter-dropdown-item-active' : ''}`}
            >
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onChangeSelected([])}
                className="sr-only"
              />
              <span className={`filter-check ${allSelected ? 'filter-check-on' : ''}`}>
                {allSelected && <Check className="w-2.5 h-2.5" />}
              </span>
              <span className="font-medium">All {label}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">{items.length}</span>
            </label>

            <div className="filter-dropdown-divider" />

            {filtered.map((item) => {
              const checked = selected.includes(item);
              return (
                <label
                  key={item}
                  className={`filter-dropdown-item ${checked ? 'filter-dropdown-item-active' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(item)}
                    className="sr-only"
                  />
                  <span className={`filter-check ${checked ? 'filter-check-on' : ''}`}>
                    {checked && <Check className="w-2.5 h-2.5" />}
                  </span>
                  <span className="truncate">{item}</span>
                </label>
              );
            })}

            {filtered.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                No matches
              </div>
            )}
          </div>

          {selected.length > 0 && (
            <div className="filter-dropdown-footer">
              <button
                type="button"
                onClick={() => onChangeSelected([])}
                className="text-[11px] text-primary hover:underline"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main FilterBar ── */
export default function FilterBar({ filters, onChange, allModels, allOrgs }: FilterBarProps) {
  const [expanded, setExpanded] = useState(true);
  const update = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  const hasActiveFilters =
    filters.dateFrom || filters.dateTo || filters.username
    || filters.models.length > 0 || filters.organizations.length > 0;

  const activeCount = [
    filters.dateFrom, filters.dateTo, filters.username,
    filters.models.length > 0 ? 'models' : '',
    filters.organizations.length > 0 ? 'orgs' : '',
  ].filter(Boolean).length;

  return (
    <div className="filter-bar card mb-6 animate-fade-in">
      {/* ── Header ── */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="filter-bar-header"
      >
        <div className="flex items-center gap-2.5">
          <div className="filter-icon-box">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-foreground">Filters</span>
          {hasActiveFilters && (
            <span className="filter-count-badge">{activeCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && !expanded && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {activeCount} active filter{activeCount > 1 ? 's' : ''}
            </span>
          )}
          {expanded
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* ── Body ── */}
      {expanded && (
        <div className="filter-bar-body animate-slide-down">
          {/* Row 1: Date range + Username */}
          <div className="filter-section">
            <div className="filter-group">
              <label className="filter-label">
                <Calendar className="w-3 h-3" /> Date Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => update({ dateFrom: e.target.value })}
                  className="filter-input flex-1"
                />
                <span className="text-xs text-muted-foreground font-medium">to</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => update({ dateTo: e.target.value })}
                  className="filter-input flex-1"
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <User className="w-3 h-3" /> Username
              </label>
              <div className="filter-search-wrapper">
                <Search className="filter-search-icon" />
                <input
                  type="text"
                  value={filters.username}
                  onChange={(e) => update({ username: e.target.value })}
                  placeholder="Search username..."
                  className="filter-input w-full"
                  style={{ paddingLeft: '30px' }}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Models + Organizations */}
          <div className="filter-section">
            <div className="filter-group">
              <label className="filter-label">
                <Cpu className="w-3 h-3" /> Models
              </label>
              <MultiSelectDropdown
                label="Models"
                icon={Cpu}
                items={allModels}
                selected={filters.models}
                onChangeSelected={(sel) => update({ models: sel })}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <Building2 className="w-3 h-3" /> Organizations
              </label>
              <MultiSelectDropdown
                label="Organizations"
                icon={Building2}
                items={allOrgs}
                selected={filters.organizations}
                onChangeSelected={(sel) => update({ organizations: sel })}
              />
            </div>
          </div>

          {/* Active filter chips + Clear */}
          {hasActiveFilters && (
            <div className="filter-chips-row">
              <div className="flex flex-wrap gap-1.5">
                {filters.dateFrom && (
                  <FilterChip
                    label={`From: ${filters.dateFrom}`}
                    onRemove={() => update({ dateFrom: '' })}
                  />
                )}
                {filters.dateTo && (
                  <FilterChip
                    label={`To: ${filters.dateTo}`}
                    onRemove={() => update({ dateTo: '' })}
                  />
                )}
                {filters.username && (
                  <FilterChip
                    label={`User: ${filters.username}`}
                    onRemove={() => update({ username: '' })}
                  />
                )}
                {filters.models.map((m) => (
                  <FilterChip
                    key={m}
                    label={m}
                    onRemove={() => update({ models: filters.models.filter((x) => x !== m) })}
                  />
                ))}
                {filters.organizations.map((o) => (
                  <FilterChip
                    key={o}
                    label={o}
                    onRemove={() =>
                      update({ organizations: filters.organizations.filter((x) => x !== o) })
                    }
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  onChange({ dateFrom: '', dateTo: '', username: '', models: [], organizations: [] })
                }
                className="filter-clear-btn"
              >
                <RotateCcw className="w-3 h-3" />
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Chip component ── */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="filter-chip">
      {label}
      <button type="button" onClick={onRemove} className="filter-chip-x">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}
