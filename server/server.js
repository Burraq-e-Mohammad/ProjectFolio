const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

dotenv.config();

// Check required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Check email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  // Email configuration is missing
}

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const cartRoutes = require('./routes/cart');
const categoryRoutes = require('./routes/categories');
const instructionsRoutes = require('./routes/instructions');
const contactRoutes = require('./routes/contact');

// New routes for payment and trust system
const paymentRoutes = require('./routes/payments');
const manualPaymentRoutes = require('./routes/manualPayments');
const verificationRoutes = require('./routes/verification');
const communicationRoutes = require('./routes/communication');
const disputeRoutes = require('./routes/disputes');

// Security middleware
const {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  uploadLimiter,
  apiLimiter,
  validateInput,
  validateFileUpload,
  sqlInjectionProtection,
  cspMiddleware,
  securityHeaders,
  requestSizeLimit,
  securityErrorHandler
} = require('./middleware/securityMiddleware');

const app = express();

// Request logger (must be first to catch all requests)
app.use((req, res, next) => {
  next();
});

// 1. CORS Middleware (must be first)
app.use(cors({
  origin: [
    'https://project-folio-pk.vercel.app',
    'https://project-folio-pk.vercel.app/',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// 2. Body Parsing Middleware (must come before security)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Security Middleware (commented out temporarily for debugging)
// app.use(helmet());
// app.use(xss());
// app.use(hpp());
// app.use(mongoSanitize());
// app.use(cspMiddleware);
// app.use(securityHeaders);
// app.use(requestSizeLimit);
// app.use(validateInput);
// app.use(sqlInjectionProtection);

// 4. Rate Limiting (commented out temporarily for debugging)
// app.use('/api/auth', authLimiter);
// app.use('/api/payments', paymentLimiter);
// app.use('/api/verification/upload-document', uploadLimiter);
// app.use('/api/communication/upload-attachment', uploadLimiter);
// app.use('/api/disputes/evidence', uploadLimiter);
// app.use('/api', apiLimiter);
// app.use('/', generalLimiter);

// 5. Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. Create upload directories if they don't exist
const fs = require('fs');
const uploadDirs = [
  'uploads/verification',
  'uploads/messages',
  'uploads/disputes',
  'uploads/payments'
];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 6.5. Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'ProjectFolio API is running',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// 7. Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/instructions', instructionsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/manual-payments', manualPaymentRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/disputes', disputeRoutes);

// 8. Security error handling middleware (commented out temporarily for debugging)
// app.use(securityErrorHandler);

// 9. General error handling middleware
app.use((err, req, res, next) => {
  // Always show detailed errors in development
  res.status(500).json({ 
    message: 'Server error', 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 10. MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
// 11. Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 PORT from env: ${process.env.PORT || 'not set'}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err, err.stack);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});