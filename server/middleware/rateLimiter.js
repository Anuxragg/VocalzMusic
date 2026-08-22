const rateLimit = require('express-rate-limit');

// General API Rate Limiter: Allows generous request limits for music streaming, live search, and library browsing
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 min (~65 req/min)
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after a few minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict Authentication Limiter: Protects login, registration, and Google OAuth from brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 min
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload Rate Limiter: Protects Cloudinary / storage from upload spamming
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 40, // 40 uploads per hour
  message: {
    success: false,
    message: 'Upload limit reached. Please wait before uploading more tracks.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
};
