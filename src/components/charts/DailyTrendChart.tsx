import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { CsvRow } from '../../types';
import { aggregateByDate } from '../../utils/dataTransforms';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  data: CsvRow[];
}

export default function DailyTrendChart({ data }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartData = useMemo(() => aggregateByDate(data), [data]);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-indigo-500" />
        <h3 className="text-sm font-semibold">Daily Usage Trend</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
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
            itemStyle={{ color: '#818cf8' }}
          />
          <Area type="monotone" dataKey="totalRequests" stroke="#818cf8" strokeWidth={2} fill="url(#colorRequests)" name="Requests" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
