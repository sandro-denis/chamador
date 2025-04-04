import axios from './api';

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

    const response = await axios.get(`/api/me`, {
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
      `/api/me/config`,
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
    await axios.get(`/api/check-connection`);
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
      
      const response = await axios.post(`/api/login`, {
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
    
    const response = await axios.post(`/api/register`, {
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
      await axios.post(`/api/logout`, {}, {
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
export const criarSenha = async (tipo, userId = null) => {
  try {
    const token = getToken();
    if (!token) throw new Error('Usuário não autenticado');

    const response = await axios.post(
      `/api/senhas`,
      { 
        tipo,
        userId // Incluir o ID do usuário na requisição
      },
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
    
    // Incluir o userId nos parâmetros da consulta se disponível
    if (params.userId) {
      requestParams.userId = params.userId;
    }
    
    console.log('Enviando requisição com parâmetros:', requestParams);
    
    const response = await axios.get(`/api/senhas/aguardando`, {
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
export const atualizarStatusSenha = async (senhaId, status, guiche = null, userId = null) => {
  try {
    const token = getToken();
    if (!token) throw new Error('Usuário não autenticado');

    // Preparar os dados de atualização
    const updates = { status };
    
    // Incluir o guichê apenas se fornecido
    if (guiche !== null) {
      updates.guiche = guiche;
    }
    
    // Incluir timestamps baseados no status
    if (status === 'chamada') {
      updates.horarioChamada = new Date().toISOString();
    } else if (status === 'finalizada') {
      updates.horarioFinalizacao = new Date().toISOString();
    }
    
    // Incluir o userId se fornecido
    if (userId) {
      updates.userId = userId;
    }

    const response = await axios.put(
      `/api/senhas/${senhaId}`,
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

    const response = await axios.get(`/api/estatisticas`, {
      params: { dataInicio, dataFim },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw error;
  }
};

// Função para buscar uma senha específica pelo ID (para QR Code)
export const buscarSenhaPorId = async (senhaId) => {
  try {
    console.log('Buscando senha com ID:', senhaId);
    
    if (!senhaId) {
      throw new Error('ID da senha não fornecido');
    }
    
    // Usar endpoint público que não requer autenticação
    const response = await axios.get(`/api/senha-publica/${senhaId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar senha por ID:', error);
    // Propagar o erro com uma mensagem mais amigável
    if (error.response && error.response.status === 404) {
      throw new Error('Não foi possível encontrar a senha. Verifique se o código QR está correto.');
    } else {
      throw new Error('Erro ao buscar informações da senha: ' + (error.message || 'Erro desconhecido'));
    }
  }
};

// Função para buscar senhas aguardando - versão pública
export const buscarSenhasAguardandoPublico = async () => {
  try {
    console.log('Buscando senhas aguardando públicas');
    const response = await axios.get(`/api/senhas-publicas/aguardando`);
    console.log('Senhas aguardando recebidas:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar senhas aguardando:', error);
    return [];
  }
};

// Função para limpar dados localmente (sem depender do servidor)
export const limparDadosLocalmente = () => {
  try {
    console.log('Iniciando limpeza de dados local...');
    
    // Lista de chaves específicas para remover
    const keysToRemoveSpecific = [
      'senhas_sistema',
      'senhas_timestamp',
      'contadores',
      'senhasAguardando',
      'ultimasSenhasChamadas',
      'ultimaChamada',
      'estatisticas',
      'senhasEmAtendimento',
      'ultimoAtendimento',
      'painel_senhas',
      'totem_config',
      'senhasFinalizadas'
    ];
    
    // Remover as chaves específicas
    keysToRemoveSpecific.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`Removendo ${key}...`);
        localStorage.removeItem(key);
      }
    });
    
    // Procurar por outras chaves relacionadas
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('senha') || 
        key.includes('Senha') || 
        key.includes('estatistica') || 
        key.includes('Estatistica') || 
        key.includes('atendimento') || 
        key.includes('Atendimento') ||
        key.includes('contador') ||
        key.includes('Contador') ||
        key.includes('cache_') ||
        key.includes('Cache_') ||
        key.includes('data_') ||
        key.includes('fila_')
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Remover todas as chaves encontradas
    keysToRemove.forEach(key => {
      console.log(`Removendo ${key}...`);
      localStorage.removeItem(key);
    });
    
    // Limpar o sessionStorage também
    try {
      const sessionKeys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && !key.includes('token') && !key.includes('auth')) {
          sessionKeys.push(key);
        }
      }
      
      sessionKeys.forEach(key => {
        console.log(`Removendo do sessionStorage: ${key}...`);
        sessionStorage.removeItem(key);
      });
    } catch (sessionError) {
      console.warn('Erro ao limpar sessionStorage:', sessionError);
    }
    
    console.log('Limpeza de dados local concluída!');
    return {
      success: true,
      message: 'Dados locais limpos com sucesso!',
      keysRemoved: [...keysToRemoveSpecific, ...keysToRemove].length
    };
  } catch (error) {
    console.error('Erro ao limpar dados localmente:', error);
    return {
      success: false,
      message: 'Erro ao limpar dados localmente',
      error: error.message
    };
  }
};

// Função para limpar dados diretamente no servidor Render (bypass do proxy Vercel)
export const limparDadosNoServidorDireto = async () => {
  try {
    console.log('Tentando limpar dados diretamente no servidor Render...');
    
    const token = getToken();
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    // Log do token (parcial, para depuração)
    console.log('Token para autenticação:', token.substring(0, 15) + '...');
    
    // Usar diretamente o endpoint do Render em vez do proxy do Vercel
    const renderUrl = 'https://chamador.onrender.com/api/limpar-dados';
    console.log('URL do servidor Render:', renderUrl);
    
    // Verificar conectividade com o Render antes de prosseguir
    try {
      console.log('Verificando conectividade com o servidor Render...');
      const checkResponse = await fetch('https://chamador.onrender.com/api/check-connection', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        timeout: 5000
      });
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        console.log('Conectividade com Render OK:', checkData);
      } else {
        console.warn('Erro ao verificar conectividade com Render:', checkResponse.status);
      }
    } catch (connectError) {
      console.warn('Falha ao verificar conectividade com Render:', connectError.message);
      // Continuamos mesmo com erro de conectividade
    }
    
    // Criar uma instância independente do axios para esta chamada
    const axiosInstance = axios.create({
      baseURL: '',  // Sem base URL
      timeout: 20000,  // Aumentado para 20 segundos
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    // Tentar usar fetch em vez de axios (alternativa)
    try {
      console.log('Tentando método fetch alternativo...');
      const fetchResponse = await fetch(renderUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({}),
        credentials: 'omit'  // Não enviar cookies
      });
      
      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        console.log('Fetch alternativo bem-sucedido:', data);
        
        return {
          success: true,
          message: 'Dados limpos com sucesso no servidor Render (via fetch)',
          senhasRemovidas: data.senhasRemovidas,
          usuarioAtualizado: data.usuarioAtualizado,
          serverDirect: true,
          method: 'fetch'
        };
      } else {
        console.warn('Método fetch falhou:', fetchResponse.status);
        // Continuar com Axios se fetch falhar
      }
    } catch (fetchError) {
      console.warn('Erro no método fetch:', fetchError.message);
      // Continuar com Axios se fetch falhar
    }
    
    // Faz um preflight OPTIONS primeiro para verificar a acessibilidade
    try {
      console.log('Enviando requisição OPTIONS para verificar CORS...');
      await axiosInstance({
        method: 'OPTIONS',
        url: renderUrl,
        timeout: 5000
      });
      console.log('Preflight OPTIONS bem-sucedido');
    } catch (optionsError) {
      console.warn('Erro no preflight OPTIONS (pode ser normal):', optionsError.message);
      // Continuamos mesmo com erro no OPTIONS
    }
    
    // Agora fazemos a chamada POST real com o Axios
    console.log('Enviando requisição POST para limpar dados diretamente no Render...');
    
    // Montar objeto de dados explicitamente
    const postData = {
      timestamp: new Date().toISOString()
    };
    
    // Logando os cabeçalhos que serão enviados
    console.log('Cabeçalhos:', axiosInstance.defaults.headers);
    
    const response = await axiosInstance.post(renderUrl, postData);
    console.log('Resposta bruta da requisição:', response);
    console.log('Servidor Render respondeu:', response.data);
    
    return {
      success: true,
      message: 'Dados limpos com sucesso no servidor Render',
      senhasRemovidas: response.data.senhasRemovidas,
      usuarioAtualizado: response.data.usuarioAtualizado,
      serverDirect: true,
      method: 'axios'
    };
    
  } catch (error) {
    console.error('Erro ao limpar dados diretamente no servidor Render:', error);
    
    // Detalhamento do erro para diagnóstico
    let errorDetails = {
      message: error.message,
      code: error.code || 'desconhecido'
    };
    
    if (error.response) {
      // O servidor respondeu com um status fora da faixa 2xx
      errorDetails.status = error.response.status;
      errorDetails.statusText = error.response.statusText;
      errorDetails.data = error.response.data;
      errorDetails.headers = error.response.headers;
      
      console.error('Detalhes do erro de resposta:', errorDetails);
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      errorDetails.request = 'Sem resposta do servidor';
      errorDetails.timeout = error.timeout === true;
      
      console.error('Erro de requisição (sem resposta):', errorDetails);
    }
    
    return {
      success: false,
      message: 'Erro ao limpar dados no servidor Render',
      error: error.message,
      serverDirect: true,
      errorDetails: errorDetails,
      serverError: error.response?.data || null
    };
  }
};

// Função para limpar dados no servidor e localmente (função original)
export const limparDadosCompleto = async (forceOfflineOnly = false) => {
  try {
    if (forceOfflineOnly) {
      console.log('Limpeza offline forçada solicitada');
      const resultadoLocal = limparDadosLocalmente();
      return {
        ...resultadoLocal,
        serverCleaned: false,
        offlineMode: true
      };
    }
    
    const token = getToken();
    if (!token) {
      // Se não estiver autenticado, apenas limpa localmente
      console.log('Usuário não autenticado, limpando apenas dados locais');
      const resultadoLocal = limparDadosLocalmente();
      return {
        ...resultadoLocal,
        serverCleaned: false,
        notAuthenticated: true
      };
    }
    
    // Verificar conectividade antes de tentar a limpeza no servidor
    let conectado = false;
    try {
      const testeConexao = await verificarConectividade();
      conectado = testeConexao;
    } catch (conectividadeError) {
      console.warn('Erro ao verificar conectividade:', conectividadeError);
      conectado = false;
    }
    
    if (!conectado) {
      console.log('Sem conectividade com o servidor, limpando apenas dados locais');
      const resultadoLocal = limparDadosLocalmente();
      return {
        ...resultadoLocal,
        serverCleaned: false,
        connectivityIssue: true
      };
    }
    
    // Tentar limpar no servidor primeiro
    try {
      // Ao invés de tentar diretamente, primeiro fazemos uma solicitação OPTIONS
      // para verificar se o endpoint está acessível
      try {
        await axios({
          method: 'OPTIONS',
          url: '/api/limpar-dados',
          timeout: 5000
        });
      } catch (optionsError) {
        console.warn('Erro no preflight OPTIONS para limpar-dados:', optionsError);
        // Continuamos mesmo com erro no OPTIONS
      }
      
      // Agora tentamos o POST real
      const response = await axios.post(
        '/api/limpar-dados',
        {},
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 segundos de timeout
        }
      );
      
      console.log('Servidor respondeu:', response.data);
      
      // Agora limpar localmente
      const resultadoLocal = limparDadosLocalmente();
      
      return {
        ...resultadoLocal,
        serverCleaned: true,
        senhasRemovidas: response.data.senhasRemovidas,
        serverMessage: response.data.message
      };
      
    } catch (serverError) {
      console.error('Erro ao limpar dados no servidor:', serverError);
      
      // Mesmo com erro no servidor, tenta limpar localmente
      const resultadoLocal = limparDadosLocalmente();
      
      return {
        ...resultadoLocal,
        serverCleaned: false,
        serverError: serverError.message,
        serverErrorDetails: serverError.response?.data || null
      };
    }
  } catch (error) {
    console.error('Erro geral na limpeza de dados:', error);
    // Mesmo com erro geral, tenta limpar localmente como último recurso
    try {
      const resultadoLocal = limparDadosLocalmente();
      return {
        ...resultadoLocal,
        serverCleaned: false,
        generalError: error.message
      };
    } catch (localError) {
      return {
        success: false,
        message: 'Erro geral na limpeza de dados',
        error: error.message,
        serverCleaned: false,
        localError: localError.message
      };
    }
  }
};

// Função completa para limpar dados com tentativa direta no servidor Render
export const limparDadosCompletoV2 = async (forceOfflineOnly = false) => {
  try {
    if (forceOfflineOnly) {
      console.log('Limpeza offline forçada solicitada');
      const resultadoLocal = limparDadosLocalmente();
      return {
        ...resultadoLocal,
        serverCleaned: false,
        offlineMode: true
      };
    }
    
    // Primeiro, tentamos limpar localmente
    const resultadoLocal = limparDadosLocalmente();
    
    // Se o usuário não estiver autenticado, retornamos apenas o resultado local
    const token = getToken();
    if (!token) {
      console.log('Usuário não autenticado, limpando apenas dados locais');
      return {
        ...resultadoLocal,
        serverCleaned: false,
        notAuthenticated: true
      };
    }
    
    // Verificar conectividade com o servidor
    let conectado = false;
    try {
      const testeConexao = await verificarConectividade();
      conectado = testeConexao;
    } catch (conectividadeError) {
      console.warn('Erro ao verificar conectividade:', conectividadeError);
      conectado = false;
    }
    
    if (!conectado) {
      console.warn('Sem conectividade com o servidor, apenas dados locais foram limpos');
      return {
        ...resultadoLocal,
        serverCleaned: false,
        connectivityIssue: true
      };
    }
    
    // Tentar método 1: Usando o proxy do Vercel (pode falhar com erro 500)
    console.log('Tentando método 1: Limpar dados via proxy Vercel...');
    try {
      const resultadoVercel = await limparDadosCompleto(false);
      
      // Se conseguimos limpar via Vercel, retornamos o resultado
      if (resultadoVercel.serverCleaned) {
        console.log('Método 1 bem-sucedido: Dados limpos via proxy Vercel');
        return resultadoVercel;
      }
      
      // Se falhou no servidor, tentamos o método 2
      console.log('Método 1 falhou, tentando método 2...');
    } catch (vercelError) {
      console.warn('Erro no método 1 (Vercel proxy):', vercelError);
      // Continuamos para o método 2
    }
    
    // Método 2: Tentar diretamente no servidor Render
    console.log('Tentando método 2: Limpar dados diretamente no Render...');
    try {
      const resultadoRender = await limparDadosNoServidorDireto();
      
      // Combinamos os resultados local e do servidor
      return {
        ...resultadoLocal,
        serverCleaned: resultadoRender.success,
        senhasRemovidas: resultadoRender.senhasRemovidas,
        serverMessage: resultadoRender.message,
        serverDirect: true,
        method: 'direct'
      };
    } catch (renderError) {
      console.error('Método 2 falhou:', renderError);
      
      return {
        ...resultadoLocal,
        serverCleaned: false,
        serverError: renderError.message,
        bothMethodsFailed: true
      };
    }
  } catch (error) {
    console.error('Erro geral na limpeza de dados V2:', error);
    
    // Garantir que pelo menos os dados locais foram limpos
    try {
      const resultadoLocal = limparDadosLocalmente();
      return {
        ...resultadoLocal,
        serverCleaned: false,
        generalError: error.message
      };
    } catch (localError) {
      return {
        success: false,
        message: 'Erro crítico na limpeza de dados',
        error: error.message,
        localError: localError.message,
        serverCleaned: false
      };
    }
  }
};

// Função para limpar dados por API alternativa (solução de emergência)
export const limparDadosEmergencia = async () => {
  try {
    console.log('Iniciando limpeza de emergência...');
    
    const token = getToken();
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    // Decodificar o token para obter o userId
    let userId = null;
    try {
      // Formato esperado: header.payload.signature
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        // Decodificar a parte payload (índice 1)
        const payload = JSON.parse(atob(tokenParts[1]));
        userId = payload.userId;
        console.log('userId extraído do token:', userId);
      }
    } catch (decodeError) {
      console.error('Erro ao decodificar token:', decodeError);
      // Continuamos mesmo com erro de decodificação
    }
    
    if (!userId) {
      // Se não conseguir extrair userId do token, tenta obter do localStorage
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        try {
          const userObj = JSON.parse(userInfo);
          userId = userObj._id || userObj.id;
          console.log('userId obtido do localStorage:', userId);
        } catch (parseError) {
          console.error('Erro ao analisar usuário do localStorage:', parseError);
        }
      }
    }
    
    if (!userId) {
      throw new Error('Não foi possível identificar o ID do usuário');
    }
    
    // URL da nossa API de limpeza de emergência - atualizada para nova API
    const emergencyApiUrl = 'https://eodxvvwqnwxbxzm.m.pipedream.net';
    
    // Dados para enviar
    const postData = {
      userId: userId,
      token: token,
      action: 'cleanUserData',
      timestamp: new Date().toISOString(),
      source: 'emergency_button'
    };
    
    console.log('Enviando solicitação para API de emergência...');
    
    // Usando fetch para fazer a requisição
    const response = await fetch(emergencyApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
      throw new Error(`Erro na API de emergência: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Resposta da API de emergência:', result);
    
    // Limpeza local para garantir
    const resultadoLocal = limparDadosLocalmente();
    
    return {
      success: true,
      message: 'Dados limpos pelo método de emergência',
      apiResponse: result,
      localCleaned: resultadoLocal.success,
      keysRemoved: resultadoLocal.keysRemoved,
      emergencyMode: true
    };
  } catch (error) {
    console.error('Erro na limpeza de emergência:', error);
    
    // Garantir que pelo menos os dados locais foram limpos
    try {
      const resultadoLocal = limparDadosLocalmente();
      return {
        success: false,
        message: 'Falha na limpeza remota, mas dados locais foram limpos',
        error: error.message,
        localCleaned: resultadoLocal.success,
        keysRemoved: resultadoLocal.keysRemoved,
        emergencyMode: true
      };
    } catch (localError) {
      return {
        success: false,
        message: 'Falha total na limpeza de emergência',
        error: error.message,
        localError: localError.message,
        emergencyMode: true
      };
    }
  }
};

// Função para limpar dados diretamente no servidor (usando rota simplificada)
export const limparDadosDiretoNoServidor = async () => {
  try {
    console.log('Tentando limpar dados usando a rota direta no servidor...');
    
    const token = getToken();
    if (!token) {
      throw new Error('Usuário não autenticado');
    }
    
    // Log do token (parcial, para depuração)
    console.log('Token para autenticação:', token.substring(0, 10) + '...');
    
    // Conectar diretamente à API sem proxy
    const urlBase = process.env.NODE_ENV === 'production' 
      ? 'https://chamador.onrender.com' 
      : 'http://localhost:3005';
    
    const apiUrl = `${urlBase}/api/limpar-dados-direto`;
    console.log('Conectando ao endpoint direto:', apiUrl);
    
    // Fazer a requisição
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na resposta: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Resposta da limpeza direta:', data);
    
    return {
      success: true,
      message: 'Dados limpos com sucesso usando rota direta',
      senhasRemovidas: data.senhasRemovidas || 0,
      rotaDireta: true
    };
    
  } catch (error) {
    console.error('Erro ao limpar dados com rota direta:', error);
    return {
      success: false,
      message: 'Erro ao limpar dados com rota direta',
      error: error.message,
      rotaDireta: true
    };
  }
};

// Função mais robusta para limpar dados combinando todas as abordagens
export const limparDadosUltimaChance = async () => {
  try {
    console.log('Iniciando limpeza de última chance com todas as abordagens...');
    
    // Limpar dados localmente primeiro
    const resultadoLocal = limparDadosLocalmente();
    console.log('Resultado da limpeza local:', resultadoLocal);
    
    // Tentar abordagem 1: direto no servidor principal
    try {
      console.log('Tentando abordagem 1: limpar diretamente no servidor...');
      const resultadoDireto = await limparDadosDiretoNoServidor();
      
      if (resultadoDireto.success) {
        console.log('Abordagem 1 bem-sucedida!');
        return {
          ...resultadoLocal,
          serverCleaned: true,
          abordagem: 'direta',
          senhasRemovidas: resultadoDireto.senhasRemovidas
        };
      }
    } catch (erro1) {
      console.error('Falha na abordagem 1:', erro1);
    }
    
    // Tentar abordagem 2: servidor Render direto
    try {
      console.log('Tentando abordagem 2: limpar via conexão direta Render...');
      const resultadoRender = await limparDadosNoServidorDireto();
      
      if (resultadoRender.success) {
        console.log('Abordagem 2 bem-sucedida!');
        return {
          ...resultadoLocal,
          serverCleaned: true,
          abordagem: 'render',
          senhasRemovidas: resultadoRender.senhasRemovidas
        };
      }
    } catch (erro2) {
      console.error('Falha na abordagem 2:', erro2);
    }
    
    // Tentar abordagem 3: API emergencial
    try {
      console.log('Tentando abordagem 3: limpar via API de emergência...');
      const resultadoEmergencia = await limparDadosEmergencia();
      
      if (resultadoEmergencia.success) {
        console.log('Abordagem 3 bem-sucedida!');
        return {
          ...resultadoLocal,
          serverCleaned: true,
          abordagem: 'emergencia',
          senhasRemovidas: resultadoEmergencia.apiResponse?.senhasRemovidas || 0
        };
      }
    } catch (erro3) {
      console.error('Falha na abordagem 3:', erro3);
    }
    
    // Se todas as abordagens falharem, retornar apenas os dados locais limpos
    return {
      ...resultadoLocal,
      serverCleaned: false,
      todasAbordagensFalharam: true
    };
    
  } catch (error) {
    console.error('Erro na limpeza de última chance:', error);
    
    // Garantir pelo menos a limpeza local
    const resultadoLocal = limparDadosLocalmente();
    
    return {
      ...resultadoLocal,
      serverCleaned: false,
      erroGeral: error.message
    };
  }
};