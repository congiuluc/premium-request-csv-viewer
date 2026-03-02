import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, ChevronLeft, ChevronRight, Database } from 'lucide-react';
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
import type { CsvRow, GitHubProfile } from '../types';
import { displayName } from '../utils/githubApi';
import { downloadCsv } from '../utils/csvExport';

interface Props {
  data: CsvRow[];
  profiles: Record<string, GitHubProfile>;
}

const columnHelper = createColumnHelper<CsvRow>();

export default function DataTable({ data, profiles }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(
    () => [
      columnHelper.accessor('date', { header: 'Date' }),
      columnHelper.accessor('username', {
        header: 'User',
        cell: (info) => {
          const username = info.getValue();
          return (
            <Link to={`/user/${username}`} className="text-primary hover:text-primary/80 font-medium transition-colors">
              {displayName(username, profiles)}
            </Link>
          );
        },
      }),
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
      columnHelper.accessor('organization', { header: 'Org' }),
    ],
    [profiles]
  );

  const table = useReactTable({
    data,
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
    const exportData = table.getFilteredRowModel().rows.map((r) => r.original);
    downloadCsv(exportData as unknown as Record<string, unknown>[], 'filtered-data.csv');
  };

  return (
    <div className="card p-4 mb-6 accent-bar">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-base font-semibold">All Data</h3>
          <span className="text-xs text-muted-foreground">
            ({table.getFilteredRowModel().rows.length.toLocaleString()} rows)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search table..."
              className="input text-sm pl-8 w-48"
            />
          </div>
          <button onClick={handleExport} className="btn btn-secondary text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm text-left data-table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-3 py-2.5 text-[11px] text-muted-foreground uppercase tracking-wider cursor-pointer
                               hover:text-foreground select-none whitespace-nowrap font-semibold transition-colors"
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
    </div>
  );
}
