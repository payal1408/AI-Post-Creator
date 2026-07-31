const API_BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { success: false, message: 'Invalid response from server' };
    }

    if (!response.ok) {
      // If we get an unauthorized error (401), we should clear the token
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('unauthorized'));
      }
      throw new Error(data.message || data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth Endpoints
  register: (name, email, password, profileImage) =>
    request('/auth/register', {
      method: 'POST',
      body: { name, email, password, profileImage }
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: { email, password }
    }),

  getProfile: () =>
    request('/auth/profile', { method: 'GET' }),

  updateProfile: (profileData) =>
    request('/auth/profile', {
      method: 'PUT',
      body: profileData
    }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  // User Management Endpoints
  deleteAccount: () =>
    request('/user/account', { method: 'DELETE' }),

  // Post Endpoints
  generatePost: (topic, platform, tone) =>
    request('/posts/generate', {
      method: 'POST',
      body: { topic, platform, tone }
    }),

  getPosts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return request(`/posts${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },

  getPost: (id) =>
    request(`/posts/${id}`, { method: 'GET' }),

  updatePost: (id, generatedContent) =>
    request(`/posts/${id}`, {
      method: 'PUT',
      body: { generatedContent }
    }),

  deletePost: (id) =>
    request(`/posts/${id}`, { method: 'DELETE' }),

  toggleFavorite: (id) =>
    request(`/posts/${id}/favorite`, { method: 'PATCH' })
};
