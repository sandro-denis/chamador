import axios from 'axios';

// Verificar se estamos em ambiente de produção
const isProduction = process.env.NODE_ENV === 'production';
console.log('NODE_ENV:', process.env.NODE_ENV);

// URL completa do backend (para referência e desenvolvimento)
const BACKEND_URL = 'https://chamador-backend.onrender.com';

// Em produção, usamos o proxy do Vercel (/api redireciona para o backend)
// Em desenvolvimento, usamos a URL completa
const API_URL = isProduction 
  ? '' // URL vazia para usar o proxy do Vercel 
  : BACKEND_URL;

console.log('API_URL:', API_URL);

// Configuração básica do axios
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = false;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor para adicionar token e logs
axios.interceptors.request.use(
  (config) => {
    console.log(`Fazendo requisição para: ${config.baseURL || ''}${config.url}`);
    console.log(`Método: ${config.method?.toUpperCase()}`);
    
    // Adicionar token de autenticação quando disponível
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
    if (error.response) {
      console.error(`Erro na resposta: Status ${error.response.status}`);
      console.error('Dados:', error.response.data);
    } else if (error.request) {
      console.error('Erro na requisição: Sem resposta do servidor');
    } else {
      console.error('Erro:', error.message);
    }
    return Promise.reject(error);
  }
);

export default API_URL;