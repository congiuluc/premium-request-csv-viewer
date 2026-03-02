import { useState, useEffect, useCallback } from 'react';
import type { CsvRow } from '../types';

const STORAGE_KEY = 'prv_csv_data';

export function useSessionData() {
  const [data, setData] = useState<CsvRow[] | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored) as CsvRow[]);
      }
    } catch {
      /* ignore corrupted data */
    }
  }, []);

  const saveData = useCallback((rows: CsvRow[]) => {
    setData(rows);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    } catch {
      /* sessionStorage quota exceeded — data stays in memory */
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return { data, saveData, clearData };
}
