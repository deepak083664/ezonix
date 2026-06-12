import React from 'react';
import { Plus } from 'lucide-react';

const EmptyState = ({ icon: Icon, title, message, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
      {Icon ? (
        <div className="mb-4 rounded-2xl bg-blue-500/10 p-4 text-primary animate-pulse-subtle">
          <Icon size={28} />
        </div>
      ) : (
        <div className="mb-4 rounded-2xl bg-blue-500/10 p-4 text-primary animate-pulse-subtle">
          <Plus size={28} />
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      <p className="mt-1 text-xs text-slate-450 dark:text-slate-400 max-w-xs leading-relaxed font-semibold">
        {message}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/15 hover:bg-primary-hover focus:outline-none transition-all"
        >
          <Plus size={14} />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
