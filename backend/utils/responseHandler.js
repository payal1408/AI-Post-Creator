/**
 * Sends a standardized success response.
 * @param {Object} res - Express response object
 * @param {string} message - Success description message
 * @param {Object|Array} data - Data to payload in the response
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends a standardized error response.
 * @param {Object} res - Express response object
 * @param {string} message - Error description message
 * @param {*} error - Detailed error info or validation errors
 * @param {number} statusCode - HTTP status code (default: 500)
 */
const sendError = (res, message, error = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
