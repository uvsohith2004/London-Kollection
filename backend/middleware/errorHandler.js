/**
 * Centralized Error Handler Middleware
 *
 * Architecture Decision:
 * - Single point of error handling
 * - Consistent error response format
 * - Proper HTTP status codes
 * - No sensitive information leakage in production
 */

const normalizeError = (err) => {
  if (!err) {
    return {
      message: "Unexpected error",
      name: "UnknownError",
      code: "UNKNOWN_ERROR",
      statusCode: 500,
      stack: undefined,
    };
  }

  if (err instanceof Error) {
    return err;
  }

  if (typeof err === "string") {
    return {
      message: err,
      name: "NonErrorThrow",
      code: "NON_ERROR_THROWN",
      statusCode: 500,
      stack: undefined,
    };
  }

  return {
    message: err.message || "Unexpected error",
    name: err.name || "UnknownError",
    code: err.code,
    statusCode: err.statusCode || err.status,
    stack: err.stack,
  };
};

export const errorHandler = (err, req, res, next) => {
  const normalizedError = normalizeError(err);

  // Log error for debugging (use proper logger in production)
  console.error('[ERROR_HANDLER] Error caught:', normalizedError.message);
  console.error('[ERROR_HANDLER] Error name:', normalizedError.name);
  console.error('[ERROR_HANDLER] Error code:', normalizedError.code);
  console.error('[ERROR_HANDLER] Error statusCode:', normalizedError.statusCode);

  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR_HANDLER] Full stack:', normalizedError.stack || normalizedError.message);
  }

  // Handle known error types
  if (normalizedError.statusCode) {
    console.error('[ERROR_HANDLER] Responding with custom status code:', normalizedError.statusCode);
    return res.status(normalizedError.statusCode).json({
      success: false,
      message: normalizedError.message,
      code: normalizedError.code || 'ERROR'
    });
  }

  // Handle JWT errors
  if (normalizedError.name === 'JsonWebTokenError') {
    console.error('[ERROR_HANDLER] JWT error detected');
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      code: 'INVALID_TOKEN'
    });
  }

  if (normalizedError.name === 'TokenExpiredError') {
    console.error('[ERROR_HANDLER] Token expired error detected');
    return res.status(401).json({
      success: false,
      message: 'Token expired.',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Handle database errors
  if (normalizedError.code === '23505') {
    console.error('[ERROR_HANDLER] Duplicate entry error detected');
    return res.status(409).json({
      success: false,
      message: 'Resource already exists.',
      code: 'DUPLICATE_ENTRY'
    });
  }

  // Default error response
  console.error('[ERROR_HANDLER] Returning default 500 error');
  res.status(normalizedError.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : normalizedError.message,
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV !== 'production' && { stack: normalizedError.stack })
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
