import { useMemo } from 'react';
import type { CsvRow, Filters } from '../types';

export function useFilteredData(data: CsvRow[] | null, filters: Filters): CsvRow[] {
  return useMemo(() => {
    if (!data) return [];
    let rows = data;

    if (filters.dateFrom) {
      rows = rows.filter((r) => r.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      rows = rows.filter((r) => r.date <= filters.dateTo);
    }
    if (filters.username) {
      const q = filters.username.toLowerCase();
      rows = rows.filter((r) => r.username.toLowerCase().includes(q));
    }
    if (filters.models.length > 0) {
      const modelSet = new Set(filters.models);
      rows = rows.filter((r) => modelSet.has(r.model));
    }
    if (filters.organizations.length > 0) {
      const orgSet = new Set(filters.organizations);
      rows = rows.filter((r) => orgSet.has(r.organization));
    }

    return rows;
  }, [data, filters]);
}
