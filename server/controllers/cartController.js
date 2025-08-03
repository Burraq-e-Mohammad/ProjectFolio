const Cart = require('../models/Cart');

// Utility function to clean up orphaned cart items
const cleanupOrphanedCartItems = async () => {
  try {
    const Project = require('../models/Project');
    const allCarts = await Cart.find().populate({
      path: 'items.project',
      populate: {
        path: 'seller',
        select: 'name email'
      }
    });
    let totalCleaned = 0;
    
    for (const cart of allCarts) {
      const validItems = cart.items.filter(item => item.project);
      const orphanedItems = cart.items.filter(item => !item.project);
      
      if (orphanedItems.length > 0) {
        cart.items = validItems;
        await cart.save();
        totalCleaned += orphanedItems.length;
        console.log(`Cleaned up ${orphanedItems.length} orphaned items from cart ${cart._id}`);
      }
    }
    
    console.log(`Total orphaned items cleaned up: ${totalCleaned}`);
    return totalCleaned;
  } catch (err) {
    console.error('Error cleaning up orphaned cart items:', err);
    return 0;
  }
};

exports.getCart = async (req, res) => {
  try {
    // Always run cleanup for now to ensure data integrity
    console.log('Running cart cleanup for user:', req.user.userId);
    await cleanupOrphanedCartItems();
    
    const cart = await Cart.findOne({ user: req.user.userId }).populate({
      path: 'items.project',
      populate: {
        path: 'seller',
        select: 'name email'
      }
    });
    if (!cart) {
      console.log('No cart found for user:', req.user.userId);
      return res.json({ data: { items: [], total: 0 } });
    }
    
    // Filter out items with null projects and clean up orphaned items
    const validItems = cart.items.filter(item => item.project);
    const orphanedItems = cart.items.filter(item => !item.project);
    
    // Remove orphaned items from cart if any exist
    if (orphanedItems.length > 0) {
      cart.items = validItems;
      await cart.save();
      console.log(`Cleaned up ${orphanedItems.length} orphaned cart items for user ${req.user.userId}`);
    }
    
    // Calculate total only for valid items
    const total = validItems.reduce((sum, item) => {
      return sum + (item.project.price * item.quantity);
    }, 0);
    
    // Log for debugging
    console.log(`Cart for user ${req.user.userId}: ${validItems.length} valid items, ${orphanedItems.length} orphaned items, total: ${total}`);
    console.log('Valid items:', validItems.map(item => ({ id: item.project._id, title: item.project.title, price: item.project.price })));
    
    // Return the correct structure that frontend expects
    const responseData = { 
      data: { 
        items: validItems, 
        total: total 
      } 
    };
    console.log('Sending response:', JSON.stringify(responseData, null, 2));
    res.json(responseData);
  } catch (err) {
    console.error('Error in getCart:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { projectId, quantity = 1 } = req.body;
    
    console.log('=== ADD TO CART DEBUG ===');
    console.log('User ID:', req.user.userId);
    console.log('Project ID:', projectId);
    console.log('Quantity:', quantity);
    
    // Verify project exists
    const Project = require('../models/Project');
    const project = await Project.findById(projectId);
    
    console.log('Project found:', project ? 'Yes' : 'No');
    if (project) {
      console.log('Project title:', project.title);
      console.log('Project price:', project.price);
    }
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if project is available for purchase
    // Temporarily allow all statuses for testing
    // if (project.status !== 'available') {
    //   return res.status(400).json({ message: 'Project is not available for purchase' });
    // }
    
    let cart = await Cart.findOne({ user: req.user.userId });
    console.log('Existing cart found:', cart ? 'Yes' : 'No');
    if (cart) {
      console.log('Cart items before:', cart.items.length);
    }
    
    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
      console.log('Created new cart');
    }
    
    const itemIndex = cart.items.findIndex(item => item.project.toString() === projectId);
    console.log('Item index in cart:', itemIndex);
    
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
      console.log('Updated existing item quantity');
    } else {
      cart.items.push({ project: projectId, quantity: quantity });
      console.log('Added new item to cart');
    }
    
    await cart.save();
    console.log('Cart saved successfully');
    console.log('Cart items after save:', cart.items.length);
    
    // Populate and return with total
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.project',
      populate: {
        path: 'seller',
        select: 'name email'
      }
    });
    const validItems = populatedCart.items.filter(item => item.project);
    const total = validItems.reduce((sum, item) => {
      return sum + (item.project.price * item.quantity);
    }, 0);
    
    res.json({ 
      data: { 
        items: validItems, 
        total: total 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { projectId } = req.body;
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(item => item.project.toString() !== projectId);
    await cart.save();
    
    // Populate and return with total
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.project',
      populate: {
        path: 'seller',
        select: 'name email'
      }
    });
    const validItems = populatedCart.items.filter(item => item.project);
    const total = validItems.reduce((sum, item) => {
      return sum + (item.project.price * item.quantity);
    }, 0);
    
    res.json({ 
      data: { 
        items: validItems, 
        total: total 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = [];
    await cart.save();
    res.json({ 
      data: { 
        items: [], 
        total: 0 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    const itemIndex = cart.items.findIndex(item => item.project.toString() === projectId);
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });
    
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    // Populate and return with total
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.project',
      populate: {
        path: 'seller',
        select: 'name email'
      }
    });
    const validItems = populatedCart.items.filter(item => item.project);
    const total = validItems.reduce((sum, item) => {
      return sum + (item.project.price * item.quantity);
    }, 0);
    
    res.json({ 
      data: { 
        items: validItems, 
        total: total 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin endpoint to clean up orphaned cart items
exports.cleanupOrphanedItems = async (req, res) => {
  try {
    const cleanedCount = await cleanupOrphanedCartItems();
    res.json({ 
      message: `Cleaned up ${cleanedCount} orphaned cart items`,
      cleanedCount 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


