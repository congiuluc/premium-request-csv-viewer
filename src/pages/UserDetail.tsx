import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { useTheme } from '../contexts/ThemeContext';
import type { CsvRow, GitHubProfile } from '../types';
import { aggregateByDate, aggregateByModel, aggregateBySku, computeKpis } from '../utils/dataTransforms';
import { displayName } from '../utils/githubApi';

interface Props {
  data: CsvRow[];
  profiles: Record<string, GitHubProfile>;
}

const COLORS = [
  '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9',
  '#f472b6', '#fb7185', '#f87171', '#fb923c', '#fbbf24',
  '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#22d3ee',
];

const columnHelper = createColumnHelper<CsvRow>();

export default function UserDetail({ data, profiles }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { username } = useParams<{ username: string }>();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);

  const userRows = useMemo(() => data.filter((r) => r.username === username), [data, username]);
  const kpis = useMemo(() => computeKpis(userRows), [userRows]);
  const dailyData = useMemo(() => aggregateByDate(userRows), [userRows]);
  const modelData = useMemo(() => aggregateByModel(userRows), [userRows]);
  const skuData = useMemo(() => aggregateBySku(userRows), [userRows]);

  const profile = username ? profiles[username] : undefined;

  const columns = useMemo(
    () => [
      columnHelper.accessor('date', { header: 'Date' }),
      columnHelper.accessor('model', { header: 'Model' }),
      columnHelper.accessor('sku', { header: 'SKU' }),
      columnHelper.accessor('quantity', {
        header: 'Qty',
        cell: (info) => parseFloat(info.getValue()).toLocaleString(),
      }),
      columnHelper.accessor('gross_amount', {
        header: 'Gross',
        cell: (info) => `$${parseFloat(info.getValue()).toFixed(2)}`,
      }),
      columnHelper.accessor('net_amount', {
        header: 'Net',
        cell: (info) => `$${parseFloat(info.getValue()).toFixed(2)}`,
      }),
      columnHelper.accessor('exceeds_quota', {
        header: 'Exceeds',
        cell: (info) =>
          String(info.getValue()).toLowerCase() === 'true' ? (
            <span className="badge badge-destructive">Yes</span>
          ) : (
            <span className="text-muted-foreground">No</span>
          ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: userRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  if (!username || userRows.length === 0) {
    return (
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 text-center py-20">
        <p className="text-muted-foreground text-lg">User not found.</p>
        <Link to="/" className="btn btn-ghost text-xs gap-1 mt-4 inline-flex">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const exceededRows = userRows.filter((r) => String(r.exceeds_quota).toLowerCase() === 'true');
  const exceededQty = exceededRows.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0), 0);
  const overQuotaCost = exceededRows.reduce((sum, r) => sum + (parseFloat(r.net_amount) || 0), 0);
  const quota = parseFloat(userRows[0]?.total_monthly_quota ?? '0') || 0;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="btn btn-ghost text-xs gap-1 mb-4 inline-flex">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-4">
          {profile?.avatarUrl && (
            <img
              src={profile.avatarUrl}
              alt={username}
              className="w-14 h-14 rounded-full border-2 border-border shadow-sm"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {displayName(username, profiles)}
            </h1>
            <p className="text-muted-foreground text-sm">
              {userRows[0]?.organization} · {userRows[0]?.cost_center_name}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards (Reusing simplified structure, but in grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <KpiItem label="Total Requests" value={kpis.totalRequests.toLocaleString()} />
        <KpiItem label="Quota" value={quota.toLocaleString()} />
        <KpiItem
          label="Exceeded"
          value={exceededQty.toLocaleString()}
          highlight={exceededQty > 0}
        />
        <KpiItem
          label="Over-Quota Cost"
          value={`$${overQuotaCost.toFixed(2)}`}
          highlight={overQuotaCost > 0}
        />
        <KpiItem label="Gross Cost" value={`$${kpis.grossAmount.toFixed(2)}`} />
        <KpiItem label="Models Used" value={kpis.uniqueModels.toString()} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Usage */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold mb-3">Daily Usage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1a2035' : '#ffffff',
                  borderColor: isDark ? '#2d3a5c' : '#e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: isDark ? '#e2e8f0' : '#1e293b',
                }}
                labelStyle={{ color: isDark ? '#cbd5e1' : '#475569' }}
              />
              <Line type="monotone" dataKey="totalRequests" stroke="#818cf8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Model Breakdown */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold mb-3">Model Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={modelData}
                dataKey="totalRequests"
                nameKey="model"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={40}
                paddingAngle={2}
                stroke={isDark ? '#0c0f1a' : '#ffffff'}
                strokeWidth={2}
              >
                {modelData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1a2035' : '#ffffff',
                  borderColor: isDark ? '#2d3a5c' : '#e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: isDark ? '#e2e8f0' : '#1e293b',
                }}
                itemStyle={{ color: isDark ? '#cbd5e1' : '#475569' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SKU Breakdown Table */}
      <div className="card p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3">SKU Breakdown</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="data-table w-full text-sm text-left">
            <thead>
              <tr>
                <th className="px-3 py-2 text-xs uppercase font-medium">SKU</th>
                <th className="px-3 py-2 text-xs uppercase font-medium">Product</th>
                <th className="px-3 py-2 text-xs uppercase font-medium">Requests</th>
                <th className="px-3 py-2 text-xs uppercase font-medium">Gross</th>
                <th className="px-3 py-2 text-xs uppercase font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {skuData.map((s) => (
                <tr key={s.sku}>
                  <td className="px-3 py-2">{s.sku}</td>
                  <td className="px-3 py-2">{s.product}</td>
                  <td className="px-3 py-2">{s.totalRequests.toLocaleString()}</td>
                  <td className="px-3 py-2">${s.grossAmount.toFixed(2)}</td>
                  <td className="px-3 py-2">${s.netAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Transaction Table */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold mb-3">All Transactions</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="data-table w-full text-sm text-left">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-3 py-2 text-xs uppercase tracking-wide cursor-pointer
                                 select-none font-medium whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>
              {userRows.length} rows · Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="btn btn-secondary px-2 py-1.5 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="btn btn-secondary px-2 py-1.5 text-xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="card kpi-card">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 font-medium">{label}</p>
      <p className={`text-xl font-bold ${highlight ? 'text-destructive' : ''}`}>{value}</p>
    </div>
  );
}
