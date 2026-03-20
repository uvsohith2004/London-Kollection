import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Middleware
 *
 * Architecture Decision:
 * - Stateless JWT authentication (no server-side sessions)
 * - Access token in Authorization header (not localStorage for security)
 * - Refresh token rotation for enhanced security
 */

/**
 * Verify JWT Access Token
 * Extracts token from Authorization header and verifies it
 */
export const verifyAccessToken = async (req, res, next) => {
  try {
    console.log('[AUTH_MIDDLEWARE] Verifying access token');
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[AUTH_MIDDLEWARE] Missing or invalid Authorization header');
      return res.status(401).json({
        success: false,
        message: 'Access token required. Please provide token in Authorization header.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('[AUTH_MIDDLEWARE] Token extracted from header');

    try {
      console.log('[AUTH_MIDDLEWARE] Verifying JWT token');
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      console.log('[AUTH_MIDDLEWARE] Token verified successfully for user:', decoded.id);

      // Attach user info to request object
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.log('[AUTH_MIDDLEWARE] Access token expired');
        return res.status(401).json({
          success: false,
          message: 'Access token expired. Please refresh your token.',
          code: 'TOKEN_EXPIRED'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        console.log('[AUTH_MIDDLEWARE] Invalid access token:', error.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid access token.',
          code: 'INVALID_TOKEN'
        });
      }

      console.error('[AUTH_MIDDLEWARE] Unexpected JWT error:', error.message);
      throw error;
    }
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE] Error in verifyAccessToken:', error.message);
    next(error);
  }
};

/**
 * Verify JWT Refresh Token
 * Used for refresh token endpoint
 */
export const verifyRefreshToken = async (req, res, next) => {
  try {
    console.log('[AUTH_MIDDLEWARE] Verifying refresh token');
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      console.log('[AUTH_MIDDLEWARE] Refresh token not provided');
      return res.status(401).json({
        success: false,
        message: 'Refresh token required.'
      });
    }

    console.log('[AUTH_MIDDLEWARE] Refresh token found');

    try {
      console.log('[AUTH_MIDDLEWARE] Verifying refresh token JWT');
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      console.log('[AUTH_MIDDLEWARE] Refresh token verified for user:', decoded.id);

      // Verify token exists in database (token rotation check)
      console.log('[AUTH_MIDDLEWARE] Checking token in database');
      const user = await User.findByRefreshToken(refreshToken);

      if (!user) {
        console.log('[AUTH_MIDDLEWARE] Refresh token not found in database or already used');
        return res.status(401).json({
          success: false,
          message: 'Refresh token not found or already used. Please login again.',
          code: 'TOKEN_INVALID'
        });
      }

      console.log('[AUTH_MIDDLEWARE] Refresh token validated in database');

      req.user = {
        id: decoded.id,
        email: decoded.email
      };
      req.refreshToken = refreshToken;

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.log('[AUTH_MIDDLEWARE] Refresh token expired');
        return res.status(401).json({
          success: false,
          message: 'Refresh token expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        console.log('[AUTH_MIDDLEWARE] Invalid refresh token:', error.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token.',
          code: 'INVALID_TOKEN'
        });
      }

      console.error('[AUTH_MIDDLEWARE] Unexpected JWT error:', error.message);
      throw error;
    }
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE] Error in verifyRefreshToken:', error.message);
    next(error);
  }
};

/**
 * Optional: Role-based access control middleware
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    console.log('[AUTH_MIDDLEWARE] Checking role-based access for roles:', roles);

    if (!req.user) {
      console.log('[AUTH_MIDDLEWARE] User not authenticated');
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log('[AUTH_MIDDLEWARE] User role not authorized:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.'
      });
    }

    console.log('[AUTH_MIDDLEWARE] User authorized with role:', req.user.role);
    next();
  };
};
