const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[2] || req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET || 'fallback-secret-key-123456');

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // 4) Check if user is active
  if (!currentUser.active) {
    return next(new AppError('This user account has been deactivated.', 401));
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array like ['admin', 'staff']
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

exports.verifyAccountStatus = (req, res, next) => {
  if (!req.user.isInvited || !req.user.active) {
    return next(new AppError('You are not authorized to access this CRM.', 403));
  }
  next();
};

exports.verifySubscription = catchAsync(async (req, res, next) => {
  // Admins bypass subscription checks
  if (req.user.role === 'admin') {
    return next();
  }

  // Search active subscription
  const activeSub = await Subscription.findOne({
    userId: req.user._id,
    status: 'active',
    expiryDate: { $gt: new Date() },
  });

  if (!activeSub) {
    return next(new AppError('Your subscription is not active. Please contact your administrator.', 403));
  }

  next();
});
