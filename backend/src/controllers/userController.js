const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, role, active, isInvited, planId } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('A user with this email already exists', 400));
  }

  // Create new user (Pre-invited and active by default)
  const newUser = await User.create({
    name,
    email,
    role: role || 'staff',
    active: active !== undefined ? active : true,
    isInvited: isInvited !== undefined ? isInvited : true,
  });

  // Automatically provision subscription if planId is supplied
  if (planId) {
    const plan = await Plan.findById(planId);
    if (plan) {
      // 14 days default trial duration for new invites if not lifetime
      const duration = plan.billingCycle === 'lifetime' ? 36500 : (plan.billingCycle === 'yearly' ? 365 : 14);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + duration);

      await Subscription.create({
        userId: newUser._id,
        planId: plan._id,
        startDate: Date.now(),
        expiryDate,
        status: 'active',
        paymentStatus: 'paid',
      });
    }
  }

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const userToUpdate = await User.findById(req.params.id);
  if (!userToUpdate) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Prevent admin from deactivating or demoting themselves
  if (req.user._id.toString() === req.params.id) {
    if (req.body.active === false || (req.body.role && req.body.role !== 'admin')) {
      return next(new AppError('You cannot deactivate or demote your own administrator account.', 400));
    }
  }

  // Prevent demoting or deactivating permanent admins
  const permanentAdmins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(email => email.trim())
    .filter(Boolean);
  if (permanentAdmins.includes(userToUpdate.email)) {
    if (req.body.active === false || (req.body.role && req.body.role !== 'admin')) {
      return next(new AppError('This is a permanent administrator account and cannot be demoted or deactivated.', 400));
    }
    if (req.body.email && req.body.email !== userToUpdate.email) {
      return next(new AppError('The email of a permanent administrator account cannot be changed.', 400));
    }
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  // Prevent admin from deleting themselves
  if (req.user._id.toString() === req.params.id) {
    return next(new AppError('You cannot delete your own administrator account.', 400));
  }

  const userToDelete = await User.findById(req.params.id);
  if (!userToDelete) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Prevent deleting permanent admins
  const permanentAdmins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(email => email.trim())
    .filter(Boolean);
  if (permanentAdmins.includes(userToDelete.email)) {
    return next(new AppError('You cannot delete a permanent administrator account.', 400));
  }

  await User.findByIdAndDelete(req.params.id);

  // Delete associated subscriptions
  await Subscription.deleteMany({ userId: req.params.id });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
