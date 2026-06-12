const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Plan = require('../models/Plan');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllSubscriptions = catchAsync(async (req, res, next) => {
  const subscriptions = await Subscription.find()
    .populate('userId', 'name email role active')
    .populate('planId', 'name price billingCycle')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: subscriptions.length,
    data: {
      subscriptions,
    },
  });
});

exports.getMySubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findOne({
    userId: req.user._id,
    status: 'active',
    expiryDate: { $gt: new Date() },
  }).populate('planId', 'name price billingCycle features');

  res.status(200).json({
    status: 'success',
    data: {
      subscription,
    },
  });
});

exports.createSubscription = catchAsync(async (req, res, next) => {
  const { userId, planId, startDate, expiryDate, status, paymentStatus } = req.body;

  // Validate user and plan exist
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  const plan = await Plan.findById(planId);
  if (!plan) {
    return next(new AppError('No plan found with that ID', 404));
  }

  const newSubscription = await Subscription.create({
    userId,
    planId,
    startDate: startDate || Date.now(),
    expiryDate,
    status: status || 'active',
    paymentStatus: paymentStatus || 'paid',
  });

  res.status(201).json({
    status: 'success',
    data: {
      subscription: newSubscription,
    },
  });
});

exports.updateSubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('userId', 'name email').populate('planId', 'name price');

  if (!subscription) {
    return next(new AppError('No subscription found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      subscription,
    },
  });
});

exports.deleteSubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findByIdAndDelete(req.params.id);

  if (!subscription) {
    return next(new AppError('No subscription found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
