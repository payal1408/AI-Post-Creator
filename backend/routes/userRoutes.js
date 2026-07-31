const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  deleteAccount
} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validationMiddleware');
const { updateProfileValidator } = require('../validators/authValidator');

// Protected User endpoints
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidator, validateRequest, updateProfile);
router.delete('/account', protect, deleteAccount);

module.exports = router;
