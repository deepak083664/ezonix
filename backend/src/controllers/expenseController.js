const Expense = require('../models/Expense');
const { deleteFile } = require('../middleware/uploadMiddleware');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logActivity = require('../utils/activityLogger');
const escapeRegExp = require('../utils/escapeRegExp');

exports.getAllExpenses = catchAsync(async (req, res, next) => {
  const { category, search, page = 1, limit = 10 } = req.query;
  let query = {};

  if (category) {
    query.category = category;
  }

  if (search) {
    query.description = { $regex: escapeRegExp(search), $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const expenses = await Expense.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Expense.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: expenses.length,
    total,
    pages: Math.ceil(total / limit),
    data: {
      expenses,
    },
  });
});

exports.createExpense = catchAsync(async (req, res, next) => {
  const expenseData = { ...req.body };

  if (req.file) {
    expenseData.receiptUrl = req.file.path || `/uploads/${req.file.filename}`;
    expenseData.receiptPublicId = req.file.filename || '';
  }

  const newExpense = await Expense.create(expenseData);

  await logActivity('Expense Added', `Recorded $${newExpense.amount.toFixed(2)} under category: ${newExpense.category}`, req);

  res.status(201).json({
    status: 'success',
    data: {
      expense: newExpense,
    },
  });
});

exports.updateExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    return next(new AppError('No expense found with that ID', 404));
  }

  const updateData = { ...req.body };

  if (req.file) {
    if (expense.receiptUrl) {
      await deleteFile(expense.receiptUrl, expense.receiptPublicId);
    }
    updateData.receiptUrl = req.file.path || `/uploads/${req.file.filename}`;
    updateData.receiptPublicId = req.file.filename || '';
  }

  const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  await logActivity('Expense Updated', `Updated expense: ${updatedExpense.category} ($${updatedExpense.amount.toFixed(2)})`, req);

  res.status(200).json({
    status: 'success',
    data: {
      expense: updatedExpense,
    },
  });
});

exports.deleteExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    return next(new AppError('No expense found with that ID', 404));
  }

  if (expense.receiptUrl) {
    await deleteFile(expense.receiptUrl, expense.receiptPublicId);
  }

  await Expense.findByIdAndDelete(req.params.id);

  await logActivity('Expense Deleted', `Deleted expense record for ${expense.category}`, req);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
