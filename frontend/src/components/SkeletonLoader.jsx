import React from 'react';

const SkeletonLoader = ({ type = 'table', rows = 5 }) => {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-pulse-subtle">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800"></div>
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            </div>
            <div className="mt-4 h-8 w-32 rounded bg-slate-200 dark:bg-slate-800"></div>
            <div className="mt-2 h-3 w-40 rounded bg-slate-200 dark:bg-slate-800"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 animate-pulse-subtle">
      {/* Table header mimic */}
      <div className="flex items-center space-x-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="h-4 flex-1 rounded bg-slate-200 dark:bg-slate-800"></div>
        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800"></div>
        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800"></div>
        <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800"></div>
      </div>
      {/* Table rows mimic */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 py-2">
          <div className="h-4 flex-1 rounded bg-slate-100 dark:bg-slate-800"></div>
          <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800"></div>
          <div className="h-4 w-32 rounded bg-slate-100 dark:bg-slate-800"></div>
          <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-800"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
