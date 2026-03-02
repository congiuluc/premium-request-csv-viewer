import type {
  CsvRow,
  UserAggregate,
  DateAggregate,
  ModelAggregate,
  OrgAggregate,
  SkuAggregate,
  Kpis,
} from '../types';

interface UserAccumulator {
  username: string;
  organization: string;
  costCenter: string;
  totalRequests: number;
  grossAmount: number;
  netAmount: number;
  discountAmount: number;
  exceededRequests: number;
  overQuotaCost: number;
  quota: number;
  modelsUsed: Set<string>;
  exceededModels: Set<string>;
}

export function aggregateByUser(rows: CsvRow[]): UserAggregate[] {
  const map = new Map<string, UserAccumulator>();
  for (const row of rows) {
    const key = row.username;
    if (!map.has(key)) {
      map.set(key, {
        username: key,
        organization: row.organization,
        costCenter: row.cost_center_name,
        totalRequests: 0,
        grossAmount: 0,
        netAmount: 0,
        discountAmount: 0,
        exceededRequests: 0,
        overQuotaCost: 0,
        quota: parseFloat(row.total_monthly_quota) || 0,
        modelsUsed: new Set<string>(),
        exceededModels: new Set<string>(),
      });
    }
    const u = map.get(key)!;
    const qty = parseFloat(row.quantity) || 0;
    u.totalRequests += qty;
    u.grossAmount += parseFloat(row.gross_amount) || 0;
    u.netAmount += parseFloat(row.net_amount) || 0;
    u.discountAmount += parseFloat(row.discount_amount) || 0;
    u.modelsUsed.add(row.model);
    if (String(row.exceeds_quota).toLowerCase() === 'true') {
      u.exceededRequests += qty;
      u.overQuotaCost += parseFloat(row.net_amount) || 0;
      u.exceededModels.add(row.model);
    }
  }
  return Array.from(map.values()).map((u) => ({
    username: u.username,
    organization: u.organization,
    costCenter: u.costCenter,
    totalRequests: u.totalRequests,
    grossAmount: u.grossAmount,
    netAmount: u.netAmount,
    discountAmount: u.discountAmount,
    exceededRequests: u.exceededRequests,
    overQuotaCost: u.overQuotaCost,
    quota: u.quota,
    modelsUsed: u.modelsUsed.size,
    exceededModels: u.exceededModels.size,
  }));
}

export function aggregateByDate(rows: CsvRow[]): DateAggregate[] {
  const map = new Map<string, DateAggregate>();
  for (const row of rows) {
    const key = row.date;
    if (!map.has(key)) {
      map.set(key, { date: key, totalRequests: 0, grossAmount: 0, netAmount: 0 });
    }
    const d = map.get(key)!;
    d.totalRequests += parseFloat(row.quantity) || 0;
    d.grossAmount += parseFloat(row.gross_amount) || 0;
    d.netAmount += parseFloat(row.net_amount) || 0;
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function aggregateByModel(rows: CsvRow[]): ModelAggregate[] {
  const map = new Map<string, ModelAggregate>();
  for (const row of rows) {
    const key = row.model;
    if (!map.has(key)) {
      map.set(key, { model: key, totalRequests: 0, grossAmount: 0, netAmount: 0 });
    }
    const m = map.get(key)!;
    m.totalRequests += parseFloat(row.quantity) || 0;
    m.grossAmount += parseFloat(row.gross_amount) || 0;
    m.netAmount += parseFloat(row.net_amount) || 0;
  }
  return Array.from(map.values()).sort((a, b) => b.totalRequests - a.totalRequests);
}

export function aggregateByOrg(rows: CsvRow[]): OrgAggregate[] {
  const map = new Map<string, { org: OrgAggregate; users: Set<string> }>();
  for (const row of rows) {
    const key = row.organization;
    if (!map.has(key)) {
      map.set(key, {
        org: { organization: key, totalRequests: 0, grossAmount: 0, netAmount: 0, userCount: 0 },
        users: new Set<string>(),
      });
    }
    const entry = map.get(key)!;
    entry.org.totalRequests += parseFloat(row.quantity) || 0;
    entry.org.grossAmount += parseFloat(row.gross_amount) || 0;
    entry.org.netAmount += parseFloat(row.net_amount) || 0;
    entry.users.add(row.username);
  }
  return Array.from(map.values())
    .map((e) => ({ ...e.org, userCount: e.users.size }))
    .sort((a, b) => b.totalRequests - a.totalRequests);
}

export function computeKpis(rows: CsvRow[]): Kpis {
  let totalRequests = 0;
  let grossAmount = 0;
  let netAmount = 0;
  let discountAmount = 0;
  const users = new Set<string>();
  const models = new Set<string>();
  const exceedingUsers = new Set<string>();
  let minDate: string | null = null;
  let maxDate: string | null = null;

  for (const row of rows) {
    totalRequests += parseFloat(row.quantity) || 0;
    grossAmount += parseFloat(row.gross_amount) || 0;
    netAmount += parseFloat(row.net_amount) || 0;
    discountAmount += parseFloat(row.discount_amount) || 0;
    users.add(row.username);
    models.add(row.model);
    if (String(row.exceeds_quota).toLowerCase() === 'true') {
      exceedingUsers.add(row.username);
    }
    if (row.date) {
      if (!minDate || row.date < minDate) minDate = row.date;
      if (!maxDate || row.date > maxDate) maxDate = row.date;
    }
  }

  return {
    totalRequests,
    grossAmount,
    netAmount,
    discountAmount,
    uniqueUsers: users.size,
    uniqueModels: models.size,
    exceedingUsersCount: exceedingUsers.size,
    dateRange: minDate && maxDate ? `${minDate} — ${maxDate}` : 'N/A',
  };
}

export function aggregateBySku(rows: CsvRow[]): SkuAggregate[] {
  const map = new Map<string, SkuAggregate>();
  for (const row of rows) {
    const key = row.sku;
    if (!map.has(key)) {
      map.set(key, { sku: key, product: row.product, totalRequests: 0, grossAmount: 0, netAmount: 0 });
    }
    const s = map.get(key)!;
    s.totalRequests += parseFloat(row.quantity) || 0;
    s.grossAmount += parseFloat(row.gross_amount) || 0;
    s.netAmount += parseFloat(row.net_amount) || 0;
  }
  return Array.from(map.values()).sort((a, b) => b.totalRequests - a.totalRequests);
}
