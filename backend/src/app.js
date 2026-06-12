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

// New SaaS routes
const planRouter = require('./routes/planRoutes');
const subscriptionRouter = require('./routes/subscriptionRoutes');
const userRouter = require('./routes/userRoutes');
const websiteContentRouter = require('./routes/websiteContentRoutes');

// Authentication / SaaS verification middlewares
const { protect, verifyAccountStatus, verifySubscription } = require('./middleware/authMiddleware');

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

// CORS configuration - Allow configured frontend and local hosts
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
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
app.use('/api/v1/plans', planRouter);
app.use('/api/v1/website-content', websiteContentRouter);

// Protected SaaS CRM routes
app.use('/api/v1/subscriptions', protect, verifyAccountStatus, verifySubscription, subscriptionRouter);
app.use('/api/v1/users', protect, verifyAccountStatus, verifySubscription, userRouter);
app.use('/api/v1/customers', protect, verifyAccountStatus, verifySubscription, customerRouter);
app.use('/api/v1/products', protect, verifyAccountStatus, verifySubscription, productRouter);
app.use('/api/v1/invoices', protect, verifyAccountStatus, verifySubscription, invoiceRouter);
app.use('/api/v1/purchases', protect, verifyAccountStatus, verifySubscription, purchaseRouter);
app.use('/api/v1/expenses', protect, verifyAccountStatus, verifySubscription, expenseRouter);
app.use('/api/v1/payments', protect, verifyAccountStatus, verifySubscription, paymentRouter);
app.use('/api/v1/settings', protect, verifyAccountStatus, verifySubscription, settingRouter);
app.use('/api/v1/reports', protect, verifyAccountStatus, verifySubscription, reportRouter);
app.use('/api/v1/income-sources', protect, verifyAccountStatus, verifySubscription, incomeSourceRouter);
app.use('/api/v1/incomes', protect, verifyAccountStatus, verifySubscription, incomeRouter);

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
