# AI Post Creator Backend

Production-ready backend for the AI Post Creator application built using Node.js, Express, and MongoDB.

## Features
- **Clean MVC Architecture** with modular routes, controllers, and services.
- **Robust JWT Authentication** via custom headers and HTTP-only cookies.
- **Centralized Error Handling & 404 handler** to prevent sensitive information leakage.
- **Request Validation** using `express-validator`.
- **Axios-based AI Service** with single-retry logic supporting both Google Gemini and OpenAI.
- **Advanced Querying on Posts** supporting text search, multiple filters, sorting options, and pagination.
- **Security Protections** via Helmet, CORS configuration, and Rate Limiter.
- **MongoDB Indexes** configured on keys and compound text index for search efficiency.

---

## Prerequisites
- **Node.js**: `v18.0.0` or higher
- **MongoDB**: A running MongoDB instance locally or on Atlas.

---

## Getting Started

### 1. Install Dependencies
Navigate to the `backend` directory and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create or edit your `.env` file in the root of the `backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai_post_creator
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long
JWT_EXPIRE=7d
AI_PROVIDER=GEMINI # Choose 'GEMINI' or 'OPENAI'
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
CLIENT_URL=http://localhost:3000
```

### 3. Run the Server
- **Production Mode**:
  ```bash
  npm start
  ```
- **Development Mode** (auto-restart via Nodemon):
  ```bash
  npm run dev
  ```

---

## Testing & Verification

We have created an integration test suite under `scratch/test_api.js` to automatically verify the end-to-end functionality of all endpoints without needing real AI keys (the script automatically mocks the AI generation calls for safety and offline verification).

### Run the Integration Test
1. Make sure your local MongoDB instance is running.
2. Run the test script directly:
   ```bash
   node scratch/test_api.js
   ```

The script will:
1. Initialize a test MongoDB database connection.
2. Spin up the Express server on a test port (`5001`).
3. Create a test user and obtain a JWT.
4. Verify user registration, profile retrieval, and profile updates.
5. Generate an AI post (using mocked AI service).
6. Retrieve posts using pagination, keyword search, filters, and sorting.
7. Verify authorization (blocking users from viewing/editing others' posts).
8. Toggle post favorite status.
9. Delete posts and finally delete the user account (along with recursive post deletion).
10. Shut down the server cleanly on completion.
