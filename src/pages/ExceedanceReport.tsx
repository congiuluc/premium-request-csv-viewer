import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Download, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import type { CsvRow, GitHubProfile, UserAggregate } from '../types';
import { aggregateByUser } from '../utils/dataTransforms';
import { displayName } from '../utils/githubApi';
import { downloadCsv } from '../utils/csvExport';

interface Props {
  data: CsvRow[];
  profiles: Record<string, GitHubProfile>;
}

const columnHelper = createColumnHelper<UserAggregate>();

export default function ExceedanceReport({ data, profiles }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'overQuotaCost', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');

  const exceedRows: UserAggregate[] = useMemo(() => {
    // Only includes users who exceeded quota
    return aggregateByUser(data).filter((u) => u.exceededRequests > 0);
  }, [data]);

  // KPIs
  const totalExceededRequests = exceedRows.reduce((s, r) => s + r.exceededRequests, 0);
  const totalOverQuotaCost = exceedRows.reduce((s, r) => s + r.overQuotaCost, 0);
  const allExceededModels = new Set(
    data.filter((r) => String(r.exceeds_quota).toLowerCase() === 'true').map((r) => r.model)
  );
  const totalUsers = exceedRows.length;

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: 'User',
        cell: (info) => {
          const un = info.getValue();
          return (
            <Link
              to={`/user/${encodeURIComponent(un)}`}
              className="text-primary hover:text-primary/80 flex items-center gap-2 font-medium transition-colors"
            >
              {profiles[un]?.avatarUrl && (
                <img
                  src={profiles[un].avatarUrl}
                  alt={un}
                  className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700"
                />
              )}
              {displayName(un, profiles)}
            </Link>
          );
        },
        filterFn: (row, _columnId, filterValue: string) => {
          const un = row.original.username.toLowerCase();
          const name = displayName(row.original.username, profiles).toLowerCase();
          const v = filterValue.toLowerCase();
          return un.includes(v) || name.includes(v);
        },
      }),
      columnHelper.accessor('organization', { header: 'Organization' }),
      columnHelper.accessor('totalMonthlyQuota', {
        header: 'Quota',
        cell: (info) => info.getValue().toLocaleString(),
      }),
      columnHelper.accessor('totalRequests', {
        header: 'Total Requests',
        cell: (info) => info.getValue().toLocaleString(),
      }),
      columnHelper.accessor('exceededRequests', {
        header: 'Exceeded Requests',
        cell: (info) => (
          <span className="text-red-500 dark:text-red-400 font-medium">{info.getValue().toLocaleString()}</span>
        ),
      }),
      columnHelper.accessor('modelsUsed', {
        header: 'Models',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('overQuotaCost', {
        header: 'Over-Quota Cost',
        cell: (info) => (
          <span className="text-red-500 dark:text-red-400 font-medium">${info.getValue().toFixed(2)}</span>
        ),
      }),
    ],
    [profiles]
  );

  const table = useReactTable({
    data: exceedRows,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  const handleExport = () => {
    const exportData = exceedRows.map((r) => ({
      Username: r.username,
      Name: displayName(r.username, profiles),
      Organization: r.organization,
      Quota: r.totalMonthlyQuota,
      'Total Requests': r.totalRequests,
      'Exceeded Requests': r.exceededRequests,
      'Models Used': r.modelsUsed,
      'Over-Quota Cost': r.overQuotaCost.toFixed(2),
    }));
    downloadCsv(exportData, 'exceedance-report.csv');
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 animate-fade-in">
      <div className="mb-6">
        <Link to="/" className="btn btn-ghost text-xs gap-1 mb-4 inline-flex">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Premium Request Exceedance Report</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Detailed report of users who exceeded their premium request quota
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 stagger-children">
        <KpiCard label="Users Exceeding" value={totalUsers.toString()} />
        <KpiCard label="Exceeded Requests" value={totalExceededRequests.toLocaleString()} />
        <KpiCard label="Models in Exceeded" value={allExceededModels.size.toString()} />
        <KpiCard label="Total Over-Quota Cost" value={`$${totalOverQuotaCost.toFixed(2)}`} highlight />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="input text-sm pl-8 w-64"
          />
        </div>
        <button
          onClick={handleExport}
          className="btn btn-primary ml-auto text-xs gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm text-left data-table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wider cursor-pointer
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
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>
            {table.getFilteredRowModel().rows.length} users · Page{' '}
            {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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

function KpiCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="card kpi-card p-4 transition-all hover:-translate-y-0.5">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">{label}</p>
      <p className={`text-xl font-bold tracking-tight ${highlight ? 'text-destructive' : ''}`}>{value}</p>
    </div>
  );
}
