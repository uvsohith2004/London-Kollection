import { z } from 'zod';

/**
 * Validation Middleware using Zod
 *
 * Architecture Decision:
 * - Schema-based validation for type safety
 * - Prevents user enumeration by using generic error messages
 * - Centralized validation logic
 */

// Registration schema
const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .transform(val => val.trim()),
  email: z.string()
    .email('Invalid email format')
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['user', 'admin']).optional().default('user')
});

// Login schema
const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(1, 'Password is required')
});

// Refresh token schema
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required').optional()
});

const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .transform(val => val.toLowerCase().trim()),
});

const verifyResetOtpSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .transform(val => val.toLowerCase().trim()),
  otp: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

const resetPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .transform(val => val.toLowerCase().trim()),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

/**
 * Validate request body against schema
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      console.log('[VALIDATION] Validating request body');
      const validated = schema.parse(req.body);
      console.log('[VALIDATION] Request body validation passed');
      req.body = validated; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[VALIDATION] Validation failed:', error.errors);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      console.error('[VALIDATION] Unexpected error during validation:', error.message);
      next(error);
    }
  };
};

export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
export const validateRefreshToken = validate(refreshTokenSchema);
export const validateForgotPassword = validate(forgotPasswordSchema);
export const validateVerifyResetOtp = validate(verifyResetOtpSchema);
export const validateResetPassword = validate(resetPasswordSchema);
