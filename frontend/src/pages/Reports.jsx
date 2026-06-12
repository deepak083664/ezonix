import React, { useState } from 'react';
import API from '../services/api';
import { FileDown, Calendar, FileJson, FileSpreadsheet, ServerCrash } from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('sales');

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({ sum: 0, count: 0 });

  const generateReport = async () => {
    setLoading(true);
    try {
      const datesParam = `?startDate=${startDate}&endDate=${endDate}`;
      let endpoint = '/reports/sales';
      if (reportType === 'expenses') endpoint = '/reports/expenses';
      if (reportType === 'purchases') endpoint = '/reports/purchases';
      if (reportType === 'incomes') endpoint = '/reports/incomes';

      const res = await API.get(`${endpoint}${datesParam}`);
      
      let itemsList = [];
      let totalSum = 0;

      if (reportType === 'sales') {
        itemsList = res.data.data.invoices;
        totalSum = itemsList.reduce((acc, x) => acc + x.grandTotal, 0);
      } else if (reportType === 'expenses') {
        itemsList = res.data.data.expenses;
        totalSum = itemsList.reduce((acc, x) => acc + x.amount, 0);
      } else if (reportType === 'purchases') {
        itemsList = res.data.data.purchases;
        totalSum = itemsList.reduce((acc, x) => acc + x.amount, 0);
      } else if (reportType === 'incomes') {
        itemsList = res.data.data.incomes;
        totalSum = itemsList.reduce((acc, x) => acc + x.amount, 0);
      }

      setRecords(itemsList);
      setTotals({ sum: totalSum, count: itemsList.length });
      toast.success('Report compiled successfully!');
    } catch (err) {
      toast.error('Failed to compile report metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const datesParam = `?startDate=${startDate}&endDate=${endDate}`;
    const url = `http://localhost:5000/api/v1/reports/${reportType}/excel${datesParam}`;
    window.open(url, '_blank');
    toast.success('Downloading Excel Report sheet...');
  };

  // Bulk Export Handlers
  const handleBulkExport = (format) => {
    const endpoint = format === 'excel' ? 'excel' : 'json';
    const url = `http://localhost:5000/api/v1/reports/export/${endpoint}`;
    window.open(url, '_blank');
    toast.success(`Exporting complete business database in ${format.toUpperCase()} format...`);
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reports & Analytical Export
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Filter records by date limits, review total sums, and export formatted Excel sheets.
        </p>
      </div>

      {/* Control panel options */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Report Category
          </label>
          <select
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setRecords([]);
              setTotals({ sum: 0, count: 0 });
            }}
            className="form-input"
          >
            <option value="sales">Sales Invoice Ledger</option>
            <option value="expenses">Operating Expenses</option>
            <option value="purchases">Procurement Intake</option>
            <option value="incomes">General Inward Inflows</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Start Date Limit
          </label>
          <div className="relative">
            <Calendar className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input !pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            End Date Limit
          </label>
          <div className="relative">
            <Calendar className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-input !pl-10"
            />
          </div>
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={generateReport}
            disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 px-4 text-xs font-semibold text-white hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer text-center"
          >
            Compile Data
          </button>
          <button
            onClick={handleExportExcel}
            disabled={records.length === 0}
            title="Download Excel Sheet"
            className="rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
          >
            <FileDown size={18} />
          </button>
        </div>
      </div>

      {/* BULK BUSINESS DATA EXPORT WIDGET */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Export Complete Business Data
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Download full database snapshots compiling Invoices, Customers, Products, Purchases, Expenses, and Payments.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleBulkExport('excel')}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-all cursor-pointer shadow-sm"
          >
            <FileSpreadsheet size={16} /> Export Complete Excel (.xlsx)
          </button>
          <button
            onClick={() => handleBulkExport('json')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <FileJson size={16} /> Export Complete JSON (.json)
          </button>
        </div>
      </div>

      {/* Reports Summary metric cards */}
      {records.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Log Count
            </span>
            <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {totals.count} entries
            </h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sum Aggregate Total
            </span>
            <h3 className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${totals.sum.toFixed(2)}
            </h3>
          </div>
        </div>
      )}

      {/* Compiled Data Log lists */}
      {records.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Compiled Entries Log List
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400 border-collapse">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-350">
                <tr>
                  <th scope="col" className="px-6 py-4">Reference/ID</th>
                  <th scope="col" className="px-6 py-4">Date</th>
                  <th scope="col" className="px-6 py-4">Additional Details</th>
                  <th scope="col" className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {row.invoiceNumber || row.category || row.supplierName || row.incomeSource?.name}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(row.issueDate || row.date || row.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 truncate max-w-xs">
                      {row.customer?.name || row.description || `Procurement Items Count: ${row.items?.length || 0}`}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                      ${(row.grandTotal || row.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
