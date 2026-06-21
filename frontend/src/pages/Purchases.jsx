import React, { useEffect, useState } from 'react';
import API from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, ShoppingBag, PlusCircle, MinusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Dynamic row state
  const [purchaseItems, setPurchaseItems] = useState([{ name: '', quantity: 1, price: 0 }]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/purchases?search=${searchQuery}&page=${page}&limit=10`);
      setPurchases(res.data.data.purchases);
      setTotalPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [searchQuery, page]);

  const handleCreatePurchase = async (data) => {
    // Check item rows
    if (purchaseItems.some((item) => !item.name.trim())) {
      toast.error('Please specify a product name / SKU for all rows');
      return;
    }

    // Sum amount automatically if not specified
    const totalAmount = purchaseItems.reduce((acc, item) => acc + item.quantity * item.price, 0);

    const payload = {
      supplierName: data.supplierName,
      invoiceNumber: data.invoiceNumber,
      purchaseDate: data.purchaseDate || new Date(),
      amount: parseFloat(data.amount || totalAmount),
      items: purchaseItems.map((item) => ({
        name: item.name,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
      })),
    };

    try {
      await API.post('/purchases', payload);
      toast.success('Procurement order logged! Stock quantities updated.');
      setIsCreateOpen(false);
      reset();
      setPurchaseItems([{ name: '', quantity: 1, price: 0 }]);
      fetchPurchases();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record purchase');
    }
  };

  const handleDelete = async () => {
    if (!selectedPurchase) return;
    try {
      await API.delete(`/purchases/${selectedPurchase._id}`);
      toast.success('Procurement logged deleted. Stock adjusted.');
      fetchPurchases();
    } catch (err) {
      toast.error('Failed to delete purchase record');
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...purchaseItems];
    newItems[index][field] = value;
    setPurchaseItems(newItems);
  };

  const addRow = () => {
    setPurchaseItems([...purchaseItems, { name: '', quantity: 1, price: 0 }]);
  };

  const removeRow = (index) => {
    if (purchaseItems.length === 1) return;
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const columns = [
    { header: 'Supplier Name', accessor: 'supplierName', render: (val) => <span className="font-semibold text-slate-800 dark:text-slate-200">{val}</span> },
    { header: 'Invoice Number', accessor: 'invoiceNumber', render: (val) => val || 'N/A' },
    { header: 'Purchase Date', accessor: 'purchaseDate', render: (val) => new Date(val).toLocaleDateString() },
    { header: 'Total Amount', accessor: 'amount', render: (val) => `₹${val.toFixed(2)}` },
    {
      header: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => {
            setSelectedPurchase(row);
            setIsConfirmOpen(true);
          }}
          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Procurement Logs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log inventory intake orders and supplier purchase receipts.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Plus size={16} /> Log Purchase
        </button>
      </div>

      <DataTable
        columns={columns}
        data={purchases}
        loading={loading}
        searchPlaceholder="Search supplier or bill..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={ShoppingBag}
            title="No purchases logged"
            message="No supplier bills logged. Track inventory procurement to update stocks."
            actionText="Log Purchase"
            onAction={() => setIsCreateOpen(true)}
          />
        }
      />

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Record Supplier Purchase">
        <form onSubmit={handleSubmit(handleCreatePurchase)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Supplier Name *
            </label>
            <input
              type="text"
              {...register('supplierName', { required: 'Supplier name is required' })}
              className="form-input"
            />
            {errors.supplierName && <span className="text-xs text-red-500">{errors.supplierName.message}</span>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Supplier Invoice Number
              </label>
              <input type="text" {...register('invoiceNumber')} className="form-input" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Purchase Date
              </label>
              <input type="date" {...register('purchaseDate')} className="form-input" />
            </div>
          </div>

          {/* Add item list */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Purchased Items (Will increment stock of matching SKU / names)
              </label>
              <button
                type="button"
                onClick={addRow}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle size={14} /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {purchaseItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border border-slate-100 p-3 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
                  <input
                    type="text"
                    placeholder="Product SKU or exact Name"
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    className="form-input flex-1"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
                    className="form-input w-20"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Cost"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => handleItemChange(idx, 'price', parseFloat(e.target.value))}
                    className="form-input w-24"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-500"
                  >
                    <MinusCircle size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Total Purchase Cost (₹) (Leave empty to sum item lines automatically)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder={`Auto Calc: ₹${purchaseItems.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(2)}`}
              {...register('amount')}
              className="form-input"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer"
            >
              Record Purchase
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Purchase Log?"
        message="Are you sure you want to delete this procurement record? Product stock counts will be updated accordingly."
      />
    </div>
  );
};

export default Purchases;
