const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, profileImage } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return sendError(res, 'User already exists', null, 400);
  }

  // Create user (password encryption is handled in pre-save hook)
  const user = await User.create({
    name,
    email,
    password,
    profileImage: profileImage || ''
  });

  if (user) {
    // Generate token and set HTTP-only cookie
    const token = generateToken(res, user._id);

    return sendSuccess(res, 'User registered successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      token
    }, 201);
  } else {
    return sendError(res, 'Invalid user data', null, 400);
  }
});

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user in database
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Generate token and set HTTP-only cookie
    const token = generateToken(res, user._id);

    return sendSuccess(res, 'Logged in successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      token
    });
  } else {
    return sendError(res, 'Invalid email or password', null, 401);
  }
});

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (user) {
    return sendSuccess(res, 'User profile retrieved successfully', user);
  } else {
    return sendError(res, 'User not found', null, 404);
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
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

    // Re-generate token and update cookie
    const token = generateToken(res, updatedUser._id);

    return sendSuccess(res, 'User profile updated successfully', {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
      token
    });
  } else {
    return sendError(res, 'User not found', null, 404);
  }
});

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  return sendSuccess(res, 'Logged out successfully', {});
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  logoutUser
};
