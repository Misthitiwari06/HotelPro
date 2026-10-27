import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Automatically inject JWT token into request headers
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('hotelpro_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
