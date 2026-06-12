const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logActivity = require('../utils/activityLogger');

exports.getAllPayments = catchAsync(async (req, res, next) => {
  const { customer, invoice, page = 1, limit = 10 } = req.query;
  let query = {};

  if (customer) query.customer = customer;
  if (invoice) query.invoice = invoice;

  const skip = (page - 1) * limit;

  const payments = await Payment.find(query)
    .populate('customer', 'name phone email')
    .populate('invoice', 'invoiceNumber grandTotal')
    .sort({ paymentDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Payment.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: payments.length,
    total,
    pages: Math.ceil(total / limit),
    data: {
      payments,
    },
  });
});

exports.recordPayment = catchAsync(async (req, res, next) => {
  const { invoice: invoiceId, amountPaid, paymentDate, paymentMethod, notes } = req.body;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    return next(new AppError('No invoice found with that ID', 404));
  }

  if (invoice.amountDue <= 0) {
    return next(new AppError('This invoice has already been fully paid!', 400));
  }

  if (parseFloat(amountPaid) > invoice.amountDue) {
    return next(
      new AppError(
        `Payment amount ($${amountPaid}) cannot exceed the remaining invoice amount due ($${invoice.amountDue.toFixed(2)})`,
        400
      )
    );
  }

  const newPayment = await Payment.create({
    invoice: invoiceId,
    customer: invoice.customer,
    amountPaid,
    paymentDate,
    paymentMethod,
    notes,
  });

  invoice.amountPaid += parseFloat(amountPaid);
  invoice.amountDue = Math.max(0, invoice.grandTotal - invoice.amountPaid);

  if (invoice.amountDue <= 0) {
    invoice.status = 'paid';
  } else {
    if (new Date(invoice.dueDate) < new Date()) {
      invoice.status = 'overdue';
    } else {
      invoice.status = 'pending';
    }
  }

  await invoice.save();

  await logActivity(
    'Payment Recorded',
    `Received payment of $${parseFloat(amountPaid).toFixed(2)} (${paymentMethod}) for Invoice: ${invoice.invoiceNumber}`,
    req
  );

  res.status(201).json({
    status: 'success',
    data: {
      payment: newPayment,
      invoice,
    },
  });
});

exports.getPendingPayments = catchAsync(async (req, res, next) => {
  const pendingInvoices = await Invoice.find({ amountDue: { $gt: 0 } })
    .populate('customer', 'name phone email')
    .sort({ dueDate: 1 });

  res.status(200).json({
    status: 'success',
    results: pendingInvoices.length,
    data: {
      pendingInvoices,
    },
  });
});
