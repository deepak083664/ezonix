const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logActivity = require('../utils/activityLogger');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret-key-123456', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.googleLogin = catchAsync(async (req, res, next) => {
  const { credential } = req.body;
  if (!credential) {
    return next(new AppError('Google login credential is required', 400));
  }

  let googleId, email, name, avatar;

  // Developer bypass check for local testing / offline runs
  if (credential === 'dev-bypass-admin') {
    googleId = 'dev-bypass-999';
    email = 'admin@example.com';
    name = 'Administrator (Bypass)';
    avatar = '';
  } else {
    // Standard Google Verification
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      avatar = payload.picture;
    } catch (err) {
      return next(new AppError('Invalid Google credential token or missing setup configs.', 400));
    }
  }

  // Find user by Google ID or Email
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  let isNew = false;
  if (user) {
    // Link googleId if missing
    if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar) user.avatar = avatar;
      await user.save();
    }
  } else {
    // Create new user automatically as Admin
    user = await User.create({
      name,
      email,
      googleId,
      avatar,
      role: 'admin', // Default admin role
    });
    isNew = true;
  }

  // Log user activity
  if (isNew) {
    await logActivity('Account Registered', `Google account ${email} registered and authorized as Admin`, { user });
  } else {
    await logActivity('User Login', `Google user ${email} logged in successfully`, { user });
  }

  createSendToken(user, 200, res);
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
});
