import React, { useEffect, useState } from 'react';
import API from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Coins, Calendar, Tag, CreditCard, ChevronRight, Layers, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#F59E0B', // Amber
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#64748B', // Slate
];

const Incomes = () => {
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' or 'sources'
  
  // Ledger state
  const [incomes, setIncomes] = useState([]);
  const [loadingIncomes, setLoadingIncomes] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalIncomesSum, setTotalIncomesSum] = useState(0);

  // Sources state
  const [sources, setSources] = useState([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [breakdownData, setBreakdownData] = useState([]);

  // Modals & Selections
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'income'|'source', data: obj }
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);

  // Color picker state for source form
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  // Form Hooks
  const {
    register: registerIncome,
    handleSubmit: handleIncomeSubmit,
    setValue: setIncomeValue,
    reset: resetIncomeForm,
    formState: { errors: incomeErrors },
  } = useForm();

  const {
    register: registerSource,
    handleSubmit: handleSourceSubmit,
    setValue: setSourceValue,
    reset: resetSourceForm,
    formState: { errors: sourceErrors },
  } = useForm();

  // Fetch sources
  const fetchSources = async () => {
    setLoadingSources(true);
    try {
      const res = await API.get('/income-sources');
      setSources(res.data.data.sources);
    } catch (err) {
      toast.error('Failed to load income sources');
    } finally {
      setLoadingSources(false);
    }
  };

  // Fetch Incomes (ledger)
  const fetchIncomes = async () => {
    setLoadingIncomes(true);
    try {
      const sourceParam = sourceFilter ? `&incomeSource=${sourceFilter}` : '';
      const res = await API.get(`/incomes?search=${searchQuery}${sourceParam}&page=${page}&limit=10`);
      setIncomes(res.data.data.incomes);
      setTotalPages(res.data.pages);
      setBreakdownData(res.data.data.breakdown || []);
      
      // Calculate total sum of logged incomes in query (or compute total overall sum)
      // To get total sum accurately, let's also fetch overall sum from reports/dashboard-stats
      const statsRes = await API.get('/reports/dashboard-stats');
      setTotalIncomesSum(statsRes.data.data.cards.totalIncomes || 0);
    } catch (err) {
      toast.error('Failed to load income records');
    } finally {
      setLoadingIncomes(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  useEffect(() => {
    fetchIncomes();
  }, [searchQuery, sourceFilter, page]);

  // ----------------------------------------------------
  // Income CRUD Logic
  // ----------------------------------------------------
  const openIncomeForm = (income = null) => {
    setSelectedIncome(income);
    if (income) {
      setIncomeValue('amount', income.amount);
      setIncomeValue('incomeSource', income.incomeSource?._id || income.incomeSource);
      setIncomeValue('date', income.date ? new Date(income.date).toISOString().split('T')[0] : '');
      setIncomeValue('receivedThrough', income.receivedThrough);
      setIncomeValue('referenceNumber', income.referenceNumber || '');
      setIncomeValue('description', income.description || '');
    } else {
      resetIncomeForm();
      setIncomeValue('date', new Date().toISOString().split('T')[0]);
      setIncomeValue('receivedThrough', 'Bank Transfer');
    }
    setIsIncomeModalOpen(true);
  };

  const handleSaveIncome = async (data) => {
    try {
      if (selectedIncome) {
        await API.patch(`/incomes/${selectedIncome._id}`, data);
        toast.success('Income transaction updated!');
      } else {
        await API.post('/incomes', data);
        toast.success('Income transaction logged!');
      }
      setIsIncomeModalOpen(false);
      fetchIncomes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  // ----------------------------------------------------
  // Income Source CRUD Logic
  // ----------------------------------------------------
  const openSourceForm = (source = null) => {
    setSelectedSource(source);
    if (source) {
      setSourceValue('name', source.name);
      setSourceValue('description', source.description || '');
      setSelectedColor(source.color || PRESET_COLORS[0]);
    } else {
      resetSourceForm();
      setSelectedColor(PRESET_COLORS[0]);
    }
    setIsSourceModalOpen(true);
  };

  const handleSaveSource = async (data) => {
    const payload = { ...data, color: selectedColor };
    try {
      if (selectedSource) {
        await API.patch(`/income-sources/${selectedSource._id}`, payload);
        toast.success('Income source updated!');
      } else {
        await API.post('/income-sources', payload);
        toast.success('Income source created!');
      }
      setIsSourceModalOpen(false);
      fetchSources();
      fetchIncomes(); // Refresh lists and selects
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  // ----------------------------------------------------
  // Deletion trigger
  // ----------------------------------------------------
  const confirmDelete = (type, data) => {
    setDeleteTarget({ type, data });
    setIsConfirmDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { type, data } = deleteTarget;
    try {
      if (type === 'income') {
        await API.delete(`/incomes/${data._id}`);
        toast.success('Income record deleted!');
        fetchIncomes();
      } else if (type === 'source') {
        await API.delete(`/income-sources/${data._id}`);
        toast.success('Income source deleted!');
        fetchSources();
        fetchIncomes();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete item');
    } finally {
      setIsConfirmDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // ----------------------------------------------------
  // Contribution Graph calculations
  // ----------------------------------------------------
  const sourceContributions = React.useMemo(() => {
    const contributionMap = {};
    sources.forEach((src) => {
      contributionMap[src._id] = { name: src.name, color: src.color, total: 0 };
    });

    let overallSum = 0;
    breakdownData.forEach((item) => {
      if (item._id && contributionMap[item._id]) {
        contributionMap[item._id].total = item.total;
        overallSum += item.total;
      }
    });

    if (overallSum === 0) return [];
    return Object.values(contributionMap)
      .filter((x) => x.total > 0)
      .map((x) => ({
        ...x,
        percentage: (x.total / overallSum) * 100,
      }))
      .sort((a, b) => b.total - a.total);
  }, [breakdownData, sources]);

  // Ledger Table Columns
  const columns = [
    {
      header: 'Source Category',
      accessor: 'incomeSource',
      render: (val) => {
        if (!val) return <span className="text-slate-400">N/A</span>;
        return (
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: val.color || '#3B82F6' }}
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {val.name}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (val) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-450">
          +₹{val.toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (val) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar size={12} />
          {new Date(val).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: 'Received Through',
      accessor: 'receivedThrough',
      render: (val) => (
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-350">
          <CreditCard size={10} /> {val}
        </span>
      ),
    },
    {
      header: 'Reference Code',
      accessor: 'referenceNumber',
      render: (val) => (
        <span className="font-mono text-xs text-slate-400">{val || '-'}</span>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (val) => val || '-',
    },
    {
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openIncomeForm(row)}
            title="Edit Transaction"
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-855"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => confirmDelete('income', row)}
            title="Delete Transaction"
            className="rounded-lg p-1.5 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Title Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Multiple Income Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log various revenue channels, track dynamic income categories, and evaluate cash inflows.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openSourceForm()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-755 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Plus size={16} /> New Category
          </button>
          <button
            onClick={() => openIncomeForm()}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all cursor-pointer"
          >
            <Plus size={16} /> Log Inward Cash
          </button>
        </div>
      </div>

      {/* Tabs Menu Selection */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`pb-4 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'ledger'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-450 dark:text-emerald-450'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Income Ledger & Transactions
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`pb-4 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'sources'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-450 dark:text-emerald-450'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Manage Income Sources
          </button>
        </nav>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* LEDGER TAB VIEW */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Income Logged
                </span>
                <h3 className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹{totalIncomesSum.toFixed(2)}
                </h3>
              </div>
              <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                <Coins size={22} />
              </div>
            </div>

            {/* Income breakdown distribution visual */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:col-span-2 space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Category Contribution Share
              </span>
              
              {/* Stacked Progress Bar */}
              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                {sourceContributions.map((contrib, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${contrib.percentage}%`,
                      backgroundColor: contrib.color,
                    }}
                    title={`${contrib.name}: ${contrib.percentage.toFixed(1)}% (₹${contrib.total.toFixed(2)})`}
                    className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                  />
                ))}
                {sourceContributions.length === 0 && (
                  <div className="h-full w-full bg-slate-200 dark:bg-slate-800" />
                )}
              </div>

              {/* Legends list */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {sourceContributions.map((contrib, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: contrib.color }} />
                    <span className="font-medium text-slate-700 dark:text-slate-350">{contrib.name}</span>
                    <span className="text-slate-400">({contrib.percentage.toFixed(0)}%)</span>
                  </div>
                ))}
                {sourceContributions.length === 0 && (
                  <span className="text-slate-400">No transactions recorded yet to display contributions.</span>
                )}
              </div>
            </div>
          </div>

          {/* Filtering panels */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Category:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">All Categories</option>
                {sources.map((src) => (
                  <option key={src._id} value={src._id}>
                    {src.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data list */}
          <DataTable
            columns={columns}
            data={incomes}
            loading={loadingIncomes}
            searchPlaceholder="Search description or reference code..."
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            emptyState={
              <EmptyState
                icon={Coins}
                title="No Inward Inflows Logged"
                message="Your incomes ledger is currently clean. Log consulting fees, salary, or asset profits."
                actionText="Log Income Transaction"
                onAction={() => openIncomeForm()}
              />
            }
          />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* INCOME SOURCES MANAGING VIEW */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          {loadingSources ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((x) => (
                <div key={x} className="h-36 rounded-xl bg-white p-6 shadow-sm border border-slate-200 animate-pulse dark:bg-slate-900 dark:border-slate-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sources.map((src) => (
                <div
                  key={src._id}
                  className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:scale-[1.01] transition-all dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Color strip accent */}
                  <span
                    className="absolute top-0 right-0 left-0 h-1.5"
                    style={{ backgroundColor: src.color || '#3B82F6' }}
                  />
                  <div>
                    <div className="flex items-center justify-between mt-1">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Tag size={14} style={{ color: src.color }} />
                        {src.name}
                      </h3>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full select-none"
                        style={{ backgroundColor: `${src.color}15`, color: src.color }}
                      >
                        Category
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 line-clamp-2">
                      {src.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-50 dark:border-slate-855 flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => openSourceForm(src)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 cursor-pointer"
                    >
                      <Edit size={12} /> Edit
                    </button>
                    <span className="text-slate-250">|</span>
                    <button
                      onClick={() => confirmDelete('source', src)}
                      className="inline-flex items-center gap-1 text-red-650 hover:text-red-750 cursor-pointer"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}

              {sources.length === 0 && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <EmptyState
                    icon={Layers}
                    title="No Categories Yet"
                    message="Setup multiple income source categories to divide and filter profits ledger."
                    actionText="Add Income Category"
                    onAction={() => openSourceForm()}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: Log/Edit Income Transaction */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        title={selectedIncome ? 'Edit Income Transaction' : 'Log Inward Income Entry'}
      >
        <form onSubmit={handleIncomeSubmit(handleSaveIncome)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Income Category Source *
              </label>
              <select
                {...registerIncome('incomeSource', { required: 'Category is required' })}
                className="form-input"
              >
                <option value="">Select Category</option>
                {sources.map((src) => (
                  <option key={src._id} value={src._id}>
                    {src.name}
                  </option>
                ))}
              </select>
              {incomeErrors.incomeSource && <span className="text-xs text-red-500">{incomeErrors.incomeSource.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Amount Received (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                {...registerIncome('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than zero' }
                })}
                className="form-input"
              />
              {incomeErrors.amount && <span className="text-xs text-red-500">{incomeErrors.amount.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Inflow Date *
              </label>
              <input
                type="date"
                {...registerIncome('date', { required: 'Date is required' })}
                className="form-input"
              />
              {incomeErrors.date && <span className="text-xs text-red-500">{incomeErrors.date.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Received Through *
              </label>
              <select
                {...registerIncome('receivedThrough', { required: 'Method is required' })}
                className="form-input"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Other">Other</option>
              </select>
              {incomeErrors.receivedThrough && <span className="text-xs text-red-500">{incomeErrors.receivedThrough.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Reference Code (Txn ID / Slip)
            </label>
            <input
              type="text"
              placeholder="e.g. TXN-1920392 or bank ref"
              {...registerIncome('referenceNumber')}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Description / Notes
            </label>
            <textarea
              placeholder="Provide a memo for this transaction..."
              {...registerIncome('description')}
              rows="2.5"
              className="form-input"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsIncomeModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 cursor-pointer"
            >
              {selectedIncome ? 'Save Transaction' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL: Add/Edit Income Source Category */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        title={selectedSource ? 'Edit Income Category' : 'Create Income Source Category'}
      >
        <form onSubmit={handleSourceSubmit(handleSaveSource)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Category Name *
            </label>
            <input
              type="text"
              placeholder="e.g. YouTube Earnings, Dividends"
              {...registerSource('name', { required: 'Category name is required' })}
              className="form-input"
            />
            {sourceErrors.name && <span className="text-xs text-red-500">{sourceErrors.name.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Short Description
            </label>
            <textarea
              placeholder="Brief summary describing this stream..."
              {...registerSource('description')}
              rows="2"
              className="form-input"
            />
          </div>

          {/* Color badges list picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Category Theme Color
            </label>
            <div className="flex flex-wrap gap-2.5 mt-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  className={`h-7 w-7 rounded-full transition-all border-3 cursor-pointer ${
                    selectedColor === color
                      ? 'border-white ring-2 ring-emerald-500 scale-105'
                      : 'border-transparent scale-95 opacity-80 hover:opacity-100 hover:scale-100'
                  }`}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSourceModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 cursor-pointer"
            >
              {selectedSource ? 'Save Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={executeDelete}
        title={deleteTarget?.type === 'income' ? 'Delete Income Record?' : 'Delete Income Source Category?'}
        message={
          deleteTarget?.type === 'income'
            ? 'Are you sure you want to delete this recorded income transaction? This cannot be undone.'
            : 'Are you sure you want to delete this income category? This will fail if there are active transactions under it.'
        }
      />
    </div>
  );
};

export default Incomes;
