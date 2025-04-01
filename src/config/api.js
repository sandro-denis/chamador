import axios from 'axios';

// Verificar se estamos em ambiente de produção
const isProduction = process.env.NODE_ENV === 'production';
console.log('Ambiente:', isProduction ? 'Produção' : 'Desenvolvimento');

// URL completa do backend (para referência e desenvolvimento)
const BACKEND_URL = 'https://chamador.onrender.com';

// Em produção, usamos o proxy do Vercel (/api redireciona para o backend)
// Em desenvolvimento, usamos a URL completa
const API_URL = isProduction 
  ? '' // URL vazia para usar o proxy do Vercel 
  : BACKEND_URL;

console.log('URL da API:', API_URL || 'Usando proxy do Vercel');

// Configuração básica do axios
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = false;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor para adicionar token e logs
axios.interceptors.request.use(
  (config) => {
    console.log(`[API] Requisição: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Adicionar token de autenticação quando disponível
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API] Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
axios.interceptors.response.use(
  (response) => {
    console.log(`[API] Resposta: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('[API] Erro na resposta:', {
        status: error.response.status,
        url: error.config.url,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('[API] Erro na requisição:', error.request);
    } else {
      console.error('[API] Erro:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axios; 