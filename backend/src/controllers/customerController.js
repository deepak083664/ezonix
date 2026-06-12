const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logActivity = require('../utils/activityLogger');
const escapeRegExp = require('../utils/escapeRegExp');

exports.getAllCustomers = catchAsync(async (req, res, next) => {
  const { search, page = 1, limit = 10 } = req.query;
  let query = {};

  if (search) {
    const escapedSearch = escapeRegExp(search);
    query = {
      $or: [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { phone: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
      ],
    };
  }

  const skip = (page - 1) * limit;

  const customers = await Customer.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Customer.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: customers.length,
    total,
    pages: Math.ceil(total / limit),
    data: {
      customers,
    },
  });
});

exports.getCustomer = catchAsync(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new AppError('No customer found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      customer,
    },
  });
});

exports.createCustomer = catchAsync(async (req, res, next) => {
  const newCustomer = await Customer.create(req.body);

  await logActivity('Customer Created', `Added customer profile: ${newCustomer.name}`, req);

  res.status(201).json({
    status: 'success',
    data: {
      customer: newCustomer,
    },
  });
});

exports.updateCustomer = catchAsync(async (req, res, next) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!customer) {
    return next(new AppError('No customer found with that ID', 404));
  }

  await logActivity('Customer Updated', `Updated customer details for: ${customer.name}`, req);

  res.status(200).json({
    status: 'success',
    data: {
      customer,
    },
  });
});

exports.deleteCustomer = catchAsync(async (req, res, next) => {
  const invoicesCount = await Invoice.countDocuments({ customer: req.params.id });
  if (invoicesCount > 0) {
    return next(new AppError('Cannot delete customer. They have linked invoices in the database.', 400));
  }

  const customer = await Customer.findByIdAndDelete(req.params.id);

  if (!customer) {
    return next(new AppError('No customer found with that ID', 404));
  }

  await logActivity('Customer Deleted', `Deleted customer profile: ${customer.name}`, req);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getCustomerLedger = catchAsync(async (req, res, next) => {
  const customerId = req.params.id;

  const customer = await Customer.findById(customerId);
  if (!customer) {
    return next(new AppError('No customer found with that ID', 404));
  }

  const invoices = await Invoice.find({ customer: customerId }).sort({ issueDate: 1 });
  const payments = await Payment.find({ customer: customerId }).sort({ paymentDate: 1 });

  const ledger = [];

  invoices.forEach((inv) => {
    ledger.push({
      id: inv._id,
      date: inv.issueDate,
      type: 'Invoice',
      reference: inv.invoiceNumber,
      amount: inv.grandTotal,
      direction: 'debit',
    });
  });

  payments.forEach((pay) => {
    ledger.push({
      id: pay._id,
      date: pay.paymentDate,
      type: 'Payment',
      reference: `Receipt: ${pay.paymentMethod}`,
      amount: pay.amountPaid,
      direction: 'credit',
    });
  });

  ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

  let runningBalance = 0;
  const ledgerWithBalance = ledger.map((item) => {
    if (item.direction === 'debit') {
      runningBalance += item.amount;
    } else {
      runningBalance -= item.amount;
    }
    return {
      ...item,
      runningBalance,
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      customer,
      runningBalance,
      ledger: ledgerWithBalance,
    },
  });
});
