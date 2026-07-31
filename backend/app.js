const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration (supporting cookies)
app.use(
  cors()
  //   {
  //   origin: process.env.CLIENT_URL || 'http://localhost:3000',
  //   credentials: true
  // }
);

// Logging middleware
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiter: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
    error: "Rate limit exceeded",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all API endpoints
app.use("/api", limiter);

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);

// Base route for API status check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Post Creator API is running...",
  });
});

// Fallback for 404 not found routes
app.use(notFound);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
