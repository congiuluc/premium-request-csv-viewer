import { useMemo } from 'react';
import { Activity, DollarSign, TrendingDown, Users, Cpu, AlertTriangle, Calendar } from 'lucide-react';
import type { CsvRow } from '../types';
import { computeKpis } from '../utils/dataTransforms';

interface KpiCardsProps {
  data: CsvRow[];
}

const KPI_CONFIG = [
  { key: 'totalRequests', label: 'Total Requests', accent: 'kpi-indigo', icon: Activity },
  { key: 'grossAmount', label: 'Gross Cost', accent: 'kpi-emerald', icon: DollarSign },
  { key: 'netAmount', label: 'Net Cost', accent: 'kpi-violet', icon: TrendingDown },
  { key: 'uniqueUsers', label: 'Users', accent: 'kpi-amber', icon: Users },
  { key: 'uniqueModels', label: 'Models', accent: 'kpi-cyan', icon: Cpu },
  { key: 'exceedingUsersCount', label: 'Exceeding Users', accent: 'kpi-rose', icon: AlertTriangle },
  { key: 'dateRange', label: 'Date Range', accent: 'kpi-sky', icon: Calendar },
] as const;

function formatNum(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function formatCost(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatValue(key: string, value: string | number): string {
  if (key === 'grossAmount' || key === 'netAmount') return formatCost(value as number);
  if (typeof value === 'number') return formatNum(value);
  return value;
}

export default function KpiCards({ data }: KpiCardsProps) {
  const kpis = useMemo(() => computeKpis(data), [data]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6 stagger-children">
      {KPI_CONFIG.map(({ key, label, accent, icon: Icon }) => {
        const raw = kpis[key as keyof typeof kpis];
        const value = formatValue(key, raw);
        return (
          <div
            key={key}
            className={`card kpi-card ${accent} p-4 transition-all hover:-translate-y-0.5`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                {label}
              </p>
            </div>
            <p className={`text-xl font-bold tracking-tight ${
              key === 'exceedingUsersCount' && (raw as number) > 0
                ? 'text-destructive'
                : ''
            }`}>
              {value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
