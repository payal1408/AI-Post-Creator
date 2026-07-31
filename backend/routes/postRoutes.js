const express = require('express');
const router = express.Router();
const {
  generateAndSavePost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleFavoritePost,
  searchPosts,
  filterPosts
} = require('../controllers/postController');
const protect = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validationMiddleware');
const {
  generatePostValidator,
  updatePostValidator
} = require('../validators/postValidator');

// All post routes are protected by authMiddleware
router.use(protect);

router.post('/generate', generatePostValidator, validateRequest, generateAndSavePost);
router.get('/', getPosts);
router.get('/search', searchPosts);
router.get('/filter', filterPosts);
router.get('/:id', getPostById);
router.put('/:id', updatePostValidator, validateRequest, updatePost);
router.delete('/:id', deletePost);
router.patch('/:id/favorite', toggleFavoritePost);

module.exports = router;
