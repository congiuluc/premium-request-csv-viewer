import { useState, useEffect, useCallback } from 'react';
import type { CsvRow } from '../types';

const DB_NAME = 'prv_db';
const STORE_NAME = 'csv_store';
const DATA_KEY = 'csv_data';
const TTL_MS = 14 * 24 * 60 * 60 * 1000; // 2 weeks

interface StoredPayload {
  rows: CsvRow[];
  savedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(): Promise<CsvRow[] | null> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(DATA_KEY);
    req.onsuccess = () => {
      const payload = req.result as StoredPayload | undefined;
      if (!payload) { resolve(null); return; }
      if (Date.now() - payload.savedAt > TTL_MS) {
        idbDelete().catch(() => {});
        resolve(null);
      } else {
        resolve(payload.rows);
      }
    };
    req.onerror = () => resolve(null);
  });
}

async function idbPut(rows: CsvRow[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const payload: StoredPayload = { rows, savedAt: Date.now() };
    const req = store.put(payload, DATA_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbDelete(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(DATA_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

export function useSessionData() {
  const [data, setData] = useState<CsvRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    idbGet()
      .then((rows) => { if (rows) setData(rows); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveData = useCallback((rows: CsvRow[]) => {
    setData(rows);
    idbPut(rows).catch(() => {
      /* IndexedDB write failed — data stays in memory */
    });
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    idbDelete().catch(() => {});
  }, []);

  return { data, saveData, clearData, loading };
}
