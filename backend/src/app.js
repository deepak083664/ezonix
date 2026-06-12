const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const path = require('path');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorMiddleware');

// Route imports
const authRouter = require('./routes/authRoutes');
const customerRouter = require('./routes/customerRoutes');
const productRouter = require('./routes/productRoutes');
const invoiceRouter = require('./routes/invoiceRoutes');
const purchaseRouter = require('./routes/purchaseRoutes');
const expenseRouter = require('./routes/expenseRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const settingRouter = require('./routes/settingRoutes');
const reportRouter = require('./routes/reportRoutes');
const incomeSourceRouter = require('./routes/incomeSourceRoutes');
const incomeRouter = require('./routes/incomeRoutes');

const app = express();

// 1) GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Development logging
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Limit requests from same API (Rate Limiting)
const limiter = rateLimit({
  max: 300, // Limit each IP to 300 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!',
});
app.use('/api', limiter);

// CORS configuration - Allow all for local and specify headers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Serve uploads static directory for local file fallback
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 2) ROUTES
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/invoices', invoiceRouter);
app.use('/api/v1/purchases', purchaseRouter);
app.use('/api/v1/expenses', expenseRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/settings', settingRouter);
app.use('/api/v1/reports', reportRouter);
app.use('/api/v1/income-sources', incomeSourceRouter);
app.use('/api/v1/incomes', incomeRouter);

// Base route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Business Management CRM API',
  });
});

// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler Middleware
app.use(globalErrorHandler);

module.exports = app;
