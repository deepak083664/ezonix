const IncomeSource = require('../models/IncomeSource');
const Income = require('../models/Income');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logActivity = require('../utils/activityLogger');

exports.getAllIncomeSources = catchAsync(async (req, res, next) => {
  let sources = await IncomeSource.find().sort({ name: 1 });

  // Seed default income sources if none exist in the database
  if (sources.length === 0) {
    const defaultSources = [
      { name: 'Salary', description: 'Regular employment salary income', color: '#3B82F6' },
      { name: 'Freelance', description: 'Freelance contracting or consulting services', color: '#6366F1' },
      { name: 'Rental', description: 'Real estate rental or lease income', color: '#A855F7' },
      { name: 'Investments', description: 'Dividends, capital gains, stocks, mutual funds', color: '#F59E0B' },
      { name: 'Business Revenue', description: 'Direct sales or client work outside invoices', color: '#10B981' },
      { name: 'Other', description: 'Miscellaneous or other income sources', color: '#64748B' },
    ];
    await IncomeSource.insertMany(defaultSources);
    sources = await IncomeSource.find().sort({ name: 1 });
  }

  res.status(200).json({
    status: 'success',
    results: sources.length,
    data: {
      sources,
    },
  });
});

exports.createIncomeSource = catchAsync(async (req, res, next) => {
  const { name, description, color } = req.body;

  const existing = await IncomeSource.findOne({ name: name.trim() }).collation({ locale: 'en', strength: 2 });
  if (existing) {
    return next(new AppError('An income source with this name already exists', 400));
  }

  const newSource = await IncomeSource.create({
    name: name.trim(),
    description,
    color: color || '#2563EB',
  });

  await logActivity('Income Source Created', `Added new income source category: ${newSource.name}`, req);

  res.status(201).json({
    status: 'success',
    data: {
      source: newSource,
    },
  });
});

exports.updateIncomeSource = catchAsync(async (req, res, next) => {
  const { name, description, color } = req.body;
  
  const source = await IncomeSource.findById(req.params.id);
  if (!source) {
    return next(new AppError('No income source found with that ID', 404));
  }

  if (name && name.trim().toLowerCase() !== source.name.toLowerCase()) {
    const existing = await IncomeSource.findOne({ name: name.trim() }).collation({ locale: 'en', strength: 2 });
    if (existing) {
      return next(new AppError('An income source with this name already exists', 400));
    }
  }

  const updatedSource = await IncomeSource.findByIdAndUpdate(
    req.params.id,
    {
      name: name ? name.trim() : source.name,
      description: description !== undefined ? description : source.description,
      color: color || source.color,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  await logActivity('Income Source Updated', `Updated income source: ${updatedSource.name}`, req);

  res.status(200).json({
    status: 'success',
    data: {
      source: updatedSource,
    },
  });
});

exports.deleteIncomeSource = catchAsync(async (req, res, next) => {
  const source = await IncomeSource.findById(req.params.id);
  if (!source) {
    return next(new AppError('No income source found with that ID', 404));
  }

  // Check if any Income records are currently associated with this source
  const linkedIncomes = await Income.countDocuments({ incomeSource: req.params.id });
  if (linkedIncomes > 0) {
    return next(
      new AppError(
        `Cannot delete this source. It is currently associated with ${linkedIncomes} recorded income transaction(s). Please delete or update those records first.`,
        400
      )
    );
  }

  await IncomeSource.findByIdAndDelete(req.params.id);

  await logActivity('Income Source Deleted', `Deleted income source category: ${source.name}`, req);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
