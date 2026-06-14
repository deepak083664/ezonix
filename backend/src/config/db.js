const mongoose = require('mongoose');
const runSeeder = require('../utils/seedData');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ca-crm', {
      autoIndex: process.env.NODE_ENV !== 'production',
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Run database seeder
    await runSeeder();
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`, error);
    process.exit(1);
  }
};

module.exports = connectDB;
