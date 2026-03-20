/**
 * Centralized Error Handler Middleware
 *
 * Architecture Decision:
 * - Single point of error handling
 * - Consistent error response format
 * - Proper HTTP status codes
 * - No sensitive information leakage in production
 */

export const errorHandler = (err, req, res, next) => {
  // Log error for debugging (use proper logger in production)
  console.error('[ERROR_HANDLER] Error caught:', err.message);
  console.error('[ERROR_HANDLER] Error name:', err.name);
  console.error('[ERROR_HANDLER] Error code:', err.code);
  console.error('[ERROR_HANDLER] Error statusCode:', err.statusCode);

  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR_HANDLER] Full stack:', err.stack);
  }

  // Handle known error types
  if (err.statusCode) {
    console.error('[ERROR_HANDLER] Responding with custom status code:', err.statusCode);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code || 'ERROR'
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    console.error('[ERROR_HANDLER] JWT error detected');
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    console.error('[ERROR_HANDLER] Token expired error detected');
    return res.status(401).json({
      success: false,
      message: 'Token expired.',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Handle database errors
  if (err.code === '23505') {
    console.error('[ERROR_HANDLER] Duplicate entry error detected');
    return res.status(409).json({
      success: false,
      message: 'Resource already exists.',
      code: 'DUPLICATE_ENTRY'
    });
  }

  // Default error response
  console.error('[ERROR_HANDLER] Returning default 500 error');
  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message,
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req, res) => {
  console.log('[ERROR_HANDLER] 404 Not Found:', req.method, req.path);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
    code: 'NOT_FOUND'
  });
};
