import React, { useEffect, useState } from 'react';
import API from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, FileText, Users, Eye, History } from 'lucide-react';
import toast from 'react-hot-toast';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals controllers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/customers?search=${searchQuery}&page=${page}&limit=10`);
      setCustomers(res.data.data.customers);
      setTotalPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery, page]);

  const handleCreateOrUpdate = async (data) => {
    try {
      if (selectedCustomer) {
        // Update
        await API.patch(`/customers/${selectedCustomer._id}`, data);
        toast.success('Customer updated successfully!');
      } else {
        // Create
        await API.post('/customers', data);
        toast.success('Customer added successfully!');
      }
      setIsFormOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    try {
      await API.delete(`/customers/${selectedCustomer._id}`);
      toast.success('Customer deleted successfully!');
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const fetchLedger = async (customer) => {
    setSelectedCustomer(customer);
    setIsLedgerOpen(true);
    setLedgerLoading(true);
    try {
      const res = await API.get(`/customers/${customer._id}/ledger`);
      setLedgerData(res.data.data);
    } catch (err) {
      toast.error('Failed to load ledger history');
    } finally {
      setLedgerLoading(false);
    }
  };

  const openFormModal = (customer = null) => {
    setSelectedCustomer(customer);
    if (customer) {
      setValue('name', customer.name);
      setValue('phone', customer.phone);
      setValue('email', customer.email);
      setValue('address', customer.address);
      setValue('gstNumber', customer.gstNumber);
    } else {
      reset();
    }
    setIsFormOpen(true);
  };

  const openConfirmModal = (customer) => {
    setSelectedCustomer(customer);
    setIsConfirmOpen(true);
  };

  // Table Columns mapping
  const columns = [
    { header: 'Name', accessor: 'name', render: (val, row) => <span className="font-semibold text-slate-800 dark:text-slate-200">{val}</span> },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Email', accessor: 'email', render: (val) => val || '-' },
    { header: 'GST Number', accessor: 'gstNumber', render: (val) => val || '-' },
    {
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => fetchLedger(row)}
            title="Customer Ledger"
            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            <History size={16} />
          </button>
          <button
            onClick={() => openFormModal(row)}
            title="Edit Customer"
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => openConfirmModal(row)}
            title="Delete Customer"
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
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Customer Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create, update and track customer ledgers.
          </p>
        </div>
        <button
          onClick={() => openFormModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none transition-all cursor-pointer"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Grid Table */}
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        searchPlaceholder="Search customers by name, phone..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={Users}
            title="No customers"
            message="Get started by creating your first business customer profile."
            actionText="Add Customer"
            onAction={() => openFormModal()}
          />
        }
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Customer name is required' })}
              className="form-input"
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Phone Number *
              </label>
              <input
                type="text"
                {...register('phone', { required: 'Phone number is required' })}
                className="form-input"
              />
              {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input type="email" {...register('email')} className="form-input" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              GSTIN / GST Number
            </label>
            <input
              type="text"
              placeholder="e.g. 22AAAAA0000A1Z5"
              {...register('gstNumber')}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Billing Address
            </label>
            <textarea {...register('address')} rows="2" className="form-input" />
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
              {selectedCustomer ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Customer?"
        message={`Are you sure you want to delete ${selectedCustomer?.name}? This will check for existing invoices.`}
      />

      {/* Ledger history Drawer/Modal */}
      <Modal
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        title={`${selectedCustomer?.name || 'Customer'} Ledger Statement`}
      >
        {ledgerLoading ? (
          <div className="space-y-4">
            <div className="h-6 w-1/3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse-subtle"></div>
            <div className="h-40 rounded bg-slate-100 dark:bg-slate-800 animate-pulse-subtle"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ledger balance stat */}
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800 flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Outstanding Balance
                </p>
                <h4 className="text-xl font-extrabold text-slate-850 dark:text-white mt-1">
                  ₹{ledgerData?.runningBalance?.toFixed(2) || '0.00'}
                </h4>
              </div>
              <span
                className={`inline-block rounded px-2 py-1 text-xs font-semibold uppercase ${
                  (ledgerData?.runningBalance || 0) > 0
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                }`}
              >
                {(ledgerData?.runningBalance || 0) > 0 ? 'Dues Pending' : 'Balanced'}
              </span>
            </div>

            {/* Ledger Timeline */}
            <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Transaction Timeline
              </h4>
              {ledgerData?.ledger?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                >
                  <div>
                    <span className="text-xs text-slate-400">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {item.type} ({item.reference})
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        item.direction === 'debit'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}
                    >
                      {item.direction === 'debit' ? '+' : '-'}₹{item.amount.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Bal: ₹{item.runningBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {ledgerData?.ledger?.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-6">No transactions logged yet.</p>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsLedgerOpen(false)}
                className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Close Ledger
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Customers;
