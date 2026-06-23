const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logActivity = require('../utils/activityLogger');
const logger = require('../utils/logger');
const https = require('https');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map(email => email.trim())
  .filter(Boolean);

const verifyGoogleTokenFallback = (credential) => {
  return new Promise((resolve, reject) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON response from Google tokeninfo API'));
          }
        } else {
          reject(new Error(`Google tokeninfo API returned status ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
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
  if (process.env.NODE_ENV === 'development' && credential === 'dev-bypass-admin') {
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
      logger.error('Google verifyIdToken failed, attempting fallback verification via Google tokeninfo API...', err);
      
      try {
        const payload = await verifyGoogleTokenFallback(credential);
        
        // Verify client ID / audience matches
        const expectedClientId = process.env.GOOGLE_CLIENT_ID || '536012882296-158fbprbf62cvi6c9evin9thg93jrobo.apps.googleusercontent.com';
        if (payload.aud !== expectedClientId) {
          throw new Error(`Audience mismatch. Expected: ${expectedClientId}, Received: ${payload.aud}`);
        }
        
        // Verify issuer
        if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) {
          throw new Error(`Invalid issuer: ${payload.iss}`);
        }

        googleId = payload.sub;
        email = payload.email;
        name = payload.name;
        avatar = payload.picture;
        
        logger.info(`Google token verification succeeded via fallback tokeninfo API for: ${email}`);
      } catch (fallbackErr) {
        logger.error('Google fallback tokeninfo verification failed:', fallbackErr);
        return next(new AppError('Google authentication failed. Please try again.', 400));
      }
    }
  }

  // Find user by Google ID or Email
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  const userCount = await User.countDocuments();
  let isNew = false;

  if (process.env.NODE_ENV === 'development' && credential === 'dev-bypass-admin') {
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
  } else if (adminEmails.includes(email)) {
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

exports.verifyAdminKey = catchAsync(async (req, res, next) => {
  const { key } = req.body;

  if (!key) {
    return next(new AppError('Security key is required', 400));
  }

  const correctKey = process.env.ADMIN_PANEL_KEY;

  if (key !== correctKey) {
    return next(new AppError('Incorrect admin password.', 401));
  }

  res.status(200).json({
    status: 'success',
    unlocked: true,
  });
});

