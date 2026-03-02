import { useMemo } from 'react';
import { Cpu } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { CsvRow } from '../../types';
import { aggregateByModel } from '../../utils/dataTransforms';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  data: CsvRow[];
}

const COLORS = [
  '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9',
  '#f472b6', '#fb7185', '#f87171', '#fb923c', '#fbbf24',
  '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#22d3ee',
  '#38bdf8', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899',
];

export default function ModelDistributionChart({ data }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartData = useMemo(() => aggregateByModel(data), [data]);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="w-4 h-4 text-fuchsia-500" />
        <h3 className="text-sm font-semibold">Model Distribution</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="totalRequests"
            nameKey="model"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            paddingAngle={1}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1a2035' : '#ffffff',
              borderColor: isDark ? '#2d3a5c' : '#e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.12)',
              color: isDark ? '#f1f5f9' : '#0f172a',
            }}
            itemStyle={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
