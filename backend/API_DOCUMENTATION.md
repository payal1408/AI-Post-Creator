# AI Post Creator API Documentation

This document describes all API endpoints exposed by the AI Post Creator backend.

## Base URL
- **Local Development**: `http://localhost:5000`
- All paths are relative to the Base URL.
- All requests and responses use the `application/json` content type.

## Global Response Schemas

### Standard Success Response
```json
{
  "success": true,
  "message": "Success message description",
  "data": {}
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description message",
  "error": "Error details or validation array"
}
```

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Description**: Registers a new user account, hashes their password, signs a JWT, and sets an HTTP-only cookie.
- **Authentication Required**: No
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `name` | String | Yes | Minimum 2 characters |
  | `email` | String | Yes | Valid email address |
  | `password` | String | Yes | Minimum 6 characters |
  | `profileImage` | String | No | URL or local path of profile avatar |

- **Response Status Codes**:
  - `201 Created`: User successfully registered.
  - `400 Bad Request`: Email already exists or validation errors.

- **Example Request**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123",
    "profileImage": "https://example.com/avatar.jpg"
  }
  ```
- **Example Response**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "_id": "64a0f443b715cb9fb4a5be1e",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "profileImage": "https://example.com/avatar.jpg",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

### 1.2 Login User
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Description**: Authenticates a user, returns a JWT, and sets it in an HTTP-only cookie.
- **Authentication Required**: No
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `email` | String | Yes | Registered email |
  | `password` | String | Yes | Password |

- **Response Status Codes**:
  - `200 OK`: Login successful.
  - `401 Unauthorized`: Invalid credentials.
  - `400 Bad Request`: Validation errors.

- **Example Request**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Example Response**:
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "_id": "64a0f443b715cb9fb4a5be1e",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "profileImage": "https://example.com/avatar.jpg",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

### 1.3 Get Current User Profile
- **Method**: `GET`
- **URL**: `/api/auth/profile` (also accessible via `/api/user/profile`)
- **Description**: Retrieves current user's profile details using credentials in the JWT header/cookie.
- **Authentication Required**: Yes (`Bearer <token>` header or `token` cookie)
- **Request Body**: None
- **Response Status Codes**:
  - `200 OK`: Profile retrieved successfully.
  - `401 Unauthorized`: Missing or invalid token.

- **Example Response**:
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": {
      "_id": "64a0f443b715cb9fb4a5be1e",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "profileImage": "https://example.com/avatar.jpg",
      "createdAt": "2026-07-08T04:22:12.000Z",
      "updatedAt": "2026-07-08T04:22:12.000Z"
    }
  }
  ```

---

### 1.4 Update Current User Profile
- **Method**: `PUT`
- **URL**: `/api/auth/profile` (also accessible via `/api/user/profile`)
- **Description**: Updates user's personal details.
- **Authentication Required**: Yes
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `name` | String | No | Must be at least 2 characters |
  | `email` | String | No | Valid email address |
  | `password` | String | No | New password (hashed automatically) |
  | `profileImage` | String | No | Updated image URL/path |

- **Response Status Codes**:
  - `200 OK`: Profile updated successfully.
  - `400 Bad Request`: Validation failure or duplicate email.
  - `401 Unauthorized`: Token invalid.

- **Example Request**:
  ```json
  {
    "name": "Jane Smith",
    "profileImage": "https://example.com/jane_smith.jpg"
  }
  ```
- **Example Response**:
  ```json
  {
    "success": true,
    "message": "User profile updated successfully",
    "data": {
      "_id": "64a0f443b715cb9fb4a5be1e",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "profileImage": "https://example.com/jane_smith.jpg",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

### 1.5 Logout User
- **Method**: `POST`
- **URL**: `/api/auth/logout`
- **Description**: Invalidates and clears the cookie token.
- **Authentication Required**: Yes
- **Request Body**: None
- **Response Status Codes**:
  - `200 OK`: Logout successful.
  - `401 Unauthorized`: Token invalid.

- **Example Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "data": {}
  }
  ```

---

## 2. User Management Endpoints

### 2.1 Delete User Account
- **Method**: `DELETE`
- **URL**: `/api/user/account`
- **Description**: Permanently deletes the user record and recursively deletes all Post documents created by this user. Exits their session.
- **Authentication Required**: Yes
- **Request Body**: None
- **Response Status Codes**:
  - `200 OK`: Account and posts successfully deleted.
  - `401 Unauthorized`: Token invalid.

- **Example Response**:
  ```json
  {
    "success": true,
    "message": "Account and all associated posts deleted successfully",
    "data": {}
  }
  ```

---

## 3. Post Endpoints

### 3.1 Generate Post
- **Method**: `POST`
- **URL**: `/api/posts/generate`
- **Description**: Connects to the configured AI API (Gemini or OpenAI), generates the post based on topic/platform/tone, saves it to MongoDB, and returns it.
- **Authentication Required**: Yes
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `topic` | String | Yes | Main subject (min 3 characters) |
  | `platform` | String | Yes | Target network (e.g., "LinkedIn", "Twitter", "Instagram") |
  | `tone` | String | Yes | Target tone (e.g., "Professional", "Casual", "Funny") |

- **Response Status Codes**:
  - `210 Created (201)`: AI generation and saving succeeded.
  - `400 Bad Request`: Validation errors.
  - `500 Server Error`: AI Service failure.

- **Example Request**:
  ```json
  {
    "topic": "Artificial Intelligence in Healthcare",
    "platform": "LinkedIn",
    "tone": "Professional"
  }
  ```
- **Example Response**:
  ```json
  {
    "success": true,
    "message": "Post generated and saved successfully",
    "data": {
      "_id": "64a0f8bfb715cb9fb4a5be22",
      "user": "64a0f443b715cb9fb4a5be1e",
      "topic": "Artificial Intelligence in Healthcare",
      "generatedPrompt": "Write an engaging LinkedIn post.\nTopic: Artificial Intelligence in Healthcare\nTone: Professional\nLength: Around 200 words\nAdd emojis only where appropriate.\nEnd with relevant hashtags.",
      "platform": "LinkedIn",
      "tone": "Professional",
      "generatedContent": "🩺 The integration of Artificial Intelligence in Healthcare is shifting boundaries! From predictive diagnostics to personalized treatment plans, AI is empowering doctors to deliver faster, more accurate care...\n\n#HealthTech #AIinHealthcare #DigitalHealth",
      "favorite": false,
      "createdAt": "2026-07-08T04:23:31.000Z",
      "updatedAt": "2026-07-08T04:23:31.000Z"
    }
  }
  ```

---

### 3.2 Get All Posts
- **Method**: `GET`
- **URL**: `/api/posts`
- **Description**: Returns all posts belonging to the authenticated user. Includes pagination, sorting, keyword searches, and filters.
- **Authentication Required**: Yes
- **Query Parameters**:
  - `page`: Page index (default: `1`)
  - `limit`: Records per page (default: `10`)
  - `sort`: Sort criteria: `newest` (default), `oldest`, or `alphabetical` (sorts by topic)
  - `keyword`: Searches topic or generatedContent (case-insensitive)
  - `platform`: Filters by exact platform (case-insensitive)
  - `tone`: Filters by exact tone (case-insensitive)
  - `favorite`: Filter by favorite state (`true` or `false`)
  - `startDate`: Start date filter (ISO format, e.g., `2026-07-01`)
  - `endDate`: End date filter (ISO format, e.g., `2026-07-31`)

- **Response Status Codes**:
  - `200 OK`: Query processed successfully.
  - `401 Unauthorized`: Token invalid.

- **Example Response**:
  ```json
  {
    "success": true,
    "message": "Posts retrieved successfully",
    "data": {
      "posts": [
        {
          "_id": "64a0f8bfb715cb9fb4a5be22",
          "user": "64a0f443b715cb9fb4a5be1e",
          "topic": "Artificial Intelligence in Healthcare",
          "platform": "LinkedIn",
          "tone": "Professional",
          "generatedContent": "🩺 The integration of AI in Healthcare...",
          "favorite": true,
          "createdAt": "2026-07-08T04:23:31.000Z",
          "updatedAt": "2026-07-08T04:23:45.000Z"
        }
      ],
      "pagination": {
        "total": 1,
        "page": 1,
        "limit": 10,
        "pages": 1
      }
    }
  }
  ```

---

### 3.3 Get Single Post
- **Method**: `GET`
- **URL**: `/api/posts/:id`
- **Description**: Retrieves a specific post by ID. Users can only fetch their own posts.
- **Authentication Required**: Yes
- **Response Status Codes**:
  - `200 OK`: Post retrieved.
  - `404 Not Found`: Post does not exist.
  - `403 Forbidden`: Trying to access another user's post.
  - `401 Unauthorized`: Token invalid.

- **Example Response**:
  ```json
  {
    "success": true,
    "message": "Post retrieved successfully",
    "data": {
      "_id": "64a0f8bfb715cb9fb4a5be22",
      "user": "64a0f443b715cb9fb4a5be1e",
      "topic": "Artificial Intelligence in Healthcare",
      "platform": "LinkedIn",
      "tone": "Professional",
      "generatedContent": "🩺 The integration of AI in Healthcare...",
      "favorite": false
    }
  }
  ```

---

### 3.4 Update Post Content
- **Method**: `PUT`
- **URL**: `/api/posts/:id`
- **Description**: Edits the text of the generated content. Only owner can update.
- **Authentication Required**: Yes
- **Request Body**:
  | Field | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `generatedContent` | String | Yes | Updated content text |

- **Response Status Codes**:
  - `200 OK`: Post updated.
  - `404 Not Found`: Post does not exist.
  - `403 Forbidden`: Unauthorized edit.
  - `400 Bad Request`: Validation errors.

- **Example Request**:
  ```json
  {
    "generatedContent": "🩺 Corrected and updated AI in Healthcare post."
  }
  ```
- **Example Response**:
  ```json
  {
    "success": true,
    "message": "Post updated successfully",
    "data": {
      "_id": "64a0f8bfb715cb9fb4a5be22",
      "generatedContent": "🩺 Corrected and updated AI in Healthcare post.",
      "updatedAt": "2026-07-08T04:25:00.000Z"
    }
  }
  ```

---

### 3.5 Delete Post
- **Method**: `DELETE`
- **URL**: `/api/posts/:id`
- **Description**: Deletes the specified post. Only owner can delete.
- **Authentication Required**: Yes
- **Response Status Codes**:
  - `200 OK`: Post deleted.
  - `404 Not Found`: Post does not exist.
  - `403 Forbidden`: Unauthorized delete.

- **Example Response**:
  ```json
  {
    "success": true,
    "message": "Post deleted successfully",
    "data": {}
  }
  ```

---

### 3.6 Toggle Favorite Status
- **Method**: `PATCH`
- **URL**: `/api/posts/:id/favorite`
- **Description**: Toggles the `favorite` property boolean from `true` to `false` (and vice-versa).
- **Authentication Required**: Yes
- **Response Status Codes**:
  - `200 OK`: Toggle successful.
  - `404 Not Found`: Post does not exist.
  - `403 Forbidden`: Unauthorized modification.

- **Example Response**:
  ```json
  {
    "success": true,
    "message": "Post marked as favorite successfully",
    "data": {
      "_id": "64a0f8bfb715cb9fb4a5be22",
      "favorite": true
    }
  }
  ```

---

### 3.7 Search Posts
- **Method**: `GET`
- **URL**: `/api/posts/search`
- **Description**: Explicit keyword search endpoint. Supports all parameters of `/api/posts` but focuses on `?keyword=`.
- **Authentication Required**: Yes
- **Query Parameters**:
  - `keyword`: Subject/content search term (case-insensitive)
- **Response Status Codes**:
  - `200 OK`: Search query returned results.

- **Example Request**: `/api/posts/search?keyword=healthcare`

---

### 3.8 Filter Posts
- **Method**: `GET`
- **URL**: `/api/posts/filter`
- **Description**: Explicit filter endpoint. Supports all parameters of `/api/posts` but focuses on platform, tone, favorite, and date.
- **Authentication Required**: Yes
- **Query Parameters**:
  - `platform`: platform filter
  - `tone`: tone filter
  - `favorite`: favorite filter
  - `startDate`: date range start
  - `endDate`: date range end
- **Response Status Codes**:
  - `200 OK`: Query returned matching items.

- **Example Request**: `/api/posts/filter?platform=LinkedIn&favorite=true`
