import React from 'react';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

const DataTable = ({
  columns,
  data = [],
  loading = false,
  searchPlaceholder = 'Search records...',
  searchQuery,
  onSearchChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  emptyState: EmptyStateComponent,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50 transition-all duration-300">
      
      {/* Search Bar Panel */}
      {onSearchChange && (
        <div className="flex items-center justify-between border-b border-slate-150 p-4 dark:border-slate-800/80">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-9 text-xs text-slate-700 outline-none transition-all focus:border-primary focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 focus:outline-none transition-all">
              <Filter size={13} />
              Filter
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto max-h-[550px]">
        <table className="w-full border-collapse text-left text-xs text-slate-650 dark:text-slate-400">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-450 border-b border-slate-200 dark:border-slate-700/80 z-10 select-none">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} scope="col" className="px-6 py-3.5 font-bold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12">
                  <SkeletonLoader rows={5} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16">
                  {EmptyStateComponent || (
                    <div className="text-center text-slate-400 text-xs py-10 font-medium">No records found.</div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {columns.map((col, colIdx) => {
                    const cellVal = col.accessor ? row[col.accessor] : undefined;
                    return (
                      <td key={colIdx} className="px-6 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {col.render ? col.render(cellVal, row) : cellVal}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 focus:outline-none transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 focus:outline-none transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
