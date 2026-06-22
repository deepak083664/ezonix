const AppError = require('../utils/appError');
const logger = require('../utils/logger');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  let message = 'A record with this information already exists in the system. Please check for duplicate entries!';
  let fieldName = '';
  let value = '';
  
  if (err.keyValue && Object.keys(err.keyValue).length > 0) {
    const keys = Object.keys(err.keyValue);
    fieldName = keys[0];
    value = err.keyValue[fieldName];
  } else {
    // Fallback: parse from errmsg or message string
    const errmsg = err.errmsg || err.message || '';
    const matchField = errmsg.match(/index:\s+(\w+)_/) || errmsg.match(/collection:\s+\S+\s+index:\s+(\w+)/);
    if (matchField) {
      fieldName = matchField[1];
    }
    const matchValue = errmsg.match(/dup key:\s+\{\s*\w+:\s*"(.*)"\s*\}/) || errmsg.match(/\{\s*\w+:\s*"(.*)"\s*\}/);
    if (matchValue) {
      value = matchValue[1];
    }
  }
  
  if (fieldName) {
    const fieldMapping = {
      email: 'Email Address',
      sku: 'Product SKU',
      invoiceNumber: 'Invoice Number',
      gstNumber: 'GSTIN Number',
      phone: 'Phone Number',
      name: 'Name',
      title: 'Title',
      category: 'Category'
    };
    
    const formattedField = fieldMapping[fieldName] || (fieldName.charAt(0).toUpperCase() + fieldName.slice(1));
    if (value) {
      message = `${formattedField} "${value}" is already in use. Please choose another one!`;
    } else {
      message = `${formattedField} is already in use. Please choose another one!`;
    }
  } else {
    const errmsg = err.errmsg || err.message || '';
    const match = errmsg.match(/(["'])(\\?.)*?\1/);
    if (match) {
      const val = match[0].replace(/['"]/g, '');
      message = `Duplicate value "${val}" already exists in the system. Please use another value!`;
    }
  }
  
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  if (err.errors) {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
  }
  return new AppError(err.message || 'Invalid input data.', 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or other unknown error: don't leak error details
  logger.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'An unexpected server error occurred. Please try again later or contact support if the issue persists.',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = err; // Use the original error object directly to preserve Mongoose structure

  if (err.name === 'CastError') error = handleCastErrorDB(err);
  
  const isDuplicateKey = err.code === 11000 || 
                         err.code === '11000' || 
                         (err.message && (err.message.includes('E11000') || err.message.includes('duplicate key'))) ||
                         (err.errmsg && (err.errmsg.includes('E11000') || err.errmsg.includes('duplicate key')));

  if (isDuplicateKey) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};
