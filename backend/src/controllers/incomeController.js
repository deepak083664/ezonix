const Income = require('../models/Income');
const IncomeSource = require('../models/IncomeSource');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logActivity = require('../utils/activityLogger');

exports.getAllIncomes = catchAsync(async (req, res, next) => {
  const { incomeSource, search, page = 1, limit = 10 } = req.query;
  let query = {};

  if (incomeSource) {
    query.incomeSource = incomeSource;
  }

  if (search) {
    query.$or = [
      { description: { $regex: search, $options: 'i' } },
      { referenceNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const incomes = await Income.find(query)
    .populate('incomeSource', 'name color')
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Income.countDocuments(query);

  const breakdown = await Income.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$incomeSource',
        total: { $sum: '$amount' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: incomes.length,
    total,
    pages: Math.ceil(total / limit),
    data: {
      incomes,
      breakdown,
    },
  });
});

exports.createIncome = catchAsync(async (req, res, next) => {
  const { amount, date, description, incomeSource, receivedThrough, referenceNumber } = req.body;

  const sourceExists = await IncomeSource.findById(incomeSource);
  if (!sourceExists) {
    return next(new AppError('No income source category found with that ID', 404));
  }

  const newIncome = await Income.create({
    amount,
    date: date || undefined,
    description,
    incomeSource,
    receivedThrough,
    referenceNumber,
  });

  const populated = await newIncome.populate('incomeSource', 'name');

  await logActivity(
    'Income Added',
    `Recorded $${parseFloat(amount).toFixed(2)} under source: ${populated.incomeSource.name}`,
    req
  );

  res.status(201).json({
    status: 'success',
    data: {
      income: populated,
    },
  });
});

exports.updateIncome = catchAsync(async (req, res, next) => {
  const income = await Income.findById(req.params.id);
  if (!income) {
    return next(new AppError('No income record found with that ID', 404));
  }

  const { amount, date, description, incomeSource, receivedThrough, referenceNumber } = req.body;

  if (incomeSource) {
    const sourceExists = await IncomeSource.findById(incomeSource);
    if (!sourceExists) {
      return next(new AppError('No income source category found with that ID', 404));
    }
  }

  const updatedIncome = await Income.findByIdAndUpdate(
    req.params.id,
    {
      amount: amount !== undefined ? amount : income.amount,
      date: date !== undefined ? date : income.date,
      description: description !== undefined ? description : income.description,
      incomeSource: incomeSource || income.incomeSource,
      receivedThrough: receivedThrough || income.receivedThrough,
      referenceNumber: referenceNumber !== undefined ? referenceNumber : income.referenceNumber,
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate('incomeSource', 'name');

  await logActivity(
    'Income Updated',
    `Updated income record under source: ${updatedIncome.incomeSource.name} ($${updatedIncome.amount.toFixed(2)})`,
    req
  );

  res.status(200).json({
    status: 'success',
    data: {
      income: updatedIncome,
    },
  });
});

exports.deleteIncome = catchAsync(async (req, res, next) => {
  const income = await Income.findById(req.params.id).populate('incomeSource', 'name');
  if (!income) {
    return next(new AppError('No income record found with that ID', 404));
  }

  await Income.findByIdAndDelete(req.params.id);

  await logActivity(
    'Income Deleted',
    `Deleted income entry for ${income.incomeSource?.name || 'Unknown source'} ($${income.amount.toFixed(2)})`,
    req
  );

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
