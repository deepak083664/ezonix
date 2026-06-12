import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = "Are you sure?", message = "This action cannot be undone.", confirmText = "Delete", isDanger = true }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex items-start gap-4">
        {isDanger && (
          <div className="rounded-full bg-red-100 p-2 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <AlertTriangle size={24} />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {message}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-450 dark:hover:bg-slate-950"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all ${
                isDanger
                  ? "bg-red-650 hover:bg-red-700 focus:ring-red-500"
                  : "bg-primary hover:bg-primary-hover focus:ring-blue-500"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
