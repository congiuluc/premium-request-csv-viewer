import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { CsvRow, GitHubProfile } from '../../types';
import { aggregateByUser } from '../../utils/dataTransforms';
import { displayName } from '../../utils/githubApi';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  data: CsvRow[];
  profiles: Record<string, GitHubProfile>;
}

export default function TopUsersChart({ data, profiles }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = useMemo(() => {
    const users = aggregateByUser(data)
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, 20);
    return users.map((u) => ({
      name: displayName(u.username, profiles),
      totalRequests: u.totalRequests,
    }));
  }, [data, profiles]);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-violet-500" />
        <h3 className="text-sm font-semibold">Top 20 Users by Requests</h3>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 120 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
          <XAxis type="number" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
            width={110}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1a2035' : '#ffffff',
              borderColor: isDark ? '#2d3a5c' : '#e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.12)',
              color: isDark ? '#f1f5f9' : '#0f172a',
            }}
            itemStyle={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
            labelStyle={{ color: isDark ? '#f1f5f9' : '#0f172a', fontWeight: 600 }}
            cursor={{ fill: isDark ? 'rgba(129,140,248,0.08)' : 'rgba(99,102,241,0.06)' }}
          />
          <Bar dataKey="totalRequests" fill="#818cf8" name="Requests" radius={[0, 6, 6, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
