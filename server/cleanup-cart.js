const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const Cart = require('./models/Cart');

async function cleanupOrphanedCartItems() {
  try {
    console.log('Starting cart cleanup...');
    
    const allCarts = await Cart.find().populate('items.project');
    let totalCleaned = 0;
    let totalCartsProcessed = 0;
    
    for (const cart of allCarts) {
      const validItems = cart.items.filter(item => item.project);
      const orphanedItems = cart.items.filter(item => !item.project);
      
      if (orphanedItems.length > 0) {
        cart.items = validItems;
        await cart.save();
        totalCleaned += orphanedItems.length;
        console.log(`Cart ${cart._id}: Cleaned up ${orphanedItems.length} orphaned items`);
      }
      totalCartsProcessed++;
    }
    
    console.log(`\nCleanup complete!`);
    console.log(`Total carts processed: ${totalCartsProcessed}`);
    console.log(`Total orphaned items cleaned up: ${totalCleaned}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

cleanupOrphanedCartItems(); 