const ExcelJS = require('exceljs');
const Invoice = require('../models/Invoice');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');
const Income = require('../models/Income');
const IncomeSource = require('../models/IncomeSource');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const escapeRegExp = require('../utils/escapeRegExp');

// Helper to validate and parse date inputs safely
const parseDateInput = (dateStr) => {
  if (!dateStr) return undefined;
  const parsed = Date.parse(dateStr);
  if (isNaN(parsed)) {
    throw new AppError('Invalid date format provided. Please use YYYY-MM-DD.', 400);
  }
  return new Date(parsed);
};

// Helper to escape CSV/Excel formulas to prevent injection
const sanitizeExcelVal = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' && /^[=\+\-\@\t\r]/.test(val)) {
    return `'${val}`;
  }
  return val;
};

// ==========================================
// METRICS & ALERTS & ACTIVITY FEED CONTROLLER
// ==========================================

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  // 1) Summary metrics
  const totalSalesQuery = await Invoice.aggregate([
    { $group: { _id: null, total: { $sum: '$grandTotal' } } },
  ]);
  const totalSales = totalSalesQuery[0]?.total || 0;

  const totalPurchasesQuery = await Purchase.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalPurchases = totalPurchasesQuery[0]?.total || 0;

  const totalExpensesQuery = await Expense.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalExpenses = totalExpensesQuery[0]?.total || 0;

  const pendingPaymentsQuery = await Invoice.aggregate([
    { $group: { _id: null, total: { $sum: '$amountDue' } } },
  ]);
  const pendingPayments = pendingPaymentsQuery[0]?.total || 0;

  const totalCustomers = await Customer.countDocuments();
  const totalProducts = await Product.countDocuments();

  const totalIncomesQuery = await Income.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalIncomes = totalIncomesQuery[0]?.total || 0;

  // 2) Financial growth Area Chart (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const salesMonthly = await Invoice.aggregate([
    { $match: { issueDate: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: '$issueDate' }, year: { $year: '$issueDate' } },
        total: { $sum: '$grandTotal' },
      },
    },
  ]);

  const purchasesMonthly = await Purchase.aggregate([
    { $match: { purchaseDate: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: '$purchaseDate' }, year: { $year: '$purchaseDate' } },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const expensesMonthly = await Expense.aggregate([
    { $match: { date: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: '$date' }, year: { $year: '$date' } },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const incomesMonthly = await Income.aggregate([
    { $match: { date: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: '$date' }, year: { $year: '$date' } },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const monthsList = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthsList.push({
      monthName: d.toLocaleString('default', { month: 'short' }),
      monthNum: d.getMonth() + 1,
      year: d.getFullYear(),
      sales: 0,
      purchases: 0,
      expenses: 0,
      incomes: 0,
    });
  }

  monthsList.forEach((m) => {
    const saleMatch = salesMonthly.find((s) => s._id.month === m.monthNum && s._id.year === m.year);
    if (saleMatch) m.sales = saleMatch.total;

    const purchaseMatch = purchasesMonthly.find((p) => p._id.month === m.monthNum && p._id.year === m.year);
    if (purchaseMatch) m.purchases = purchaseMatch.total;

    const expenseMatch = expensesMonthly.find((e) => e._id.month === m.monthNum && e._id.year === m.year);
    if (expenseMatch) m.expenses = expenseMatch.total;

    const incomeMatch = incomesMonthly.find((inc) => inc._id.month === m.monthNum && inc._id.year === m.year);
    if (incomeMatch) m.incomes = incomeMatch.total;
  });

  // 3) Dashboard Widgets & Notifications alerts
  const recentInvoices = await Invoice.find()
    .populate('customer', 'name')
    .sort({ issueDate: -1 })
    .limit(5);

  const recentCustomers = await Customer.find()
    .sort({ createdAt: -1 })
    .limit(5);

  const lowStockProducts = await Product.find({
    $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
  })
    .populate('category', 'name')
    .sort({ quantity: 1 }); // Send ALL low stock products for dashboard warning alerts

  const pendingInvoices = await Invoice.find({ amountDue: { $gt: 0 } })
    .populate('customer', 'name')
    .sort({ dueDate: 1 }); // Send ALL pending invoices for banner alert warning notifications

  // 4) Latest Activity Logs feed (last 10 items)
  const activityLogs = await ActivityLog.find()
    .sort({ timestamp: -1 })
    .limit(10);

  res.status(200).json({
    status: 'success',
    data: {
      cards: {
        totalSales,
        totalPurchases,
        totalExpenses,
        pendingPayments,
        totalCustomers,
        totalProducts,
        totalIncomes,
      },
      charts: monthsList,
      widgets: {
        recentInvoices,
        recentCustomers,
        lowStockProducts: lowStockProducts.slice(0, 5), // Only top 5 widgets
      },
      notifications: {
        lowStockAlerts: lowStockProducts, // Full list
        pendingPaymentsAlerts: pendingInvoices, // Full list
      },
      activityLogs,
    },
  });
});

// ==========================================
// INSTANT GLOBAL SEARCH ENDPOINT
// ==========================================

exports.globalSearch = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  if (!query || query.trim() === '') {
    return res.status(200).json({
      status: 'success',
      data: { customers: [], products: [], invoices: [] },
    });
  }

  const regex = new RegExp(escapeRegExp(query), 'i');

  const [customers, products, invoices] = await Promise.all([
    Customer.find({
      $or: [{ name: regex }, { phone: regex }, { email: regex }],
    }).limit(5),
    Product.find({
      $or: [{ name: regex }, { sku: regex }],
    }).limit(5),
    Invoice.find({
      invoiceNumber: regex,
    }).populate('customer', 'name').limit(5),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      customers,
      products,
      invoices,
    },
  });
});

// ==========================================
// EXCEL & JSON COMPLETE EXPORTS
// ==========================================

exports.exportCompleteJSON = catchAsync(async (req, res, next) => {
  const [invoices, customers, products, purchases, expenses, payments, activityLogs, incomes, incomeSources] = await Promise.all([
    Invoice.find().lean(),
    Customer.find().lean(),
    Product.find().lean(),
    Purchase.find().lean(),
    Expense.find().lean(),
    Payment.find().lean(),
    ActivityLog.find().lean(),
    Income.find().populate('incomeSource', 'name').lean(),
    IncomeSource.find().lean(),
  ]);

  const completeData = {
    exportDate: new Date(),
    invoices,
    customers,
    products,
    purchases,
    expenses,
    payments,
    activityLogs,
    incomes,
    incomeSources,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=Complete-Business-Data.json');
  res.status(200).send(JSON.stringify(completeData, null, 2));
});

exports.exportCompleteExcel = catchAsync(async (req, res, next) => {
  const [invoices, customers, products, purchases, expenses, payments, incomes] = await Promise.all([
    Invoice.find().populate('customer', 'name email').lean(),
    Customer.find().lean(),
    Product.find().populate('category', 'name').lean(),
    Purchase.find().lean(),
    Expense.find().lean(),
    Payment.find().populate('customer', 'name').populate('invoice', 'invoiceNumber').lean(),
    Income.find().populate('incomeSource', 'name').lean(),
  ]);

  const workbook = new ExcelJS.Workbook();

  // Style helper
  const addStyledHeader = (worksheet, columns, color) => {
    worksheet.columns = columns;
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: color },
    };
  };

  // 1) Invoices Sheet
  const invSheet = workbook.addWorksheet('Invoices');
  addStyledHeader(
    invSheet,
    [
      { header: 'Invoice Number', key: 'invoiceNumber', width: 22 },
      { header: 'Customer', key: 'customerName', width: 22 },
      { header: 'Issue Date', key: 'issueDate', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 15 },
      { header: 'Grand Total (₹)', key: 'grandTotal', width: 15 },
      { header: 'Amount Paid (₹)', key: 'amountPaid', width: 15 },
      { header: 'Amount Due (₹)', key: 'amountDue', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
    ],
    '2563EB'
  );
  invoices.forEach((x) =>
    invSheet.addRow({
      invoiceNumber: sanitizeExcelVal(x.invoiceNumber),
      customerName: sanitizeExcelVal(x.customer?.name || 'Deleted Customer'),
      issueDate: new Date(x.issueDate).toLocaleDateString(),
      dueDate: new Date(x.dueDate).toLocaleDateString(),
      grandTotal: x.grandTotal,
      amountPaid: x.amountPaid,
      amountDue: x.amountDue,
      status: sanitizeExcelVal(x.status.toUpperCase()),
    })
  );

  // 2) Customers Sheet
  const custSheet = workbook.addWorksheet('Customers');
  addStyledHeader(
    custSheet,
    [
      { header: 'Customer Name', key: 'name', width: 22 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'GSTIN', key: 'gstNumber', width: 18 },
      { header: 'Address', key: 'address', width: 30 },
    ],
    '1E293B'
  );
  customers.forEach((x) =>
    custSheet.addRow({
      name: sanitizeExcelVal(x.name),
      phone: sanitizeExcelVal(x.phone),
      email: sanitizeExcelVal(x.email),
      gstNumber: sanitizeExcelVal(x.gstNumber),
      address: sanitizeExcelVal(x.address),
    })
  );

  // 3) Products Sheet
  const prodSheet = workbook.addWorksheet('Products');
  addStyledHeader(
    prodSheet,
    [
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Product Name', key: 'name', width: 22 },
      { header: 'Category', key: 'categoryName', width: 18 },
      { header: 'Price (₹)', key: 'price', width: 12 },
      { header: 'Stock Qty', key: 'quantity', width: 12 },
      { header: 'Low Stock Limit', key: 'lowStockThreshold', width: 15 },
    ],
    '0F766E'
  );
  products.forEach((x) =>
    prodSheet.addRow({
      sku: sanitizeExcelVal(x.sku),
      name: sanitizeExcelVal(x.name),
      categoryName: sanitizeExcelVal(x.category?.name || 'N/A'),
      price: x.price,
      quantity: x.quantity,
      lowStockThreshold: x.lowStockThreshold,
    })
  );

  // 4) Purchases Sheet
  const purSheet = workbook.addWorksheet('Purchases');
  addStyledHeader(
    purSheet,
    [
      { header: 'Supplier Name', key: 'supplierName', width: 22 },
      { header: 'Invoice Code', key: 'invoiceNumber', width: 15 },
      { header: 'Purchase Date', key: 'purchaseDate', width: 15 },
      { header: 'Amount (₹)', key: 'amount', width: 12 },
    ],
    'B45309'
  );
  purchases.forEach((x) =>
    purSheet.addRow({
      supplierName: sanitizeExcelVal(x.supplierName),
      invoiceNumber: sanitizeExcelVal(x.invoiceNumber || 'N/A'),
      purchaseDate: new Date(x.purchaseDate).toLocaleDateString(),
      amount: x.amount,
    })
  );

  // 5) Expenses Sheet
  const expSheet = workbook.addWorksheet('Expenses');
  addStyledHeader(
    expSheet,
    [
      { header: 'Category', key: 'category', width: 18 },
      { header: 'Amount (₹)', key: 'amount', width: 12 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Description', key: 'description', width: 30 },
    ],
    'BE123C'
  );
  expenses.forEach((x) =>
    expSheet.addRow({
      category: sanitizeExcelVal(x.category),
      amount: x.amount,
      date: new Date(x.date).toLocaleDateString(),
      description: sanitizeExcelVal(x.description || ''),
    })
  );

  // 6) Payments Sheet
  const paySheet = workbook.addWorksheet('Payments');
  addStyledHeader(
    paySheet,
    [
      { header: 'Invoice Number', key: 'invoiceNum', width: 22 },
      { header: 'Customer Name', key: 'customerName', width: 22 },
      { header: 'Amount Paid (₹)', key: 'amountPaid', width: 15 },
      { header: 'Payment Date', key: 'paymentDate', width: 15 },
      { header: 'Method', key: 'paymentMethod', width: 15 },
    ],
    '6D28D9'
  );
  payments.forEach((x) =>
    paySheet.addRow({
      invoiceNum: sanitizeExcelVal(x.invoice?.invoiceNumber || 'Deleted Invoice'),
      customerName: sanitizeExcelVal(x.customer?.name || 'Deleted Customer'),
      amountPaid: x.amountPaid,
      paymentDate: new Date(x.paymentDate).toLocaleDateString(),
      paymentMethod: sanitizeExcelVal(x.paymentMethod),
    })
  );

  // 7) Incomes Sheet
  const incomeSheet = workbook.addWorksheet('Incomes');
  addStyledHeader(
    incomeSheet,
    [
      { header: 'Source Category', key: 'incomeSourceName', width: 22 },
      { header: 'Amount (₹)', key: 'amount', width: 12 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Received Through', key: 'receivedThrough', width: 18 },
      { header: 'Reference Code', key: 'referenceNumber', width: 20 },
      { header: 'Description / Notes', key: 'description', width: 30 },
    ],
    '10B981'
  );
  incomes.forEach((x) =>
    incomeSheet.addRow({
      incomeSourceName: sanitizeExcelVal(x.incomeSource?.name || 'Deleted Source'),
      amount: x.amount,
      date: new Date(x.date).toLocaleDateString(),
      receivedThrough: sanitizeExcelVal(x.receivedThrough),
      referenceNumber: sanitizeExcelVal(x.referenceNumber || 'N/A'),
      description: sanitizeExcelVal(x.description || ''),
    })
  );

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename=Complete-Business-Data.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});

// ==========================================
// DATE REPORTS RETENTION (Reused in reports page)
// ==========================================

exports.getSalesReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const filter = {};

  if (startDate || endDate) {
    filter.issueDate = {};
    if (startDate) filter.issueDate.$gte = parseDateInput(startDate);
    if (endDate) filter.issueDate.$lte = parseDateInput(endDate);
  }

  const invoices = await Invoice.find(filter)
    .populate('customer', 'name phone email')
    .sort({ issueDate: -1 });

  res.status(200).json({
    status: 'success',
    results: invoices.length,
    data: {
      invoices,
    },
  });
});

exports.getExpenseReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, category } = req.query;
  const filter = {};

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = parseDateInput(startDate);
    if (endDate) filter.date.$lte = parseDateInput(endDate);
  }

  if (category) {
    filter.category = category;
  }

  const expenses = await Expense.find(filter).sort({ date: -1 });

  res.status(200).json({
    status: 'success',
    results: expenses.length,
    data: {
      expenses,
    },
  });
});

exports.getPurchaseReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const filter = {};

  if (startDate || endDate) {
    filter.purchaseDate = {};
    if (startDate) filter.purchaseDate.$gte = parseDateInput(startDate);
    if (endDate) filter.purchaseDate.$lte = parseDateInput(endDate);
  }

  const purchases = await Purchase.find(filter).sort({ purchaseDate: -1 });

  res.status(200).json({
    status: 'success',
    results: purchases.length,
    data: {
      purchases,
    },
  });
});

exports.getIncomeReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, incomeSource } = req.query;
  const filter = {};

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = parseDateInput(startDate);
    if (endDate) filter.date.$lte = parseDateInput(endDate);
  }

  if (incomeSource) {
    filter.incomeSource = incomeSource;
  }

  const incomes = await Income.find(filter)
    .populate('incomeSource', 'name color')
    .sort({ date: -1 });

  res.status(200).json({
    status: 'success',
    results: incomes.length,
    data: {
      incomes,
    },
  });
});

exports.exportCategoryExcel = catchAsync(async (req, res, next) => {
  const { reportType } = req.params;
  const { startDate, endDate } = req.query;
  const filter = {};

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(reportType.toUpperCase());

  // Style helper
  const addStyledHeader = (worksheet, columns, color) => {
    worksheet.columns = columns;
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: color },
    };
  };

  if (reportType === 'sales') {
    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = parseDateInput(startDate);
      if (endDate) filter.issueDate.$lte = parseDateInput(endDate);
    }
    const invoices = await Invoice.find(filter).populate('customer', 'name').sort({ issueDate: -1 });

    addStyledHeader(
      sheet,
      [
        { header: 'Invoice Number', key: 'invoiceNumber', width: 22 },
        { header: 'Customer', key: 'customerName', width: 22 },
        { header: 'Issue Date', key: 'issueDate', width: 15 },
        { header: 'Due Date', key: 'dueDate', width: 15 },
        { header: 'Grand Total (₹)', key: 'grandTotal', width: 15 },
        { header: 'Amount Paid (₹)', key: 'amountPaid', width: 15 },
        { header: 'Amount Due (₹)', key: 'amountDue', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
      ],
      '2563EB'
    );
    invoices.forEach((x) =>
      sheet.addRow({
        invoiceNumber: sanitizeExcelVal(x.invoiceNumber),
        customerName: sanitizeExcelVal(x.customer?.name || 'Deleted Customer'),
        issueDate: new Date(x.issueDate).toLocaleDateString(),
        dueDate: new Date(x.dueDate).toLocaleDateString(),
        grandTotal: x.grandTotal,
        amountPaid: x.amountPaid,
        amountDue: x.amountDue,
        status: sanitizeExcelVal(x.status.toUpperCase()),
      })
    );
  } else if (reportType === 'expenses') {
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = parseDateInput(startDate);
      if (endDate) filter.date.$lte = parseDateInput(endDate);
    }
    const expenses = await Expense.find(filter).sort({ date: -1 });

    addStyledHeader(
      sheet,
      [
        { header: 'Category', key: 'category', width: 18 },
        { header: 'Amount (₹)', key: 'amount', width: 12 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Description', key: 'description', width: 30 },
      ],
      'BE123C'
    );
    expenses.forEach((x) =>
      sheet.addRow({
        category: sanitizeExcelVal(x.category),
        amount: x.amount,
        date: new Date(x.date).toLocaleDateString(),
        description: sanitizeExcelVal(x.description || ''),
      })
    );
  } else if (reportType === 'purchases') {
    if (startDate || endDate) {
      filter.purchaseDate = {};
      if (startDate) filter.purchaseDate.$gte = parseDateInput(startDate);
      if (endDate) filter.purchaseDate.$lte = parseDateInput(endDate);
    }
    const purchases = await Purchase.find(filter).sort({ purchaseDate: -1 });

    addStyledHeader(
      sheet,
      [
        { header: 'Supplier Name', key: 'supplierName', width: 22 },
        { header: 'Invoice Code', key: 'invoiceNumber', width: 15 },
        { header: 'Purchase Date', key: 'purchaseDate', width: 15 },
        { header: 'Amount (₹)', key: 'amount', width: 12 },
      ],
      'B45309'
    );
    purchases.forEach((x) =>
      sheet.addRow({
        supplierName: sanitizeExcelVal(x.supplierName),
        invoiceNumber: sanitizeExcelVal(x.invoiceNumber || 'N/A'),
        purchaseDate: new Date(x.purchaseDate).toLocaleDateString(),
        amount: x.amount,
      })
    );
  } else if (reportType === 'incomes') {
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = parseDateInput(startDate);
      if (endDate) filter.date.$lte = parseDateInput(endDate);
    }
    const incomes = await Income.find(filter).populate('incomeSource', 'name').sort({ date: -1 });

    addStyledHeader(
      sheet,
      [
        { header: 'Source Category', key: 'incomeSourceName', width: 22 },
        { header: 'Amount (₹)', key: 'amount', width: 12 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Received Through', key: 'receivedThrough', width: 18 },
        { header: 'Reference Code', key: 'referenceNumber', width: 20 },
        { header: 'Description / Notes', key: 'description', width: 30 },
      ],
      '10B981'
    );
    incomes.forEach((x) =>
      sheet.addRow({
        incomeSourceName: sanitizeExcelVal(x.incomeSource?.name || 'Deleted Source'),
        amount: x.amount,
        date: new Date(x.date).toLocaleDateString(),
        receivedThrough: sanitizeExcelVal(x.receivedThrough),
        referenceNumber: sanitizeExcelVal(x.referenceNumber || 'N/A'),
        description: sanitizeExcelVal(x.description || ''),
      })
    );
  } else {
    return next(new AppError('Invalid report category type requested', 400));
  }

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename=Report-${reportType.toUpperCase()}-${new Date().toISOString().split('T')[0]}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
});
