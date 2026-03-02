import { useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { CsvRow } from '../../types';
import { aggregateByOrg } from '../../utils/dataTransforms';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  data: CsvRow[];
}

export default function OrgBreakdownChart({ data }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartData = useMemo(() => aggregateByOrg(data), [data]);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-semibold">Organization Breakdown</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
          <XAxis dataKey="organization" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1a2035' : '#ffffff',
              borderColor: isDark ? '#2d3a5c' : '#e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.12)',
              color: isDark ? '#f1f5f9' : '#0f172a',
            }}
            labelStyle={{ color: isDark ? '#f1f5f9' : '#0f172a', fontWeight: 600 }}
            itemStyle={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
            cursor={{ fill: isDark ? 'rgba(52,211,153,0.08)' : 'rgba(16,185,129,0.06)' }}
          />
          <Bar dataKey="totalRequests" fill="#34d399" name="Requests" radius={[6, 6, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
