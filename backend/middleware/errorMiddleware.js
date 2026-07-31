const { sendError } = require('../utils/responseHandler');

/**
 * Async Error Wrapper to eliminate try-catch boilerplate in controllers.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Middleware to handle 404 (Not Found) errors.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Centralized error handler middleware.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log server errors to console
  if (statusCode === 500) {
    console.error(`[Server Error]`, err.stack || err.message);
  }

  // Format custom database error messages
  let message = err.message || 'Server Error';
  let errorData = process.env.NODE_ENV === 'production' ? null : err.stack;

  // Handle Mongoose Bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return sendError(res, 'Resource not found', `Invalid ID format for field ${err.path}`, 400);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    return sendError(res, 'Duplicate field value entered', err.keyValue, 400);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return sendError(res, 'Validation Error', messages, 400);
  }

  return sendError(res, message, errorData, statusCode);
};

module.exports = {
  asyncHandler,
  notFound,
  errorHandler,
};
