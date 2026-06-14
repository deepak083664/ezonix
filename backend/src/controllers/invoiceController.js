const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Setting = require('../models/Setting');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logActivity = require('../utils/activityLogger');
const escapeRegExp = require('../utils/escapeRegExp');

exports.getAllInvoices = catchAsync(async (req, res, next) => {
  const { search, status, customer, page = 1, limit = 10 } = req.query;
  let query = {};

  if (search) {
    query.invoiceNumber = { $regex: escapeRegExp(search), $options: 'i' };
  }

  if (status) {
    query.status = status;
  }

  if (customer) {
    query.customer = customer;
  }

  const skip = (page - 1) * limit;

  const invoices = await Invoice.find(query)
    .populate('customer', 'name phone email')
    .sort({ issueDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Invoice.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: invoices.length,
    total,
    pages: Math.ceil(total / limit),
    data: {
      invoices,
    },
  });
});

exports.getInvoice = catchAsync(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('customer')
    .populate('items.product', 'name sku price');

  if (!invoice) {
    return next(new AppError('No invoice found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      invoice,
    },
  });
});

exports.createInvoice = catchAsync(async (req, res, next) => {
  const { customer: customerId, items, dueDate, notes, amountPaid = 0 } = req.body;

  if (!items || items.length === 0) {
    return next(new AppError('Please add at least one item to the invoice', 400));
  }

  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({ businessName: 'ezonix' });
  }

  const count = await Invoice.countDocuments();
  const prefix = setting.invoicePrefix || 'INV';
  const serial = String(count + 1).padStart(5, '0');
  const invoiceNumber = `${prefix}-${new Date().getFullYear()}-${serial}`;

  let taxTotal = 0;
  let discountTotal = 0;
  let grandTotal = 0;
  const itemsSnapshot = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new AppError(`Product with ID ${item.product} not found`, 404));
    }

    if (product.quantity < item.quantity) {
      return next(
        new AppError(
          `Insufficient stock for product: ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
          400
        )
      );
    }

    const itemSub = product.price * item.quantity;
    const itemTax = itemSub * ((item.taxPercent || setting.defaultTaxRate || 0) / 100);
    const itemDisc = itemSub * ((item.discountPercent || 0) / 100);
    const itemTotal = itemSub + itemTax - itemDisc;

    taxTotal += itemTax;
    discountTotal += itemDisc;
    grandTotal += itemTotal;

    itemsSnapshot.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      taxPercent: item.taxPercent || setting.defaultTaxRate || 0,
      discountPercent: item.discountPercent || 0,
    });

    product.quantity -= item.quantity;
    await product.save();
  }

  const amountDue = grandTotal - amountPaid;
  let status = 'pending';
  if (amountDue <= 0) {
    status = 'paid';
  } else if (new Date(dueDate) < new Date()) {
    status = 'overdue';
  }

  const newInvoice = await Invoice.create({
    invoiceNumber,
    customer: customerId,
    items: itemsSnapshot,
    taxTotal,
    discountTotal,
    grandTotal,
    amountPaid,
    amountDue,
    status,
    dueDate,
    notes,
  });

  const customer = await Customer.findById(customerId);
  const customerName = customer ? customer.name : 'Client';
  await logActivity('Invoice Created', `Generated invoice ${invoiceNumber} for ${customerName} ($${grandTotal.toFixed(2)})`, req);

  res.status(201).json({
    status: 'success',
    data: {
      invoice: newInvoice,
    },
  });
});

exports.updateInvoice = catchAsync(async (req, res, next) => {
  const { status, notes, dueDate, amountPaid } = req.body;
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new AppError('No invoice found with that ID', 404));
  }

  if (status) invoice.status = status;
  if (notes) invoice.notes = notes;
  if (dueDate) invoice.dueDate = dueDate;

  if (amountPaid !== undefined) {
    invoice.amountPaid = amountPaid;
    invoice.amountDue = invoice.grandTotal - amountPaid;
    if (invoice.amountDue <= 0) {
      invoice.status = 'paid';
    } else if (new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid') {
      invoice.status = 'overdue';
    } else {
      invoice.status = 'pending';
    }
  }

  await invoice.save();

  await logActivity('Invoice Updated', `Modified details/status for invoice: ${invoice.invoiceNumber}`, req);

  res.status(200).json({
    status: 'success',
    data: {
      invoice,
    },
  });
});

exports.deleteInvoice = catchAsync(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return next(new AppError('No invoice found with that ID', 404));
  }

  for (const item of invoice.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.quantity += item.quantity;
      await product.save();
    }
  }

  await Invoice.findByIdAndDelete(req.params.id);

  await logActivity('Invoice Deleted', `Deleted billing invoice record: ${invoice.invoiceNumber}`, req);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.downloadInvoicePDF = catchAsync(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id).populate('customer');

  if (!invoice) {
    return next(new AppError('No invoice found with that ID', 404));
  }

  let setting = await Setting.findOne();
  if (!setting) {
    setting = { businessName: 'ezonix' };
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`);

  generateInvoicePDF(invoice, setting, res);
});
