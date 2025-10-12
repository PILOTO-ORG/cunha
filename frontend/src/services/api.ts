import axios, { AxiosHeaders } from 'axios';

// Access API URL from environment
declare const process: { env: { REACT_APP_API_URL?: string } };

// Configuração base da API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors para tratamento de erros
api.interceptors.request.use(
  (config) => {
    // Adiciona o token JWT em todos os requests
    const token = localStorage.getItem('jwt') || localStorage.getItem('jwtToken');
    if (token) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento global de erros
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
