const User = require('../models/User');
const Post = require('../models/Post');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Get user profile (Alternate endpoint)
 * @route   GET /api/user/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    return sendSuccess(res, 'User profile retrieved successfully', user);
  } else {
    return sendError(res, 'User not found', null, 404);
  }
});

/**
 * @desc    Update user profile (Alternate endpoint)
 * @route   PUT /api/user/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.profileImage !== undefined) {
      user.profileImage = req.body.profileImage;
    }
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    return sendSuccess(res, 'User profile updated successfully', {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage
    });
  } else {
    return sendError(res, 'User not found', null, 404);
  }
});

/**
 * @desc    Delete user account and all associated posts
 * @route   DELETE /api/user/account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Delete all posts belonging to the user
  await Post.deleteMany({ user: userId });

  // Delete the user record
  const user = await User.findByIdAndDelete(userId);

  if (user) {
    // Clear JWT cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return sendSuccess(res, 'Account and all associated posts deleted successfully');
  } else {
    return sendError(res, 'User not found', null, 404);
  }
});

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount
};
