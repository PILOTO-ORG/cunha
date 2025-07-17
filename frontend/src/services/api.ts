import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: (window as any).ENV?.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors para tratamento de erros
api.interceptors.request.use(
  (config) => {
    // Aqui você pode adicionar tokens de autenticação se necessário
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
      // Redirecionar para login se necessário
    }
    return Promise.reject(error);
  }
);

export default api;
