const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

// Rate limiting for different endpoints
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message: message || 'Please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General rate limiting
const generalLimiter = createRateLimit(15 * 60 * 1000, 100, 'Too many requests from this IP');

// Auth rate limiting (more strict)
const authLimiter = createRateLimit(15 * 60 * 1000, 5, 'Too many login attempts');

// Payment rate limiting (very strict)
const paymentLimiter = createRateLimit(15 * 60 * 1000, 3, 'Too many payment attempts');

// File upload rate limiting
const uploadLimiter = createRateLimit(15 * 60 * 1000, 10, 'Too many file uploads');

// API rate limiting
const apiLimiter = createRateLimit(15 * 60 * 1000, 50, 'Too many API requests');

// Input validation middleware
const validateInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Remove potential XSS
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// File upload security middleware
const validateFileUpload = (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  const files = req.files ? Object.values(req.files).flat() : [req.file];
  
  for (const file of files) {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size must be less than 10MB'
      });
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only images and documents are allowed'
      });
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        error: 'Invalid file extension',
        message: 'File extension not allowed'
      });
    }

    // Check for malicious content in filename
    const maliciousPatterns = [
      /\.\.\//, // Directory traversal
      /<script/i, // XSS
      /javascript:/i, // JavaScript protocol
      /vbscript:/i, // VBScript protocol
      /data:/i, // Data URI
      /on\w+\s*=/i, // Event handlers
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(file.originalname)) {
        return res.status(400).json({
          error: 'Malicious filename detected',
          message: 'Filename contains potentially harmful content'
        });
      }
    }
  }

  next();
};

// SQL Injection protection middleware
const sqlInjectionProtection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
    /(--|\/\*|\*\/|;)/,
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
  ];

  const checkValue = (value) => {
    if (typeof value !== 'string') return false;
    
    for (const pattern of sqlPatterns) {
      if (pattern.test(value)) {
        return true;
      }
    }
    return false;
  };

  const checkObject = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && checkValue(value)) {
        return true;
      } else if (typeof value === 'object' && value !== null) {
        if (checkObject(value)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check request body
  if (req.body && checkObject(req.body)) {
    return res.status(400).json({
      error: 'Invalid input detected',
      message: 'Request contains potentially harmful content'
    });
  }

  // Check query parameters
  if (req.query && checkObject(req.query)) {
    return res.status(400).json({
      error: 'Invalid input detected',
      message: 'Query parameters contain potentially harmful content'
    });
  }

  // Check URL parameters
  if (req.params && checkObject(req.params)) {
    return res.status(400).json({
      error: 'Invalid input detected',
      message: 'URL parameters contain potentially harmful content'
    });
  }

  next();
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF check for GET requests
  if (req.method === 'GET') {
    return next();
  }

  // Check for CSRF token in headers
  const csrfToken = req.headers['x-csrf-token'] || req.headers['csrf-token'];
  
  if (!csrfToken) {
    return res.status(403).json({
      error: 'CSRF token missing',
      message: 'CSRF token is required for this request'
    });
  }

  // In a real implementation, you would validate the token against the session
  // For now, we'll just check if it exists
  next();
};

// Content Security Policy middleware
const cspMiddleware = (req, res, next) => {
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '));

  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent referrer leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Request size limiting middleware
const requestSizeLimit = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      message: 'Request size exceeds the limit of 10MB'
    });
  }

  next();
};

// Error handling middleware for security
const securityErrorHandler = (err, req, res, next) => {
  // Don't expose internal errors to client
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      message: 'File size exceeds the limit'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected file',
      message: 'Unexpected file field in request'
    });
  }

  // Generic error response
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
  });
};

module.exports = {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  uploadLimiter,
  apiLimiter,
  validateInput,
  validateFileUpload,
  sqlInjectionProtection,
  csrfProtection,
  cspMiddleware,
  securityHeaders,
  requestSizeLimit,
  securityErrorHandler
}; 