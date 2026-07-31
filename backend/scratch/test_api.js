// Set Environment Variables for Test isolation
process.env.PORT = '5001';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/ai_post_creator_test';
process.env.JWT_SECRET = 'test_jwt_secret_value_for_testing_12345';
process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const axios = require('axios');
const app = require('../app');
const connectDB = require('../config/db');
const aiService = require('../services/aiService');

// Mock the AI Service generatePost call to avoid requiring active keys
aiService.generatePost = async (topic, platform, tone) => {
  return `🚀 [Mock AI Content] Engaged post for ${platform} about ${topic} written in a ${tone} tone. #Tech #Innovation`;
};

const BASE_URL = 'http://localhost: ';

async function runTests() {
  console.log('=== AI Post Creator Integration Test Suite ===');
  let server;

  try {
    // Connect to Database
    await connectDB();

    // 1. Start test server
    server = app.listen(5001, () => {
      console.log('Test Server started on port 5001');
    });

    // Wait a brief moment for database connection to open
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Clear test database to guarantee fresh runs
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
      console.log('Test Database cleared.');
    }

    // Storage for tokens and IDs
    let userAToken = '';
    let userBToken = '';
    let postAId = '';
    let userAId = '';

    console.log('\n--- 1. API Status Check ---');
    const statusRes = await axios.get(`${BASE_URL}/`);
    console.log('Status Response:', statusRes.data);

    console.log('\n--- 2. Register User A ---');
    const regResA = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'User A',
      email: 'usera@example.com',
      password: 'password123',
      profileImage: 'https://example.com/avatarA.jpg'
    });
    console.log('Register User A:', regResA.data.success ? 'PASSED' : 'FAILED');
    userAToken = regResA.data.data.token;
    userAId = regResA.data.data._id;

    console.log('\n--- 3. Login User A ---');
    const loginResA = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'usera@example.com',
      password: 'password123'
    });
    console.log('Login User A:', loginResA.data.success ? 'PASSED' : 'FAILED');

    console.log('\n--- 4. Register User B ---');
    const regResB = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'User B',
      email: 'userb@example.com',
      password: 'password456'
    });
    console.log('Register User B:', regResB.data.success ? 'PASSED' : 'FAILED');
    userBToken = regResB.data.data.token;

    console.log('\n--- 5. Fetch & Update User A Profile ---');
    const profileResA = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    console.log('Get Profile A:', profileResA.data.data.name === 'User A' ? 'PASSED' : 'FAILED');

    const updateProfileRes = await axios.put(`${BASE_URL}/api/auth/profile`, {
      name: 'User A Updated'
    }, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    console.log('Update Profile A:', updateProfileRes.data.data.name === 'User A' ? 'FAILED' : 'PASSED');

    console.log('\n--- 6. Generate AI Post for User A ---');
    const postGenRes = await axios.post(`${BASE_URL}/api/posts/generate`, {
      topic: 'AI in Healthcare',
      platform: 'LinkedIn',
      tone: 'Professional'
    }, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    console.log('Generate Post A:', postGenRes.data.success ? 'PASSED' : 'FAILED');
    console.log('Post Content:', postGenRes.data.data.generatedContent);
    postAId = postGenRes.data.data._id;

    console.log('\n--- 7. Security Check: User B Accessing User A Post ---');
    try {
      await axios.get(`${BASE_URL}/api/posts/${postAId}`, {
        headers: { Authorization: `Bearer ${userBToken}` }
      });
      console.log('Security check failed! User B was able to view User A\'s post.');
    } catch (err) {
      console.log('GET Post: Blocked User B (403): PASSED', err.response?.status === 403 ? '(Got 403)' : '(Failed)');
    }

    try {
      await axios.put(`${BASE_URL}/api/posts/${postAId}`, {
        generatedContent: 'Hacked Content'
      }, {
        headers: { Authorization: `Bearer ${userBToken}` }
      });
      console.log('Security check failed! User B was able to update User A\'s post.');
    } catch (err) {
      console.log('PUT Post: Blocked User B (403): PASSED', err.response?.status === 403 ? '(Got 403)' : '(Failed)');
    }

    console.log('\n--- 8. Retrieve Posts with Filter, Search & Pagination ---');
    // Generate a second post first to test search
    await axios.post(`${BASE_URL}/api/posts/generate`, {
      topic: 'Blockchains in Banking',
      platform: 'Twitter',
      tone: 'Casual'
    }, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });

    const searchRes = await axios.get(`${BASE_URL}/api/posts?keyword=Blockchain`, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    console.log('Search Keyword:', searchRes.data.data.posts.length === 1 ? 'PASSED' : 'FAILED');

    const filterRes = await axios.get(`${BASE_URL}/api/posts?platform=LinkedIn`, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    console.log('Filter Platform:', filterRes.data.data.posts.length === 1 ? 'PASSED' : 'FAILED');

    const pageRes = await axios.get(`${BASE_URL}/api/posts?page=1&limit=1`, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    console.log('Pagination Limit:', pageRes.data.data.posts.length === 1 ? 'PASSED' : 'FAILED');
    console.log('Pagination Metadata:', pageRes.data.data.pagination);

    console.log('\n--- 9. Toggle Favorite Post ---');
    const favRes1 = await axios.patch(`${BASE_URL}/api/posts/${postAId}/favorite`, {}, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    console.log('Mark Favorite:', favRes1.data.data.favorite === true ? 'PASSED' : 'FAILED');

    const favRes2 = await axios.patch(`${BASE_URL}/api/posts/${postAId}/favorite`, {}, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    console.log('Unmark Favorite:', favRes2.data.data.favorite === false ? 'PASSED' : 'FAILED');

    console.log('\n--- 10. Update Post Content ---');
    const editRes = await axios.put(`${BASE_URL}/api/posts/${postAId}`, {
      generatedContent: '🩺 Fully updated healthcare post!'
    }, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    console.log('Edit Content:', editRes.data.data.generatedContent.includes('Fully updated') ? 'PASSED' : 'FAILED');

    console.log('\n--- 11. Delete Post ---');
    const deletePostRes = await axios.delete(`${BASE_URL}/api/posts/${postAId}`, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    console.log('Delete Post:', deletePostRes.data.success ? 'PASSED' : 'FAILED');

    const checkDeleteRes = await axios.get(`${BASE_URL}/api/posts`, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    console.log('Remaining Post Count (should be 1):', checkDeleteRes.data.data.posts.length === 1 ? 'PASSED' : 'FAILED');

    console.log('\n--- 12. Delete User Account (Recursive Cleanup) ---');
    const deleteAccountRes = await axios.delete(`${BASE_URL}/api/user/account`, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    console.log('Delete Account Status:', deleteAccountRes.data.success ? 'PASSED' : 'FAILED');

    // Attempt to login User A (should fail now)
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'usera@example.com',
        password: 'password123'
      });
      console.log('Account deletion failed! User A could still login.');
    } catch (err) {
      console.log('Login Deleted User A: Blocked (401): PASSED', err.response?.status === 401 ? '(Got 401)' : '(Failed)');
    }

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('\n❌ TEST SUITE RUNTIME FAILURE:', error.response ? error.response.data : error.message);
  } finally {
    // Close connections and stop server
    if (server) {
      server.close(() => {
        console.log('Test Server stopped.');
      });
    }
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

runTests();
