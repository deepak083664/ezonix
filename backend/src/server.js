const logger = require('./utils/logger');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

require('dotenv').config();

// Validate process.env.JWT_SECRET exists
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
  logger.error("FATAL: JWT_SECRET environment variable is missing.");
  process.exit(1);
}

// Validate process.env.ADMIN_PANEL_KEY exists
if (!process.env.ADMIN_PANEL_KEY || process.env.ADMIN_PANEL_KEY.trim() === "") {
  logger.error("FATAL: ADMIN_PANEL_KEY environment variable is missing.");
  process.exit(1);
}

// Validate process.env.ADMIN_EMAILS exists
if (!process.env.ADMIN_EMAILS || process.env.ADMIN_EMAILS.trim() === "") {
  logger.error("FATAL: ADMIN_EMAILS environment variable is missing.");
  process.exit(1);
}

const connectDB = require('./config/db');
const app = require('./app');

// Connect Database
connectDB();

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});
