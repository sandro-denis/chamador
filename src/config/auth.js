import axios from 'axios';

const API_URL = '/api';

// Função para obter o token JWT
const getToken = () => {
  return localStorage.getItem('token');
};

// Função para verificar se o usuário está autenticado
export const isAuthenticated = () => {
  return !!getToken();
};

// Função para obter o usuário atual
export const getCurrentUser = async () => {
  try {
    const token = getToken();
    if (!token) return null;

    const response = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
};

// Função para atualizar as configurações do usuário
export const updateUserConfig = async (config) => {
  try {
    const token = getToken();
    if (!token) throw new Error('Usuário não autenticado');

    const response = await axios.put(
      `${API_URL}/me/config`,
      { config },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    throw error;
  }
};

// Função para verificar conectividade com o servidor
export const verificarConectividade = async () => {
  try {
    await axios.get(`${API_URL}/check-connection`);
    return true;
  } catch (error) {
    console.warn('Erro ao verificar conectividade:', error);
    return false;
  }
};

// Função para fazer login
export const login = async (email, password) => {
  try {
    if (!email || !email.trim()) {
      throw new Error('Email é obrigatório');
    }
    
    if (!password || !password.trim()) {
      throw new Error('Senha é obrigatória');
    }
    
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    console.log('Enviando requisição de login:', {
      email: trimmedEmail,
      passwordLength: trimmedPassword.length
    });
    
    try {
      // Verificar conectividade com o servidor antes de tentar login
      await verificarConectividade();
      
      const response = await axios.post(`${API_URL}/login`, {
        email: trimmedEmail,
        password: trimmedPassword
      });
      
      console.log('Resposta do servidor recebida:', {
        status: response.status,
        statusText: response.statusText,
        hasToken: !!response.data?.token,
        hasUser: !!response.data?.user
      });
      
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        return { token, user };
      }
      
      throw new Error('Token não recebido do servidor');
    } catch (axiosError) {
      console.error('Erro detalhado na requisição:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data
      });
      throw axiosError;
    }
  } catch (error) {
    console.error('Erro no login:', error.response?.data || error);
    throw error;
  }
};

// Função para registrar um novo usuário
export const register = async (email, password, companyName) => {
  try {
    if (!email || !email.trim()) {
      throw new Error('Email é obrigatório');
    }
    
    if (!password || !password.trim()) {
      throw new Error('Senha é obrigatória');
    }
    
    if (!companyName || !companyName.trim()) {
      throw new Error('Nome da empresa é obrigatório');
    }
    
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedCompanyName = companyName.trim();

    console.log('Enviando requisição de registro:', {
      email: trimmedEmail,
      companyName: trimmedCompanyName,
      passwordLength: trimmedPassword.length
    });
    
    const response = await axios.post(`${API_URL}/register`, {
      email: trimmedEmail,
      password: trimmedPassword,
      companyName: trimmedCompanyName
    });
    
    const { token, user } = response.data;
    
    if (token) {
      localStorage.setItem('token', token);
      return { token, user };
    }
    
    throw new Error('Token não recebido do servidor');
  } catch (error) {
    console.error('Erro no registro:', error.response?.data || error);
    throw error;
  }
};

// Função para fazer logout
export const logout = async () => {
  try {
    const token = getToken();
    if (token) {
      await axios.post(`${API_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Erro no logout:', error);
    throw error;
  }
};

// Função para criar uma nova senha
export const criarSenha = async (tipo) => {
  try {
    const token = getToken();
    if (!token) throw new Error('Usuário não autenticado');

    const response = await axios.post(
      `${API_URL}/senhas`,
      { tipo },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Verificar se a resposta contém os dados esperados
    if (!response.data || typeof response.data !== 'object' || !response.data._id) {
      console.error('Resposta inválida da API:', response.data);
      throw new Error('Resposta inválida da API ao criar senha');
    }
    
    // Adicionar propriedade numero para compatibilidade com o código existente
    // Nota: O número formatado será definido no SenhaContext
    if (!response.data.numero && response.data._id) {
      response.data.numero = response.data._id;
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro ao criar senha:', error);
    throw error;
  }
};

// Função para buscar senhas aguardando
export const buscarSenhasAguardando = async (params = {}) => {
  try {
    const token = getToken();
    if (!token) throw new Error('Usuário não autenticado');

    // Configurar os parâmetros da solicitação
    const requestParams = {};
    
    // Se houver status nos parâmetros, adicioná-los à consulta
    if (params.status) {
      // Se status for um array, enviar como uma lista separada por vírgulas
      if (Array.isArray(params.status)) {
        requestParams.status = params.status.join(',');
      } else {
        requestParams.status = params.status;
      }
    }
    
    console.log('Enviando requisição com parâmetros:', requestParams);
    
    const response = await axios.get(`${API_URL}/senhas/aguardando`, {
      params: requestParams,
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar senhas aguardando:', error);
    throw error;
  }
};

// Função para atualizar o status de uma senha
export const atualizarStatusSenha = async (senhaId, status, guiche = null) => {
  try {
    const token = getToken();
    if (!token) throw new Error('Usuário não autenticado');

    const updates = {
      status,
      ...(guiche && { guiche }), // Inclui o guichê apenas se ele for fornecido
      ...(status === 'chamada' ? { horarioChamada: new Date().toISOString() } : {}),
      ...(status === 'finalizada' ? { horarioFinalizacao: new Date().toISOString() } : {})
    };

    const response = await axios.put(
      `${API_URL}/senhas/${senhaId}`,
      updates,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar status da senha:', error);
    throw error;
  }
};

// Função para buscar estatísticas
export const buscarEstatisticas = async (dataInicio, dataFim) => {
  try {
    const token = getToken();
    if (!token) throw new Error('Usuário não autenticado');

    const response = await axios.get(`${API_URL}/estatisticas`, {
      params: { dataInicio, dataFim },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw error;
  }
};