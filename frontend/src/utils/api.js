import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const searchVideos = async (query, maxResults = 20) => {
  try {
    const response = await api.get('/api/search', {
      params: { q: query, maxResults }
    });
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

export default api;
