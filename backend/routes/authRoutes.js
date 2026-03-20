import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateForgotPassword,
  validateVerifyResetOtp,
  validateResetPassword
} from '../middleware/validation.js';
import { verifyRefreshToken, verifyAccessToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Rate Limiting for Auth Routes
 * 
 * Architecture Decision:
 * - Prevent brute force attacks
 * - Different limits for different endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3, // Stricter limit for sensitive operations
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Public routes
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/refresh', strictLimiter, validateRefreshToken, verifyRefreshToken, refreshToken);
router.post('/forgot-password', strictLimiter, validateForgotPassword, forgotPassword);
router.post('/verify-reset-otp', strictLimiter, validateVerifyResetOtp, verifyResetOtp);
router.post('/reset-password', strictLimiter, validateResetPassword, resetPassword);

// Protected routes
router.post('/logout', verifyAccessToken, logout);

export default router;
