const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    generatedPrompt: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    tone: {
      type: String,
      required: true,
      trim: true,
    },
    generatedContent: {
      type: String,
      required: true,
    },
    favorite: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for sorting by createdAt
postSchema.index({ createdAt: -1 });

// Compound text index for search (topic and generatedContent)
postSchema.index({ topic: 'text', generatedContent: 'text' });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
