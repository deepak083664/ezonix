const mongoose = require('mongoose');
const runSeeder = require('../utils/seedData');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ca-crm', {
      autoIndex: process.env.NODE_ENV !== 'production',
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Run database seeder
    await runSeeder();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
