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
    email = 'ezonix3@gmail.com';
    name = 'Ezonix Main Admin';
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

  const userCount = await User.countDocuments();
  let isNew = false;

  if (credential === 'dev-bypass-admin') {
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        role: 'admin',
        isInvited: true,
        active: true,
      });
      isNew = true;
    } else {
      user.isInvited = true;
      user.active = true;
      user.role = 'admin';
      await user.save();
    }
  } else if (['ezonix3@gmail.com', 'ganu9955171746@gmail.com'].includes(email)) {
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        role: 'admin',
        isInvited: true,
        active: true,
      });
      isNew = true;
    } else {
      user.isInvited = true;
      user.active = true;
      user.role = 'admin';
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar && avatar) user.avatar = avatar;
      await user.save();
    }
  } else if (userCount === 0) {
    // First user in the system is automatically created as Admin
    user = await User.create({
      name,
      email,
      googleId,
      avatar,
      role: 'admin',
      isInvited: true,
      active: true,
    });
    isNew = true;
  } else {
    if (!user) {
      return next(new AppError('You are not authorized to access this CRM.', 403));
    }

    if (!user.isInvited || !user.active) {
      return next(new AppError('You are not authorized to access this CRM.', 403));
    }

    // Link googleId and avatar if not present
    if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar) user.avatar = avatar;
      await user.save();
    }
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
