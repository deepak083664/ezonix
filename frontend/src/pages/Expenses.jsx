import React, { useEffect, useState } from 'react';
import API, { BACKEND_URL } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Receipt, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const catParam = categoryFilter ? `&category=${categoryFilter}` : '';
      const res = await API.get(`/expenses?search=${searchQuery}${catParam}&page=${page}&limit=10`);
      setExpenses(res.data.data.expenses);
      setTotalPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [searchQuery, categoryFilter, page]);

  const handleCreateOrUpdate = async (data) => {
    const formData = new FormData();
    formData.append('category', data.category);
    formData.append('amount', data.amount);
    formData.append('description', data.description || '');
    if (data.date) formData.append('date', data.date);
    if (receiptFile) formData.append('receipt', receiptFile);

    try {
      if (selectedExpense) {
        await API.patch(`/expenses/${selectedExpense._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Expense updated successfully!');
      } else {
        await API.post('/expenses', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Expense added successfully!');
      }
      setIsFormOpen(false);
      setReceiptFile(null);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!selectedExpense) return;
    try {
      await API.delete(`/expenses/${selectedExpense._id}`);
      toast.success('Expense log deleted successfully!');
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to delete expense record');
    }
  };

  const openFormModal = (expense = null) => {
    setSelectedExpense(expense);
    setReceiptFile(null);
    if (expense) {
      setValue('category', expense.category);
      setValue('amount', expense.amount);
      setValue('description', expense.description);
      setValue('date', expense.date ? new Date(expense.date).toISOString().split('T')[0] : '');
    } else {
      reset();
    }
    setIsFormOpen(true);
  };

  const columns = [
    {
      header: 'Category',
      accessor: 'category',
      render: (val) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {val}
        </span>
      ),
    },
    { header: 'Amount', accessor: 'amount', render: (val) => `$${val.toFixed(2)}` },
    { header: 'Date', accessor: 'date', render: (val) => new Date(val).toLocaleDateString() },
    { header: 'Description', accessor: 'description', render: (val) => val || '-' },
    {
      header: 'Receipt',
      accessor: 'receiptUrl',
      render: (val) => {
        if (!val) return '-';
        const fullUrl = val.startsWith('http') ? val : `${BACKEND_URL}${val}`;
        return (
          <a
            href={fullUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
          >
            View <ExternalLink size={12} />
          </a>
        );
      },
    },
    {
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openFormModal(row)}
            title="Edit Expense"
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedExpense(row);
              setIsConfirmOpen(true);
            }}
            title="Delete Expense"
            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Expense Log Book
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor company operation overheads, salaries, rent, and upload receipts.
          </p>
        </div>
        <button
          onClick={() => openFormModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Plus size={16} /> Log Expense
        </button>
      </div>

      {/* Filter panel */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Categories</option>
            <option value="Rent">Rent</option>
            <option value="Salary">Salary</option>
            <option value="Internet">Internet</option>
            <option value="Marketing">Marketing</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        loading={loading}
        searchPlaceholder="Search description..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={Receipt}
            title="No Expenses"
            message="Your business expense ledger is empty. Register rent or operations logs."
            actionText="Log Expense"
            onAction={() => openFormModal()}
          />
        }
      />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedExpense ? 'Edit Expense Record' : 'Record Overhead Expense'}
      >
        <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="form-input"
              >
                <option value="">Choose Category</option>
                <option value="Rent">Rent</option>
                <option value="Salary">Salary</option>
                <option value="Internet">Internet</option>
                <option value="Marketing">Marketing</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <span className="text-xs text-red-500">{errors.category.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Amount ($) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { required: 'Amount is required' })}
                className="form-input"
              />
              {errors.amount && <span className="text-xs text-red-500">{errors.amount.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Expense Date
            </label>
            <input type="date" {...register('date')} className="form-input" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Description / Memo
            </label>
            <textarea {...register('description')} rows="2" className="form-input" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Attach Receipt Document
            </label>
            <div className="mt-1 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 select-none">
                <ImageIcon size={14} /> Choose Document
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                      if (isPdf) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('PDF size cannot exceed 5MB.');
                          e.target.value = '';
                          return;
                        }
                      } else {
                        if (file.size > 1 * 1024 * 1024) {
                          toast.error('Image size cannot exceed 1MB.');
                          e.target.value = '';
                          return;
                        }
                      }
                      setReceiptFile(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-400 truncate max-w-xs">
                {receiptFile ? receiptFile.name : selectedExpense?.receiptUrl ? 'Change current receipt file' : 'No receipt attached'}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer"
            >
              {selectedExpense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Expense Record?"
        message="Are you sure you want to delete this expense log? This will remove the receipt reference."
      />
    </div>
  );
};

export default Expenses;
