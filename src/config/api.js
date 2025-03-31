import axios from 'axios';

// Verificar se estamos em ambiente de produção para usar a URL correta
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://chamador-backend.onrender.com'  // URL do backend no Render
  : 'http://localhost:3005';  // URL local para desenvolvimento

console.log('API_URL:', API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Configuração básica do axios sem interferir com CORS
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = false;

// Interceptor para adicionar apenas o token
axios.interceptors.request.use(
  (config) => {
    console.log(`Fazendo requisição para: ${config.url}`);
    console.log(`Método: ${config.method.toUpperCase()}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
axios.interceptors.response.use(
  (response) => {
    console.log(`Resposta recebida de: ${response.config.url}`);
    console.log(`Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', error);
    return Promise.reject(error);
  }
);

export default API_URL; 