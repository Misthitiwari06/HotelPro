import axios from 'axios';

const API = axios.create({
  baseURL: 'https://dashboard.render.com/web/srv-dbh1p98m7kps73f1oe5g/api',
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

