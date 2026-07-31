const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/responseHandler');

/**
 * Middleware to protect routes and verify JWT.
 */
const protect = async (req, res, next) => {
  let token;

  // Read token from Authorization header or Cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendError(res, 'Not authorized, token missing', null, 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user (excluding password)
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return sendError(res, 'Not authorized, user not found', null, 401);
    }

    next();
  } catch (error) {
    return sendError(res, 'Not authorized, token invalid', error.message, 401);
  }
};

module.exports = protect;
