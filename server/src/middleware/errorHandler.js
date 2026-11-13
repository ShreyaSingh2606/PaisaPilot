/**
 * Centralized Error Handling Middleware for Express
 */
function errorHandler(err, req, res, next) {
  console.error('❌ Server Error:', err.message || err);
  if (err.stack && process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.details || null : null,
  });
}

module.exports = errorHandler;
