import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://chamador-backend.onrender.com'  // URL do backend no Render
  : 'http://localhost:3005';  // URL local para desenvolvimento

// Configuração global do axios
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = false; // Alterado para false para evitar problemas de CORS
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor para adicionar o token em todas as requisições
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API_URL; 