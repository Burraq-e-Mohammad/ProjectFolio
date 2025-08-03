const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // Added missing import for crypto

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    await transporter.sendMail({
      from: `"ProjectFolio" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Welcome to ProjectFolio!',
      html: `
        <h2>Welcome, ${user.name || user.firstName || 'User'}!</h2>
        <p>Thank you for registering with ProjectFolio. Your account has been successfully created.</p>
        <p>Email: ${user.email}</p>
        <p>Please verify your email address to unlock all features!</p>
        <p>Best regards,<br/>The ProjectFolio Team</p>
      `,
    });
    console.log(`Welcome email sent to ${user.email}`);
  } catch (err) {
    console.error('Error sending welcome email:', err);
  }
};

// Function to send verification email
const sendVerificationEmail = async (user, token) => {
  try {
    // Check if email configuration is set up
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration is missing. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const result = await transporter.sendMail({
      from: `"ProjectFolio" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verify Your Email - ProjectFolio',
      html: `
        <h2>Email Verification</h2>
        <p>Hello ${user.firstName || user.name || 'User'}!</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
          Verify Email Address
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br/>The ProjectFolio Team</p>
      `,
    });
    console.log(`Verification email sent to ${user.email}`, result.messageId);
    return true;
  } catch (err) {
    console.error('Error sending verification email:', err);
    throw err; // Re-throw to handle in the calling function
  }
};

exports.register = async (req, res) => {
  try {
    const { name, firstName, lastName, username, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    // Check if username is already taken
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) return res.status(400).json({ message: 'Username already exists' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      firstName, 
      lastName, 
      username, 
      email, 
      password: hashedPassword, 
      role,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user);
    
    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: { 
        _id: user._id, 
        name: user.name, 
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email, 
        role: user.role, 
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { 
        _id: user._id, 
        name: user.name, 
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email, 
        role: user.role, 
        googleId: user.googleId,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '214476576993-b4l6n3d4kgkjfe56tradth5dg0osts8h.apps.googleusercontent.com');

exports.googleRegister = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID || '214476576993-b4l6n3d4kgkjfe56tradth5dg0osts8h.apps.googleusercontent.com',
    });
    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    // Check for existing user by googleId or email
    const existingUser = await User.findOne({ $or: [{ googleId: sub }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this Google account or email. Please log in instead.'
      });
    }

    // Create new user
    const user = new User({ 
      name, 
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ').slice(1).join(' ') || '',
      email, 
      googleId: sub, 
      role: 'customer' 
    });
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user);

    const jwtToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token: jwtToken,
      user: { 
        _id: user._id, 
        name: user.name, 
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email, 
        role: user.role, 
        googleId: user.googleId,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    
    // Provide more specific error messages
    let errorMessage = 'Google registration failed';
    let statusCode = 401;
    
    if (err.message.includes('audience')) {
      errorMessage = 'Invalid Google client configuration';
      statusCode = 400;
    } else if (err.message.includes('token')) {
      errorMessage = 'Invalid Google token';
      statusCode = 400;
    } else if (err.message.includes('network')) {
      errorMessage = 'Network error during Google authentication';
      statusCode = 500;
    } else if (err.message.includes('User already exists')) {
      errorMessage = 'User already exists with this Google account. Please log in instead.';
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      message: errorMessage, 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ message: 'No Google token provided' });
  }
  
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID || '214476576993-b4l6n3d4kgkjfe56tradth5dg0osts8h.apps.googleusercontent.com',
    });
    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    // Check for existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId: sub }, { email }] });
    
    if (!user) {
      return res.status(400).json({
        message: 'No account found with this Google account or email. Please register first.'
      });
    }
    
    // If user exists but doesn't have googleId, update it
    if (user && !user.googleId) {
      user.googleId = sub;
      await user.save();
      console.log('Updated user with Google ID:', sub);
    }

    const jwtToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token: jwtToken,
      user: { 
        _id: user._id, 
        name: user.name, 
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email, 
        role: user.role, 
        googleId: user.googleId,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    
    // Provide more specific error messages
    let errorMessage = 'Google login failed';
    let statusCode = 500;
    
    if (err.message.includes('audience')) {
      errorMessage = 'Invalid Google client configuration';
      statusCode = 400;
    } else if (err.message.includes('token')) {
      errorMessage = 'Invalid Google token';
      statusCode = 400;
    } else if (err.message.includes('network')) {
      errorMessage = 'Network error during Google authentication';
      statusCode = 500;
    } else if (err.message.includes('No account found')) {
      errorMessage = 'No account found with this Google account. Please register first.';
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      message: errorMessage, 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    console.log('=== UPDATE PROFILE DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    console.log('User ID from token:', req.user?.userId);
    
    const { firstName, lastName, username, email } = req.body;
    const userId = req.user.userId;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      user 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationToken);
      res.json({ message: 'Verification email sent successfully' });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      res.status(500).json({ 
        message: 'Failed to send verification email. Please check your email configuration or try again later.',
        error: emailError.message 
      });
    }
  } catch (err) {
    console.error('Resend verification email error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // Since we're using JWT tokens, we don't need to do anything server-side
    // The client should remove the token from localStorage
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send reset email
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      await transporter.sendMail({
        from: `"ProjectFolio" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset - ProjectFolio',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hello ${user.firstName || user.name || 'User'}!</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <p>Best regards,<br/>The ProjectFolio Team</p>
        `,
      });
      
      res.json({ message: 'Password reset email sent successfully' });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      res.status(500).json({ 
        message: 'Failed to send password reset email. Please check your email configuration or try again later.',
        error: emailError.message 
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add this function to create an admin user
exports.createAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create admin user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'admin',
      isVerified: true,
      verificationStatus: 'verified'
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'Admin user created successfully',
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin Authentication
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin user by email
    const adminUser = await User.findOne({ email, role: 'admin' });
    if (!adminUser) {
      return res.status(401).json({ 
        message: 'Invalid admin credentials' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid admin credentials' 
      });
    }

    // Create admin JWT token
    const token = jwt.sign(
      { 
        userId: adminUser._id, 
        email: adminUser.email, 
        role: adminUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        _id: adminUser._id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
        name: `${adminUser.firstName} ${adminUser.lastName}`
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Validate Admin Token
exports.validateAdminToken = async (req, res) => {
  try {
    // The authMiddleware has already verified the token and set req.user
    // We just need to check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // Token is valid and user is admin
    res.json({
      message: 'Admin token is valid',
      user: {
        _id: req.user.userId,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Admin token validation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};