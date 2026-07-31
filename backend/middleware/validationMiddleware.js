const { validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHandler');

/**
 * Middleware to check validation results from express-validator.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Map errors to a clean, user-friendly format
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    
    return sendError(res, 'Validation failed', formattedErrors, 400);
  }
  
  next();
};

module.exports = validateRequest;
