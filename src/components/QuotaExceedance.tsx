import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import type { CsvRow, GitHubProfile, UserAggregate } from '../types';
import { aggregateByUser } from '../utils/dataTransforms';
import { displayName } from '../utils/githubApi';
import { downloadCsv } from '../utils/csvExport';

interface Props {
  data: CsvRow[];
  profiles: Record<string, GitHubProfile>;
}

const columnHelper = createColumnHelper<UserAggregate>();

export default function QuotaExceedance({ data, profiles }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sorting, setSorting] = useState<SortingState>([{ id: 'exceededRequests', desc: true }]);

  const exceedanceUsers = useMemo(() => {
    return aggregateByUser(data).filter((u) => u.exceededRequests > 0);
  }, [data]);

  const chartData = useMemo(() => {
    return exceedanceUsers
      .sort((a, b) => b.exceededRequests - a.exceededRequests)
      .slice(0, 30)
      .map((u) => ({
        name: displayName(u.username, profiles),
        withinQuota: u.totalRequests - u.exceededRequests,
        exceeded: u.exceededRequests,
      }));
  }, [exceedanceUsers, profiles]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: 'User',
        cell: (info) => {
          const username = info.getValue();
          return (
            <Link
              to={`/user/${username}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {displayName(username, profiles)}
            </Link>
          );
        },
      }),
      columnHelper.accessor('organization', { header: 'Organization' }),
      columnHelper.accessor('quota', { header: 'Quota', cell: (info) => info.getValue().toLocaleString() }),
      columnHelper.accessor('totalRequests', {
        header: 'Total Requests',
        cell: (info) => info.getValue().toLocaleString(),
      }),
      columnHelper.accessor('exceededRequests', {
        header: 'Exceeded',
        cell: (info) => <span className="text-red-500 dark:text-red-400 font-medium">{info.getValue().toLocaleString()}</span>,
      }),
      columnHelper.accessor('overQuotaCost', {
        header: 'Over-Quota Cost',
        cell: (info) => (
          <span className="text-red-500 dark:text-red-400 font-medium">
            ${info.getValue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ),
      }),
    ],
    [profiles]
  );

  const table = useReactTable({
    data: exceedanceUsers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  const handleExport = () => {
    const exportData = exceedanceUsers.map((u) => ({
      name: displayName(u.username, profiles),
      username: u.username,
      organization: u.organization,
      quota: u.quota,
      totalRequests: u.totalRequests,
      exceededRequests: u.exceededRequests,
      overQuotaCost: u.overQuotaCost.toFixed(2),
    }));
    downloadCsv(exportData, 'quota-exceedance.csv');
  };

  if (exceedanceUsers.length === 0) {
    return (
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-base font-semibold">Quota Exceedance</h3>
        </div>
        <p className="text-muted-foreground text-sm">No users exceeded their quota in the current data.</p>
      </div>
    );
  }

  return (
    <div className="card p-4 mb-6 accent-bar">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h3 className="text-base font-semibold">Quota Exceedance</h3>
          <span className="badge badge-destructive">
            {exceedanceUsers.length} users over quota
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            to="/report/exceedance"
            className="btn btn-destructive text-xs gap-1"
          >
            Full Report
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button onClick={handleExport} className="btn btn-secondary text-xs gap-1">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 28)}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 140 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
          <XAxis type="number" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: isDark ? '#94a3b8' : '#475569', fontSize: 11, fontWeight: 500 }}
            width={130}
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
            itemStyle={{ color: isDark ? '#f1f5f9' : '#334155' }}
            cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }} iconType="circle" />
          <Bar dataKey="withinQuota" stackId="a" fill="#10b981" name="Within Quota" radius={[4, 0, 0, 4]} barSize={14} />
          <Bar dataKey="exceeded" stackId="a" fill="#ef4444" name="Exceeded" radius={[0, 4, 4, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm text-left data-table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-3 py-2.5 text-[11px] text-muted-foreground uppercase tracking-wider cursor-pointer
                               hover:text-foreground select-none font-semibold whitespace-nowrap transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span className="text-primary">
                        {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-border/50 last:border-0">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2.5 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="btn btn-secondary text-xs px-2 py-1 disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="btn btn-secondary text-xs px-2 py-1 disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
