const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token and optionally sets it in an HTTP-only cookie.
 * @param {Object} res - Express response object (optional)
 * @param {string} id - User ID
 * @returns {string} - Signed JWT token
 */
const generateToken = (res, id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  if (res) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // Default to 7 days
    });
  }

  return token;
};

module.exports = generateToken;
