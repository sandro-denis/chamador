import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { verificarConectividade } from '../config/auth'
import { criarSenha, buscarSenhasAguardando, atualizarStatusSenha } from '../config/auth'

const SenhaContext = createContext()

export const TIPOS_SENHA = {
  PRIORITARIA: 'P',
  NORMAL: 'N',
  RAPIDO: 'R'
}

export const SenhaProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const [senhas, setSenhas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [ultimaSenhaGerada, setUltimaSenhaGerada] = useState(null)
  const [contadores, setContadores] = useState(() => {
    const savedContadores = localStorage.getItem('contadores')
    return savedContadores ? JSON.parse(savedContadores) : {
      [TIPOS_SENHA.PRIORITARIA]: 0,
      [TIPOS_SENHA.NORMAL]: 0,
      [TIPOS_SENHA.RAPIDO]: 0
    }
  })

  // Verificar conectividade periodicamente
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await verificarConectividade()
        setIsConnected(connected)
      } catch (error) {
        console.error('Erro ao verificar conectividade:', error)
        setIsConnected(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Verificar a cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  // Carregar senhas do localStorage ao inicializar
  useEffect(() => {
    // Tentar recuperar senhas do localStorage ao iniciar
    try {
      // Usar o ID do usuário como chave para o localStorage para separar as senhas por usuário
      const userId = user?._id || 'guest'
      const senhasSalvas = localStorage.getItem(`senhas_sistema_${userId}`)
      if (senhasSalvas) {
        const parsedSenhas = JSON.parse(senhasSalvas)
        setSenhas(parsedSenhas)
        console.log('Senhas carregadas do localStorage para usuário:', userId, parsedSenhas.length)
      }
    } catch (error) {
      console.error('Erro ao carregar senhas do localStorage:', error)
    }
  }, [user])

  // Buscar senhas aguardando periodicamente
  useEffect(() => {
    if (!isAuthenticated && !window.location.pathname.includes('publico')) return;

    const fetchSenhas = async () => {
      try {
        setLoading(true);
        
        // Obter ID do usuário com fallback para 'guest'
        const currentUserId = user && user._id ? user._id : 'guest';
        console.log('Buscando senhas aguardando e chamadas para usuário:', currentUserId);
        
        // Criar parâmetros para a requisição - buscar aguardando, chamadas e finalizadas
        const params = { 
          status: ['aguardando', 'chamada', 'finalizada']
        };
        
        // Adicionar userId apenas se estiver autenticado
        if (isAuthenticated && currentUserId !== 'guest') {
          params.userId = currentUserId;
        }
        
        console.log('Enviando requisição com parâmetros:', params);
        
        // Buscar senhas atualizadas do servidor
        const data = await buscarSenhasAguardando(params);
        console.log('Senhas recebidas do servidor:', Array.isArray(data) ? data.length : 'Resposta inválida');
        
        if (Array.isArray(data)) {
          // Atualizar senhas no estado
          setSenhas(prev => {
            // Filtrar senhas por status para garantir que não haja perda de informações
            const senhasAguardando = data.filter(s => s.status === 'aguardando');
            const senhasChamadas = data.filter(s => s.status === 'chamada');
            const senhasFinalizadasNovas = data.filter(s => s.status === 'finalizada');
            
            // Manter senhas finalizadas que já estão no estado e não estão nos dados recebidos
            const senhasFinalizadasExistentes = prev.filter(s => 
              s.status === 'finalizada' && 
              !senhasFinalizadasNovas.some(nova => nova._id === s._id)
            );
            
            // Combinar todas as senhas
            const combinedSenhas = [
              ...senhasAguardando, 
              ...senhasChamadas, 
              ...senhasFinalizadasNovas, 
              ...senhasFinalizadasExistentes
            ];
            
            // Remover duplicatas (manter a versão mais recente)
            const uniqueSenhas = combinedSenhas.reduce((acc, current) => {
              const x = acc.find(item => item._id === current._id);
              if (!x) {
                return acc.concat([current]);
              } else {
                // Se a senha já existe, manter a versão mais recente
                // Prioridade: finalizada > chamada > aguardando
                if (
                  (current.status === 'finalizada') || 
                  (current.status === 'chamada' && x.status !== 'finalizada')
                ) {
                  return acc.map(item => item._id === current._id ? current : item);
                }
                return acc;
              }
            }, []);
            
            // Armazenar todas as senhas no localStorage com o ID do usuário
            localStorage.setItem(`senhas_sistema_${currentUserId}`, JSON.stringify(uniqueSenhas));
            
            // Armazenar timestamp para detecção de mudanças
            localStorage.setItem(`senhas_timestamp_${currentUserId}`, Date.now().toString());
            
            return uniqueSenhas;
          });
        }
      } catch (error) {
        console.error('Erro ao buscar senhas:', error);
        setError(error.message);
        // Em caso de erro, tentar usar dados do localStorage
        const currentUserId = user && user._id ? user._id : 'guest';
        const senhasSalvas = localStorage.getItem(`senhas_sistema_${currentUserId}`);
        if (senhasSalvas) {
          try {
            const parsedSenhas = JSON.parse(senhasSalvas);
            setSenhas(parsedSenhas);
          } catch (parseError) {
            console.error('Erro ao carregar senhas do localStorage:', parseError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSenhas();
    const interval = setInterval(fetchSenhas, 3000); // Atualizar a cada 3 segundos

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const gerarSenha = async (tipo) => {
    try {
      setLoading(true)
      console.log('Gerando senha do tipo:', tipo)
      
      // Verificar se tipo está definido
      if (!tipo) {
        throw new Error('Tipo de senha não definido');
      }
      
      // Log para debug
      console.log('Usuário atual:', user ? `${user._id} (${user.email})` : 'Não autenticado/Indefinido');
      
      // Criar uma cópia das propriedades do usuário que precisamos
      const userId = user && user._id ? user._id : null;
      
      // Passar o ID do usuário atual para a função criarSenha
      console.log('Chamando criarSenha com:', { tipo, userId });
      const novaSenha = await criarSenha(tipo, userId);
      
      console.log('Resposta da API:', novaSenha);
      
      if (!novaSenha || typeof novaSenha !== 'object') {
        console.error('Resposta inválida da API:', novaSenha);
        throw new Error('Resposta inválida ao gerar senha');
      }
      
      // Formatação do número da senha
      let senhaFormatada = { ...novaSenha };
      
      // Garantir que a senha tenha número formatado
      if (!senhaFormatada.numero && senhaFormatada.tipo) {
        const tipoSenha = senhaFormatada.tipo;
        const numeroInt = parseInt(String(senhaFormatada._id).slice(-2), 10) || 0;
        senhaFormatada.numero = `${tipoSenha}${String(numeroInt).padStart(2, '0')}`;
        console.log('Número formatado criado:', senhaFormatada.numero);
      }
      
      // Garantir horarioGeracao
      if (!senhaFormatada.horarioGeracao) {
        senhaFormatada.horarioGeracao = senhaFormatada.createdAt || new Date().toISOString();
      }
      
      // Adicionar a nova senha à lista - usando o operador spread para criar uma cópia
      console.log('Adicionando senha formatada ao estado:', senhaFormatada);
      
      setSenhas(prevSenhas => {
        const novaLista = [...prevSenhas, senhaFormatada];
        console.log('Nova lista de senhas:', novaLista.length);
        return novaLista;
      });
      
      // Criar uma cópia limpa para evitar referências circulares
      const senhaParaRetornar = { ...senhaFormatada };
      console.log('Senha a ser retornada:', senhaParaRetornar);
      
      // Atualizar a última senha gerada
      setUltimaSenhaGerada(senhaParaRetornar);
      
      return senhaParaRetornar;
    } catch (error) {
      console.error('Erro detalhado ao gerar senha:', error);
      setError(error.message || 'Erro desconhecido ao gerar senha');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const chamarSenha = async (senhaId, guiche) => {
    try {
      setLoading(true)
      const senhaAtualizada = await atualizarStatusSenha(senhaId, 'chamada', guiche)
      
      // Garantir que o número da senha esteja no formato correto (N09 em vez de N9a)
      if (senhaAtualizada.numero) {
        // Extrair o tipo (primeira letra) e o número (resto)
        const tipo = senhaAtualizada.numero.charAt(0)
        const numeroSemTipo = senhaAtualizada.numero.substring(1)
        // Converter para número e remover qualquer caractere não numérico
        const numeroInt = parseInt(numeroSemTipo.replace(/[^0-9]/g, ''), 10)
        if (!isNaN(numeroInt)) {
          // Formatar com o tipo e o número
          // Preservar o número original se for maior que 9 para evitar problemas de formatação
          if (numeroInt < 10) {
            senhaAtualizada.numero = `${tipo}${String(numeroInt).padStart(2, '0')}`
          } else {
            senhaAtualizada.numero = `${tipo}${numeroInt}`
          }
        }
      } else if (senhaAtualizada.tipo) {
        // Se não tiver número mas tiver tipo, criar um número baseado no ID
        const tipo = senhaAtualizada.tipo
        const numeroInt = parseInt(String(senhaAtualizada._id).slice(-2), 10) || 0
        senhaAtualizada.numero = `${tipo}${String(numeroInt).padStart(2, '0')}`
      }
      
      // Verificar se o número está no formato correto após a atualização
      if (senhaAtualizada.numero) {
        const tipo = senhaAtualizada.numero.charAt(0)
        let numeroStr = senhaAtualizada.numero.substring(1)
        // Garantir que o número tenha apenas dígitos
        numeroStr = numeroStr.replace(/[^0-9]/g, '')
        // Verificar se o número é válido antes de converter
        if (numeroStr && numeroStr.length > 0) {
          // Formatar com o tipo e o número
          // Preservar o número original se for maior que 9 para evitar problemas de formatação
          const numeroInt = parseInt(numeroStr, 10);
          if (numeroInt < 10) {
            senhaAtualizada.numero = `${tipo}${String(numeroInt).padStart(2, '0')}`;
          } else {
            senhaAtualizada.numero = `${tipo}${numeroInt}`;
          }
        } else {
          // Se o número não for válido, manter o número original
          console.error('Número de senha inválido:', senhaAtualizada.numero)
          // Tentar recuperar o número original da senha
          const senhaOriginal = senhas.find(s => s._id === senhaId)
          if (senhaOriginal && senhaOriginal.numero) {
            senhaAtualizada.numero = senhaOriginal.numero
          }
        }
      }
      
      // Adicionar o guichê à senha atualizada
      if (guiche) {
        senhaAtualizada.guiche = guiche
      }
      
      // Adicionar horário de chamada para cálculo de tempo de atendimento
      senhaAtualizada.horarioChamada = new Date().toISOString()
      
      // Atualizar o estado e o localStorage
      setSenhas(prev => {
        const updatedSenhas = prev.map(s => s._id === senhaId ? senhaAtualizada : s)
        
        // Separar senhas por status para armazenamento correto
        const senhasAguardando = updatedSenhas.filter(s => s.status === 'aguardando')
        
        // Preservar todas as senhas no sistema, incluindo chamadas e finalizadas
        let todasSenhas = [...updatedSenhas]
        
        // Recuperar senhas antigas do localStorage para não perder o histórico
        try {
          const senhasSistemaAntigas = localStorage.getItem(`senhas_sistema_${user?._id || 'guest'}`)
          if (senhasSistemaAntigas) {
            const senhasAntigas = JSON.parse(senhasSistemaAntigas)
            // Adicionar senhas antigas que não estão na lista atual
            senhasAntigas.forEach(senhaAntiga => {
              if (!todasSenhas.some(s => s._id === senhaAntiga._id)) {
                todasSenhas.push(senhaAntiga)
              } else {
                // Atualizar senha existente se necessário
                const index = todasSenhas.findIndex(s => s._id === senhaAntiga._id)
                if (index >= 0 && todasSenhas[index].status !== 'finalizada') {
                  if (senhaAntiga.status === 'finalizada') {
                    todasSenhas[index] = senhaAntiga
                  }
                }
              }
            })
          }
        } catch (error) {
          console.error('Erro ao recuperar senhas antigas:', error)
        }
        
        // Armazenar separadamente as senhas aguardando e todas as senhas
        localStorage.setItem(`senhasAguardando_${user?._id || 'guest'}`, JSON.stringify(senhasAguardando))
        localStorage.setItem(`senhas_sistema_${user?._id || 'guest'}`, JSON.stringify(todasSenhas))
        
        return updatedSenhas
      })
      return senhaAtualizada
    } catch (error) {
      console.error('Erro ao chamar senha:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const finalizarSenha = async (senhaId) => {
    try {
      setLoading(true)
      const senhaAtualizada = await atualizarStatusSenha(senhaId, 'finalizada')
      
      // Atualizar o estado com a senha finalizada
      setSenhas(prev => prev.map(s => s._id === senhaId ? {
        ...s,
        ...senhaAtualizada,
        status: 'finalizada',
        horarioFinalizacao: senhaAtualizada.horarioFinalizacao || new Date().toISOString()
      } : s))
      
      // Atualizar o localStorage
      const senhasSalvas = JSON.parse(localStorage.getItem(`senhas_sistema_${user?._id || 'guest'}`) || '[]')
      const senhasAtualizadas = senhasSalvas.map(s => s._id === senhaId ? {
        ...s,
        ...senhaAtualizada,
        status: 'finalizada',
        horarioFinalizacao: senhaAtualizada.horarioFinalizacao || new Date().toISOString()
      } : s)
      localStorage.setItem(`senhas_sistema_${user?._id || 'guest'}`, JSON.stringify(senhasAtualizadas))
      localStorage.setItem(`senhas_timestamp_${user?._id || 'guest'}`, Date.now().toString())
      
      return senhaAtualizada
    } catch (error) {
      console.error('Erro ao finalizar senha:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Função para obter senhas por status (pode receber string ou array de status)
  const getSenhasPorStatus = (status) => {
    // Se status for string, converter para array
    const statusArray = Array.isArray(status) ? status : [status];
    
    // Obter o ID do usuário atual
    const currentUserId = user?._id || 'guest';
    
    // Filtrar senhas pelo status informado E pelo usuário atual
    return senhas.filter(senha => {
      // Verificar se a senha pertence ao usuário atual
      const senhaUserId = senha.userId || 'guest';
      return statusArray.includes(senha.status) && senhaUserId === currentUserId;
    });
  }

  // Função para chamar a próxima senha
  const chamarProximaSenha = async (guiche, tipoPrioridade = null) => {
    // Filtra senhas aguardando
    const senhasAguardando = getSenhasPorStatus('aguardando')
    
    if (senhasAguardando.length === 0) return null
    
    let senhaParaChamar
    
    if (tipoPrioridade) {
        // Se foi especificado um tipo de prioridade, busca a senha mais antiga desse tipo
        const senhasDesseTipo = senhasAguardando.filter(senha => senha.tipo === tipoPrioridade)
        senhaParaChamar = senhasDesseTipo.length > 0 
            ? senhasDesseTipo.sort((a, b) => new Date(a.horarioGeracao) - new Date(b.horarioGeracao))[0]
            : null
    }
    
    if (!senhaParaChamar) {
        // Se não encontrou senha do tipo especificado ou não foi especificado tipo,
        // chama a próxima senha prioritária, se houver
        const senhasPrioritarias = senhasAguardando.filter(senha => senha.tipo === TIPOS_SENHA.PRIORITARIA)
        
        if (senhasPrioritarias.length > 0) {
            senhaParaChamar = senhasPrioritarias.sort((a, b) => new Date(a.horarioGeracao) - new Date(b.horarioGeracao))[0]
        } else {
            // Se não houver prioritárias, chama a senha mais antiga
            senhaParaChamar = senhasAguardando.sort((a, b) => new Date(a.horarioGeracao) - new Date(b.horarioGeracao))[0]
        }
    }
    
    if (senhaParaChamar) {
        try {
            // Atualiza a senha com o guichê e aguarda a atualização
            const senhaAtualizada = await chamarSenha(senhaParaChamar._id, guiche)
            return senhaAtualizada // Retorna a senha já com o guichê atualizado
        } catch (error) {
            console.error('Erro ao chamar próxima senha:', error)
            return null
        }
    }
    
    return null
  }

  // Função para finalizar o atendimento
  const finalizarAtendimento = (senhaId) => {
    return finalizarSenha(senhaId)
  }

  return (
    <SenhaContext.Provider
      value={{
        senhas,
        loading,
        error,
        isConnected,
        ultimaSenhaGerada,
        gerarSenha,
        chamarSenha,
        finalizarSenha,
        getSenhasPorStatus,
        chamarProximaSenha,
        finalizarAtendimento,
        TIPOS_SENHA
      }}
    >
      {children}
    </SenhaContext.Provider>
  )
}

export const useSenha = () => {
  const context = useContext(SenhaContext)
  if (!context) {
    throw new Error('useSenha deve ser usado dentro de um SenhaProvider')
  }
  return context
}