const { body } = require('express-validator');

const generatePostValidator = [
  body('topic')
    .trim()
    .notEmpty()
    .withMessage('Topic is required')
    .isLength({ min: 3 })
    .withMessage('Topic must be at least 3 characters long'),
  body('platform')
    .trim()
    .notEmpty()
    .withMessage('Platform is required'),
  body('tone')
    .trim()
    .notEmpty()
    .withMessage('Tone is required'),
];

const updatePostValidator = [
  body('generatedContent')
    .trim()
    .notEmpty()
    .withMessage('Generated content is required'),
];

module.exports = {
  generatePostValidator,
  updatePostValidator,
};
