const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const ActivityLog = require('../models/ActivityLog');
const Category = require('../models/Category');
const IncomeSource = require('../models/IncomeSource');

const clearDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is not defined in the environment variables.');
      process.exit(1);
    }

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Database connected. Clearing collections...');

    // List of collections/models to clear completely
    const modelsToClear = [
      { name: 'Customer', model: Customer },
      { name: 'Product', model: Product },
      { name: 'Invoice', model: Invoice },
      { name: 'Payment', model: Payment },
      { name: 'Purchase', model: Purchase },
      { name: 'Expense', model: Expense },
      { name: 'Income', model: Income },
      { name: 'ActivityLog', model: ActivityLog },
      { name: 'Category', model: Category },
      { name: 'IncomeSource', model: IncomeSource },
    ];

    for (const item of modelsToClear) {
      const result = await item.model.deleteMany({});
      console.log(`Cleared collection [${item.name}]: deleted ${result.deletedCount} items.`);
    }

    console.log('Database cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database cleanup:', error);
    process.exit(1);
  }
};

clearDatabase();
