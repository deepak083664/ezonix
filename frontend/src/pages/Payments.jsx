import React, { useEffect, useState } from 'react';
import API from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { useForm } from 'react-hook-form';
import { Plus, CreditCard, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  // Watch selected invoice to auto-fill amount due as placeholder
  const selectedInvoiceId = watch('invoice');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (selectedInvoiceId) {
      const match = pendingInvoices.find((i) => i._id === selectedInvoiceId);
      setSelectedInvoice(match || null);
      if (match) {
        setValue('amountPaid', match.amountDue);
      }
    } else {
      setSelectedInvoice(null);
    }
  }, [selectedInvoiceId, pendingInvoices]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/payments?page=${page}&limit=10`);
      setPayments(res.data.data.payments);
      setTotalPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load payments history');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvoices = async () => {
    try {
      const res = await API.get('/payments/pending');
      setPendingInvoices(res.data.data.pendingInvoices);
    } catch (err) {
      console.error('Failed to load pending bills', err);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchPendingInvoices();
  }, [page]);

  const handleRecordPayment = async (data) => {
    try {
      await API.post('/payments', {
        invoice: data.invoice,
        amountPaid: parseFloat(data.amountPaid),
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate || new Date(),
        notes: data.notes,
      });
      toast.success('Payment receipt logged successfully!');
      setIsRecordOpen(false);
      reset();
      fetchPayments();
      fetchPendingInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log payment transaction');
    }
  };

  const columns = [
    {
      header: 'Invoice Code',
      accessor: 'invoice',
      render: (val) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {val?.invoiceNumber || 'Deleted Invoice'}
        </span>
      ),
    },
    { header: 'Customer', accessor: 'customer', render: (val) => val?.name || 'Deleted Customer' },
    { header: 'Amount Received', accessor: 'amountPaid', render: (val) => `$${val.toFixed(2)}` },
    { header: 'Date Paid', accessor: 'paymentDate', render: (val) => new Date(val).toLocaleDateString() },
    { header: 'Method', accessor: 'paymentMethod', render: (val) => (
      <span className="inline-block rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
        {val}
      </span>
    )},
    { header: 'Memo / Notes', accessor: 'notes', render: (val) => val || '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Payment Receipts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log invoice receipts and review incoming cash ledger histories.
          </p>
        </div>
        <button
          onClick={() => {
            fetchPendingInvoices();
            setIsRecordOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* Grid of receipts */}
      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={CreditCard}
            title="No receipts logged"
            message="No billing payment receipts logged. Record invoice settlements to reconcile ledger."
            actionText="Record Payment"
            onAction={() => setIsRecordOpen(true)}
          />
        }
      />

      {/* Record Modal */}
      <Modal isOpen={isRecordOpen} onClose={() => setIsRecordOpen(false)} title="Log Invoice Payment Receipt">
        <form onSubmit={handleSubmit(handleRecordPayment)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Pending Invoice *
            </label>
            <select
              {...register('invoice', { required: 'Invoice selection is required' })}
              className="form-input"
            >
              <option value="">Choose Invoice</option>
              {pendingInvoices.map((inv) => (
                <option key={inv._id} value={inv._id}>
                  {inv.invoiceNumber} - {inv.customer?.name} (Owes: ${inv.amountDue.toFixed(2)})
                </option>
              ))}
            </select>
            {errors.invoice && <span className="text-xs text-red-500">{errors.invoice.message}</span>}
          </div>

          {selectedInvoice && (
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400">
              <b>Invoice Grand Total:</b> ${selectedInvoice.grandTotal.toFixed(2)} <br />
              <b>Total Paid Previously:</b> ${selectedInvoice.amountPaid.toFixed(2)} <br />
              <b>Remaining Balance Due:</b> ${selectedInvoice.amountDue.toFixed(2)}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Amount Received ($) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('amountPaid', {
                  required: 'Amount received is required',
                  min: { value: 0.01, message: 'Must be positive value' },
                })}
                className="form-input"
              />
              {errors.amountPaid && <span className="text-xs text-red-500">{errors.amountPaid.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Payment Date
              </label>
              <input type="date" {...register('paymentDate')} className="form-input" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Payment Method *
            </label>
            <select
              {...register('paymentMethod', { required: 'Payment method is required' })}
              className="form-input"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
              <option value="Other">Other</option>
            </select>
            {errors.paymentMethod && <span className="text-xs text-red-500">{errors.paymentMethod.message}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Memo / Private Notes
            </label>
            <textarea {...register('notes')} rows="2" className="form-input" />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRecordOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer"
            >
              Record Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;
