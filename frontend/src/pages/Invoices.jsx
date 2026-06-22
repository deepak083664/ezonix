import React, { useEffect, useState } from 'react';
import API, { BACKEND_URL } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { Plus, Edit, Trash2, FileText, Printer, Download, PlusCircle, MinusCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Create Form State
  const [invoiceCustomer, setInvoiceCustomer] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([{ product: '', quantity: 1, taxPercent: 0, discountPercent: 0 }]);
  const [invoiceAmountPaid, setInvoiceAmountPaid] = useState(0);
  const [invoiceOverallDiscount, setInvoiceOverallDiscount] = useState(0);

  // Edit Form State
  const [editStatus, setEditStatus] = useState('');
  const [editAmountPaid, setEditAmountPaid] = useState(0);
  const [editNotes, setEditNotes] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter ? `&status=${statusFilter}` : '';
      const res = await API.get(`/invoices?search=${searchQuery}${statusParam}&page=${page}&limit=10`);
      setInvoices(res.data.data.invoices);
      setTotalPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [custRes, prodRes, setRes] = await Promise.all([
        API.get('/customers?limit=100'),
        API.get('/products?limit=100'),
        API.get('/settings'),
      ]);
      setCustomers(custRes.data.data.customers);
      setProducts(prodRes.data.data.products);
      if (setRes.data.data.setting) {
        setSettings(setRes.data.data.setting);
        // Set default tax rate for items
        const defaultTax = setRes.data.data.setting.defaultTaxRate || 18;
        setInvoiceItems([{ product: '', quantity: 1, taxPercent: defaultTax, discountPercent: 0 }]);
      }
    } catch (err) {
      console.error('Failed to load invoice metadata', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchMetadata();
  }, [searchQuery, statusFilter, page]);

  const openCreateModal = () => {
    setInvoiceCustomer('');
    setInvoiceDueDate('');
    setInvoiceNotes('');
    const defaultTax = settings?.defaultTaxRate || 18;
    setInvoiceItems([{ product: '', quantity: 1, taxPercent: defaultTax, discountPercent: 0 }]);
    setInvoiceAmountPaid(0);
    setInvoiceOverallDiscount(0);
    setIsCreateOpen(true);
  };

  // Handle add item row
  const addItemRow = () => {
    const defaultTax = settings?.defaultTaxRate || 18;
    setInvoiceItems([...invoiceItems, { product: '', quantity: 1, taxPercent: defaultTax, discountPercent: 0 }]);
  };

  // Handle remove item row
  const removeItemRow = (index) => {
    if (invoiceItems.length === 1) return;
    const newItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(newItems);
  };

  // Handle change row item values
  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceItems];
    newItems[index][field] = value;
    setInvoiceItems(newItems);
  };

  // Live total calculations
  const calculateInvoiceTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    invoiceItems.forEach((item) => {
      const product = products.find((p) => p._id === item.product);
      if (product) {
        const itemSub = product.price * item.quantity;
        const itemTax = itemSub * (parseFloat(item.taxPercent || 0) / 100);
        const itemDisc = itemSub * (parseFloat(item.discountPercent || 0) / 100);
        subtotal += itemSub;
        taxTotal += itemTax;
        discountTotal += itemDisc;
      }
    });

    const overallDisc = parseFloat(invoiceOverallDiscount || 0);
    const grandTotal = subtotal + taxTotal - discountTotal - overallDisc;
    const amountDue = Math.max(0, grandTotal - parseFloat(invoiceAmountPaid || 0));

    return {
      subtotal,
      taxTotal,
      discountTotal,
      grandTotal,
      amountDue,
    };
  };

  const totals = calculateInvoiceTotals();

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceCustomer) {
      toast.error('Please select a customer');
      return;
    }
    if (invoiceItems.some((item) => !item.product)) {
      toast.error('Please select product item for all rows');
      return;
    }

    const payload = {
      customer: invoiceCustomer,
      dueDate: invoiceDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      notes: invoiceNotes,
      amountPaid: parseFloat(invoiceAmountPaid || 0),
      overallDiscount: parseFloat(invoiceOverallDiscount || 0),
      items: invoiceItems.map((item) => ({
        product: item.product,
        quantity: parseInt(item.quantity),
        taxPercent: parseFloat(item.taxPercent || 0),
        discountPercent: parseFloat(item.discountPercent || 0),
      })),
    };

    try {
      await API.post('/invoices', payload);
      toast.success('Invoice created successfully!');
      setIsCreateOpen(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  const handleEditInvoice = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/invoices/${selectedInvoice._id}`, {
        status: editStatus,
        amountPaid: parseFloat(editAmountPaid || 0),
        notes: editNotes,
      });
      toast.success('Invoice updated successfully!');
      setIsEditOpen(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update invoice');
    }
  };

  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return;
    try {
      await API.delete(`/invoices/${selectedInvoice._id}`);
      toast.success('Invoice deleted successfully, product stocks restored.');
      fetchInvoices();
    } catch (err) {
      toast.error('Failed to delete invoice');
    }
  };

  const downloadPDF = async (invoiceId, invoiceNum) => {
    const loadingToast = toast.loading('Generating PDF...');
    try {
      const response = await API.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoiceNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.dismiss(loadingToast);
      toast.success('Invoice downloaded successfully!');
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error('Failed to download invoice PDF', err);
      toast.error('Failed to download invoice PDF');
    }
  };

  const printInvoice = async (invId) => {
    toast.loading('Preparing Print Layout...', { duration: 1000 });
    // Fetch full populated details
    try {
      const res = await API.get(`/invoices/${invId}`);
      const inv = res.data.data.invoice;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${inv.invoiceNumber}</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; color: #334155; padding: 40px; margin: 0; line-height: 1.5; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
              .business { font-size: 20px; font-weight: bold; color: #000000; }
              .invoice-title { font-size: 28px; color: #2563eb; font-weight: 800; text-align: right; }
              .details { margin-top: 30px; display: flex; justify-content: space-between; }
              .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; }
              table { width: 100%; border-collapse: collapse; margin-top: 40px; }
              th { background-color: #1e293b; color: white; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; }
              td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .totals { margin-top: 30px; display: flex; justify-content: flex-end; }
              .totals-box { width: 250px; background-color: #f8fafc; padding: 15px; border-radius: 8px; }
              .totals-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
              .grand-total { font-size: 16px; font-weight: bold; color: #2563eb; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 8px; }
              .footer { margin-top: 100px; text-align: center; color: #94a3b8; font-size: 12px; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                  ${settings?.logoUrl ? `
                    <img src="${settings.logoUrl.startsWith('http') ? settings.logoUrl : `${BACKEND_URL}${settings.logoUrl}`}" alt="Logo" style="max-height: 40px; max-width: 120px; object-fit: contain;" />
                  ` : ''}
                  <div class="business">${settings?.businessName || 'Business Management CRM'}</div>
                </div>
                <div style="font-size:12px;margin-top:5px;">
                  ${settings?.address || ''}<br>
                  Phone: ${settings?.phone || ''} | Email: ${settings?.email || ''}<br>
                  ${settings?.gstNumber ? `GSTIN: ${settings.gstNumber}` : ''}
                </div>
              </div>
              <div>
                <div class="invoice-title">INVOICE</div>
                <div style="font-size:12px;text-align:right;margin-top:5px;">
                  Invoice No: ${inv.invoiceNumber}<br>
                  Date: ${new Date(inv.issueDate).toLocaleDateString()}<br>
                  Due Date: ${new Date(inv.dueDate).toLocaleDateString()}<br>
                  Status: <b>${inv.status.toUpperCase()}</b>
                </div>
              </div>
            </div>

            <div class="details">
              <div>
                <div class="section-title">Bill To:</div>
                <div style="font-weight:bold;font-size:15px;">${inv.customer?.name}</div>
                <div style="font-size:13px;margin-top:3px;">
                  ${inv.customer?.address || ''}<br>
                  Phone: ${inv.customer?.phone}<br>
                  ${inv.customer?.email ? `Email: ${inv.customer.email}` : ''}
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th class="text-center">Qty</th>
                  <th class="text-right">Price</th>
                  <th class="text-center">Tax</th>
                  <th class="text-center">Disc</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${inv.items
                  .map((item) => {
                    const sub = item.quantity * item.price;
                    const tax = sub * (item.taxPercent / 100);
                    const disc = sub * (item.discountPercent / 100);
                    const total = sub + tax - disc;
                    return `
                    <tr>
                      <td>${item.name}</td>
                      <td class="text-center">${item.quantity}</td>
                      <td class="text-right">₹${item.price.toFixed(2)}</td>
                      <td class="text-center">${item.taxPercent}%</td>
                      <td class="text-center">${item.discountPercent}%</td>
                      <td class="text-right">₹${total.toFixed(2)}</td>
                    </tr>
                  `;
                  })
                  .join('')}
              </tbody>
            </table>

             <div class="totals">
               <div class="totals-box">
                 <div class="totals-row">
                   <span>Subtotal:</span>
                   <span>₹${(inv.grandTotal + inv.discountTotal - inv.taxTotal).toFixed(2)}</span>
                 </div>
                 <div class="totals-row">
                   <span>Item Discounts:</span>
                   <span>-₹${(inv.discountTotal - (inv.overallDiscount || 0)).toFixed(2)}</span>
                 </div>
                 ${inv.overallDiscount > 0 ? `
                 <div class="totals-row">
                   <span>Overall Discount:</span>
                   <span>-₹${inv.overallDiscount.toFixed(2)}</span>
                 </div>
                 ` : ''}
                 <div class="totals-row">
                   <span>Tax Total:</span>
                   <span>+₹${inv.taxTotal.toFixed(2)}</span>
                 </div>
                 <div class="totals-row grand-total">
                   <span>Grand Total:</span>
                   <span>₹${inv.grandTotal.toFixed(2)}</span>
                 </div>
                 <div class="totals-row" style="margin-top:10px;font-size:12px;color:#64748b;">
                   <span>Amount Paid:</span>
                   <span>₹${inv.amountPaid.toFixed(2)}</span>
                 </div>
                 <div class="totals-row" style="font-size:12px;color:#ef4444;font-weight:bold;">
                   <span>Amount Due:</span>
                   <span>₹${inv.amountDue.toFixed(2)}</span>
                 </div>
               </div>
             </div>

            ${inv.notes ? `<div style="margin-top:40px;font-size:13px;"><b>Notes:</b><br>${inv.notes}</div>` : ''}

            <div class="footer">
              Thank you for choosing our business!
            </div>

            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() { window.close(); };
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      toast.error('Failed to compile print view');
    }
  };

  const openEditModal = (invoice) => {
    setSelectedInvoice(invoice);
    setEditStatus(invoice.status);
    setEditAmountPaid(invoice.amountPaid);
    setEditNotes(invoice.notes || '');
    setIsEditOpen(true);
  };

  const columns = [
    {
      header: 'Invoice Number',
      accessor: 'invoiceNumber',
      render: (val, row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <FileText size={14} className="text-slate-400" />
          {val}
        </span>
      ),
    },
    { header: 'Customer', accessor: 'customer', render: (val) => val?.name || 'Deleted Customer' },
    { header: 'Issue Date', accessor: 'issueDate', render: (val) => new Date(val).toLocaleDateString() },
    { header: 'Grand Total', accessor: 'grandTotal', render: (val) => `₹${val.toFixed(2)}` },
    { header: 'Due Balance', accessor: 'amountDue', render: (val) => `₹${val.toFixed(2)}` },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => {
        let theme = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        if (val === 'paid') theme = 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400';
        if (val === 'pending') theme = 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400';
        if (val === 'overdue') theme = 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400';
        return <span className={`rounded px-1.5 py-0.5 text-xs font-semibold uppercase ${theme}`}>{val}</span>;
      },
    },
    {
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => printInvoice(row._id)}
            title="Print Invoice"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Printer size={16} />
          </button>
          <button
            onClick={() => downloadPDF(row._id, row.invoiceNumber)}
            title="Download PDF"
            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => openEditModal(row)}
            title="Edit Status"
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedInvoice(row);
              setIsConfirmOpen(true);
            }}
            title="Delete Invoice"
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
            Invoice Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate printable PDF invoices, decrement stock, and log invoice payment records.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* Filter panel */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Invoices</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        searchPlaceholder="Search invoices by code..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={FileText}
            title="No invoices found"
            message="No billing records match filter conditions. Generate one to adjust items."
            actionText="Create Invoice"
            onAction={openCreateModal}
          />
        }
      />

      {/* CREATE INVOICE FULLSCREEN MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Billing Invoice">
        <form onSubmit={handleCreateInvoice} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Select Customer *
              </label>
              <select
                value={invoiceCustomer}
                onChange={(e) => setInvoiceCustomer(e.target.value)}
                className="form-input"
                required
              >
                <option value="">Choose Customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={invoiceDueDate}
                onChange={(e) => setInvoiceDueDate(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Items addition */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Line Items (Products)
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle size={14} /> Add Row
              </button>
            </div>

            {/* List of row additions */}
            <div className="space-y-3">
              {invoiceItems.map((item, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 p-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                  {/* Select product */}
                  <div className="flex-1 min-w-[200px]">
                    <select
                      value={item.product}
                      onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                      className="form-input"
                      required
                    >
                      <option value="">Select Item</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} (₹{p.price.toFixed(2)} - Qty: {p.quantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="w-20">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
                      className="form-input"
                      required
                    />
                  </div>

                  {/* Tax */}
                  <div className="w-20">
                    <input
                      type="number"
                      placeholder="Tax %"
                      value={item.taxPercent}
                      onChange={(e) => handleItemChange(idx, 'taxPercent', parseFloat(e.target.value))}
                      className="form-input"
                    />
                  </div>

                  {/* Discount */}
                  <div className="w-20">
                    <input
                      type="number"
                      placeholder="Disc %"
                      value={item.discountPercent}
                      onChange={(e) => handleItemChange(idx, 'discountPercent', parseFloat(e.target.value))}
                      className="form-input"
                    />
                  </div>

                  {/* Remove row */}
                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                  >
                    <MinusCircle size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment and discount recorded immediately */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Overall Discount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={invoiceOverallDiscount}
                onChange={(e) => setInvoiceOverallDiscount(e.target.value)}
                placeholder="0.00"
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Initial Amount Paid (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={invoiceAmountPaid}
                onChange={(e) => setInvoiceAmountPaid(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Billing Notes / Terms
              </label>
              <textarea
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                rows="1"
                className="form-input"
              />
            </div>
          </div>

          {/* Totals panel summaries */}
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800 space-y-2 text-sm text-slate-600 dark:text-slate-350">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                ₹{totals.subtotal.toFixed(2)}
              </span>
            </div>
             <div className="flex justify-between">
               <span>Item Discounts:</span>
               <span className="font-semibold text-red-600 dark:text-red-400">
                 -₹{totals.discountTotal.toFixed(2)}
               </span>
             </div>
             {parseFloat(invoiceOverallDiscount || 0) > 0 && (
               <div className="flex justify-between">
                 <span>Overall Discount:</span>
                 <span className="font-semibold text-red-600 dark:text-red-400">
                   -₹{parseFloat(invoiceOverallDiscount).toFixed(2)}
                 </span>
               </div>
             )}
            <div className="flex justify-between">
              <span>Tax Total:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                +₹{totals.taxTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-md font-bold text-slate-800 dark:border-slate-700 dark:text-white">
              <span>Grand Total:</span>
              <span>₹{totals.grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-red-500 font-bold">
              <span>Amount Outstanding Due:</span>
              <span>₹{totals.amountDue.toFixed(2)}</span>
            </div>
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
              Generate Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT INVOICE MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Invoice Status">
        <form onSubmit={handleEditInvoice} className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800 mb-4 text-xs font-semibold text-slate-500">
            Invoice Number: {selectedInvoice?.invoiceNumber}<br />
            Total: ₹{selectedInvoice?.grandTotal.toFixed(2)}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Payment Status
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="form-input"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Total Amount Paid (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={editAmountPaid}
              onChange={(e) => setEditAmountPaid(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Notes
            </label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows="2"
              className="form-input"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteInvoice}
        title="Delete Invoice?"
        message="Are you sure you want to delete this invoice? The products stock will be restored."
      />
    </div>
  );
};

export default Invoices;
