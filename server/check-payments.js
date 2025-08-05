const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/projectfolio')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const ManualPayment = require('./models/ManualPayment');
const User = require('./models/User');
const Project = require('./models/Project'); // Add missing Project model import

async function checkPayments() {
  try {
    console.log('=== Checking Payment Orders ===');
    
    // Count all payments
    const totalPayments = await ManualPayment.countDocuments();
    console.log('Total payment orders:', totalPayments);
    
    // Get all payments with details
    const payments = await ManualPayment.find()
      .populate('projectId')
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('\n=== Payment Details ===');
    payments.forEach((payment, index) => {
      console.log(`\nPayment ${index + 1}:`);
      console.log('  ID:', payment._id);
      console.log('  Status:', payment.status);
      console.log('  Amount:', payment.amount);
      console.log('  Buyer:', payment.buyerId?.name || 'Unknown');
      console.log('  Seller:', payment.sellerId?.name || 'Unknown');
      console.log('  Project:', payment.projectId?.title || 'Unknown');
      console.log('  Created:', payment.createdAt);
      console.log('  Payment Details:', payment.paymentDetails);
    });
    
    // Check payments by status
    const statusCounts = await ManualPayment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n=== Payments by Status ===');
    statusCounts.forEach(status => {
      console.log(`${status._id}: ${status.count}`);
    });
    
  } catch (error) {
    console.error('Error checking payments:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

checkPayments(); 