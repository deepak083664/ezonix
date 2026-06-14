const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // File transport for error logs (rotates at 5MB, keeps up to 5 files)
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error',
      maxsize: 5242880, 
      maxFiles: 5,
    }),
    // File transport for all combined logs (rotates at 5MB, keeps up to 5 files)
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, 
      maxFiles: 5,
    }),
    // Console transport
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' 
        ? winston.format.simple()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
    })
  ],
});

module.exports = logger;
