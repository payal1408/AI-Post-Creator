const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  logoutUser
} = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validationMiddleware');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator
} = require('../validators/authValidator');

// Public routes
router.post('/register', registerValidator, validateRequest, registerUser);
router.post('/login', loginValidator, validateRequest, loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfileValidator, validateRequest, updateUserProfile);
router.post('/logout', protect, logoutUser);

module.exports = router;
