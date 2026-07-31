const Post = require('../models/Post');
const aiService = require('../services/aiService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * Builds standard mongoose search and filter query objects.
 */
const buildPostQuery = (req) => {
  const query = { user: req.user._id };

  // Search keyword (case-insensitive on topic or content)
  if (req.query.keyword) {
    const keyword = req.query.keyword.trim();
    query.$or = [
      { topic: { $regex: keyword, $options: 'i' } },
      { generatedContent: { $regex: keyword, $options: 'i' } }
    ];
  }

  // Filters
  if (req.query.platform) {
    query.platform = { $regex: new RegExp(`^${req.query.platform.trim()}$`, 'i') };
  }
  if (req.query.tone) {
    query.tone = { $regex: new RegExp(`^${req.query.tone.trim()}$`, 'i') };
  }
  if (req.query.favorite) {
    query.favorite = req.query.favorite === 'true';
  }

  // Date filters (Date Range)
  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) {
      query.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      // Set to end of the specified day
      const end = new Date(req.query.endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  return query;
};

/**
 * Build Mongoose sort options.
 */
const buildSortOption = (sortBy) => {
  switch (sortBy ? sortBy.toLowerCase() : '') {
    case 'oldest':
      return { createdAt: 1 };
    case 'alphabetical':
      return { topic: 1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
};

/**
 * @desc    Generate AI post and save in MongoDB
 * @route   POST /api/posts/generate
 * @access  Private
 */
const generateAndSavePost = asyncHandler(async (req, res) => {
  const { topic, platform, tone } = req.body;

  // Call the AI Service to generate content
  const generatedContent = await aiService.generatePost(topic, platform, tone);

  // Generate the prompt string that was sent
  const generatedPrompt = aiService.constructPrompt(topic, platform, tone);

  // Save the post in MongoDB
  const post = await Post.create({
    user: req.user._id,
    topic,
    generatedPrompt,
    platform,
    tone,
    generatedContent,
    favorite: false
  });

  return sendSuccess(res, 'Post generated and saved successfully', post, 201);
});

/**
 * @desc    Get all posts with Pagination, Sorting, Filtering, and Search
 * @route   GET /api/posts
 * @access  Private
 */
const getPosts = asyncHandler(async (req, res) => {
  const query = buildPostQuery(req);

  // Pagination parameters
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Sorting
  const sort = buildSortOption(req.query.sort);

  // Execute Query
  const total = await Post.countDocuments(query);
  const posts = await Post.find(query).sort(sort).skip(skip).limit(limit);

  return sendSuccess(res, 'Posts retrieved successfully', {
    posts,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get single post
 * @route   GET /api/posts/:id
 * @access  Private
 */
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return sendError(res, 'Post not found', null, 404);
  }

  // Check authorization
  if (post.user.toString() !== req.user._id.toString()) {
    return sendError(res, 'Not authorized to view this post', null, 403);
  }

  return sendSuccess(res, 'Post retrieved successfully', post);
});

/**
 * @desc    Update post content
 * @route   PUT /api/posts/:id
 * @access  Private
 */
const updatePost = asyncHandler(async (req, res) => {
  const { generatedContent } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return sendError(res, 'Post not found', null, 404);
  }

  // Check authorization
  if (post.user.toString() !== req.user._id.toString()) {
    return sendError(res, 'Not authorized to edit this post', null, 403);
  }

  post.generatedContent = generatedContent;
  const updatedPost = await post.save();

  return sendSuccess(res, 'Post updated successfully', updatedPost);
});

/**
 * @desc    Delete post
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return sendError(res, 'Post not found', null, 404);
  }

  // Check authorization
  if (post.user.toString() !== req.user._id.toString()) {
    return sendError(res, 'Not authorized to delete this post', null, 403);
  }

  await Post.findByIdAndDelete(req.params.id);

  return sendSuccess(res, 'Post deleted successfully');
});

/**
 * @desc    Toggle post favorite status
 * @route   PATCH /api/posts/:id/favorite
 * @access  Private
 */
const toggleFavoritePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return sendError(res, 'Post not found', null, 404);
  }

  // Check authorization
  if (post.user.toString() !== req.user._id.toString()) {
    return sendError(res, 'Not authorized to edit this post', null, 403);
  }

  post.favorite = !post.favorite;
  const updatedPost = await post.save();

  return sendSuccess(
    res, 
    `Post ${updatedPost.favorite ? 'marked as favorite' : 'removed from favorites'} successfully`, 
    updatedPost
  );
});

/**
 * @desc    Search posts by keyword
 * @route   GET /api/posts/search
 * @access  Private
 */
const searchPosts = asyncHandler(async (req, res) => {
  // Delegate query logic to getPosts
  return getPosts(req, res);
});

/**
 * @desc    Filter posts by platform, tone, favorite, and date range
 * @route   GET /api/posts/filter
 * @access  Private
 */
const filterPosts = asyncHandler(async (req, res) => {
  // Delegate query logic to getPosts
  return getPosts(req, res);
});

module.exports = {
  generateAndSavePost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleFavoritePost,
  searchPosts,
  filterPosts
};
