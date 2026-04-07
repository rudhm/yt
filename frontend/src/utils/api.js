import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds - handle Render cold starts and multiple API aggregations
});

// Add auth token to all requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const searchVideos = async (query, maxResults = 20, pageToken = null) => {
  try {
    const params = { q: query, maxResults };
    if (pageToken) {
      params.pageToken = pageToken;
    }
    
    const response = await api.get('/api/search', { params });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const searchLongVideos = async (query, maxResults = 20) => {
  try {
    const response = await api.get('/api/search/long', {
      params: { q: query, maxResults }
    });
    return response.data;
  } catch (error) {
    console.error('Long videos search error:', error);
    throw error;
  }
};

export const getSubscriptions = async () => {
  try {
    const response = await api.get('/api/subscriptions');
    return response.data;
  } catch (error) {
    console.error('Get subscriptions error:', error);
    throw error;
  }
};

export const getSubscriptionFeed = async (maxResults = 20, pageToken = null) => {
  try {
    const params = { maxResults };
    if (pageToken) {
      params.pageToken = pageToken;
    }
    
    const response = await api.get('/api/subscriptions/feed', { params });
    return response.data;
  } catch (error) {
    console.error('Get subscription feed error:', error);
    throw error;
  }
};

export default api;
