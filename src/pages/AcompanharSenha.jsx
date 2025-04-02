import React, { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useSenha } from '../context/SenhaContext'
import { buscarSenhaPorId } from '../config/auth'

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #f5f6fa 0%, #e9ecef 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #3498db, #2ecc71);
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 25px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #3498db, #2ecc71);
  }
`

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  color: #2c3e50;
  position: relative;
  padding-bottom: 10px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    border-radius: 3px;
  }
`

const SenhaCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
  width: 100%;
  margin-bottom: 15px;
  border: 2px solid ${props => {
    switch(props.$tipo) {
      case 'P': return '#e74c3c';
      case 'N': return '#3498db';
      case 'R': return '#2ecc71';
      default: return '#7f8c8d';
    }
  }};
  transition: all 0.3s ease;
  animation: ${props => props.style?.animation || 'none'};
`

const SenhaNumero = styled.div`
  font-size: 48px;
  font-weight: bold;
  margin: 15px 0;
  color: ${props => {
    switch(props.$tipo) {
      case 'P': return '#e74c3c';
      case 'N': return '#3498db';
      case 'R': return '#2ecc71';
      default: return '#7f8c8d';
    }
  }};
`

const SenhaTipo = styled.div`
  font-size: 18px;
  margin-bottom: 10px;
  color: #7f8c8d;
  font-weight: 500;
`

const SenhaInfo = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 10px;
`

const StatusContainer = styled.div`
  width: 100%;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 10px;
  transition: all 0.3s ease;
  animation: ${props => props.style?.animation || 'none'};
`

const StatusTitle = styled.h3`
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
`

const StatusInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
`

const StatusLabel = styled.span`
  color: #7f8c8d;
`

const StatusValue = styled.span`
  color: #2c3e50;
  font-weight: 500;
`

const SenhaAtualCard = styled.div`
  background-color: #f1f8ff;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  width: 100%;
  margin-top: 20px;
  border-left: 4px solid #3498db;
`

const SenhaAtualTitle = styled.div`
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 500;
`

const SenhaAtualNumero = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #3498db;
`

const SenhaAtualGuiche = styled.div`
  font-size: 16px;
  color: #2c3e50;
  margin-top: 10px;
  font-weight: 500;
`

const RefreshButton = styled.button`
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(52, 152, 219, 0.3);
  }
`

const StatusBadge = styled.div`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 10px;
  background-color: ${props => {
    switch(props.$status) {
      case 'aguardando': return '#f1c40f20';
      case 'chamada': return '#2ecc7120';
      case 'finalizada': return '#7f8c8d20';
      default: return '#7f8c8d20';
    }
  }};
  color: ${props => {
    switch(props.$status) {
      case 'aguardando': return '#f1c40f';
      case 'chamada': return '#2ecc71';
      case 'finalizada': return '#7f8c8d';
      default: return '#7f8c8d';
    }
  }};
  border: 1px solid ${props => {
    switch(props.$status) {
      case 'aguardando': return '#f1c40f';
      case 'chamada': return '#2ecc71';
      case 'finalizada': return '#7f8c8d';
      default: return '#7f8c8d';
    }
  }};
`

const AcompanharSenha = () => {
  const { id } = useParams();
  const location = useLocation();
  const { senhas, getSenhasPorStatus } = useSenha();
  const [minhaSenha, setMinhaSenha] = useState(null);
  const [senhaAtual, setSenhaAtual] = useState(null);
  const [tempoEspera, setTempoEspera] = useState(0);
  const [senhasNaFrente, setSenhasNaFrente] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const [erro, setErro] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());
  
  // Verifica se a página está sendo acessada via QR code
  // Consideramos que é acesso via QR code quando a URL contém /acompanhar/ e não há referrer
  // ou quando há um parâmetro específico na URL
  const isQrCodeAccess = location.pathname.includes('/acompanhar/');
  
  // Função para obter o status formatado
  const getStatusFormatado = (status) => {
    switch(status) {
      case 'aguardando': return 'Aguardando';
      case 'chamada': return 'Chamada';
      case 'finalizada': return 'Finalizada';
      default: return 'Desconhecido';
    }
  };
  
  // Função para obter a descrição do tipo de senha
  const getTipoDescricao = (tipo) => {
    switch(tipo) {
      case 'P': return 'Senha Prioritária';
      case 'N': return 'Senha Normal';
      case 'R': return 'Atendimento Rápido';
      default: return '';
    }
  };
  
  // Função para calcular o tempo estimado de espera
  const calcularTempoEspera = (minhaSenha, senhasAguardando) => {
    if (!minhaSenha || minhaSenha.status !== 'aguardando') return 0;
    
    // Conta quantas senhas estão na frente (considerando prioridades)
    let senhasNaFrente = 0;
    
    // Se for prioritária, apenas outras prioritárias geradas antes estão na frente
    if (minhaSenha.tipo === 'P') {
      senhasNaFrente = senhasAguardando.filter(s => 
        s.tipo === 'P' && 
        new Date(s.horarioGeracao) < new Date(minhaSenha.horarioGeracao)
      ).length;
    } 
    // Se for normal, todas as prioritárias e normais geradas antes estão na frente
    else if (minhaSenha.tipo === 'N') {
      senhasNaFrente = senhasAguardando.filter(s => 
        (s.tipo === 'P') || 
        (s.tipo === 'N' && new Date(s.horarioGeracao) < new Date(minhaSenha.horarioGeracao))
      ).length;
    }
    // Se for rápida, todas as prioritárias e rápidas geradas antes estão na frente
    else if (minhaSenha.tipo === 'R') {
      senhasNaFrente = senhasAguardando.filter(s => 
        (s.tipo === 'P') || 
        (s.tipo === 'R' && new Date(s.horarioGeracao) < new Date(minhaSenha.horarioGeracao))
      ).length;
    }
    
    // Atualiza o estado de senhas na frente
    setSenhasNaFrente(senhasNaFrente);
    
    // Calcula tempo estimado (média de 3 minutos por senha)
    return senhasNaFrente * 3;
  };
  
  // Efeito para buscar a senha e calcular tempo de espera
  useEffect(() => {
    const fetchSenhaInfo = async () => {
      if (!id) return;
      
      if (!isLoading) setIsRefreshing(true);
      console.log('Buscando senha com ID:', id, 'às', new Date().toLocaleTimeString());
      
      try {
        // Buscar sempre da API, não depender do contexto
        const senhaDaApi = await buscarSenhaPorId(id);
        console.log('Senha encontrada via API:', senhaDaApi);
        
        if (senhaDaApi) {
          setMinhaSenha(senhaDaApi);
          
          // Buscar senhas na frente diretamente da API 
          // Usar o estado anterior para cálculos quando os dados não mudarem
          let senhasAguardandoAtual = getSenhasPorStatus('aguardando');
          
          try {
            // Atualizar senhas na frente e tempo estimado com base nos dados atuais
            const tempoEstimado = calcularTempoEspera(senhaDaApi, senhasAguardandoAtual);
            setTempoEspera(tempoEstimado);
            
            // Buscar senha sendo chamada atualmente
            const senhasChamadas = getSenhasPorStatus('chamada');
            if (senhasChamadas && senhasChamadas.length > 0) {
              // Pega a senha chamada mais recentemente
              const senhaAtual = senhasChamadas.sort((a, b) => 
                new Date(b.horarioChamada || b.updatedAt) - new Date(a.horarioChamada || a.updatedAt)
              )[0];
              setSenhaAtual(senhaAtual);
            }
          } catch (err) {
            console.error('Erro ao calcular tempos:', err);
            // Não falhar a atualização principal se houver erro nos cálculos
          }
          
          // Atualizar timestamp apenas se houver mudança de estado
          if (JSON.stringify(minhaSenha) !== JSON.stringify(senhaDaApi)) {
            console.log('Estado da senha alterado, atualizando tela...');
            // Piscar indicador visual de atualização
            setIsRefreshing(true);
            setTimeout(() => setIsRefreshing(false), 500);
            
            // Atualizar timestamp
            setUltimaAtualizacao(new Date());
          } else {
            console.log('Sem alterações no estado da senha');
          }
          
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }
      } catch (error) {
        console.error('Erro ao buscar senha via API:', error);
        setErro(error.message || 'Erro ao buscar senha');
        
        // Tentar usar dados em cache como fallback
        if (!minhaSenha) {
          // Tenta buscar das senhas carregadas localmente como fallback
          console.log('Tentando buscar senha do cache local...');
          
          // Verificar no estado local como fallback
          if (senhas.length > 0) {
            // Encontra a senha pelo ID
            const senha = senhas.find(s => {
              const senhaId = String(s._id).trim();
              const qrId = String(id).trim();
              return senhaId === qrId || senhaId.replace(/["']/g, '') === qrId.replace(/["']/g, '');
            });
            
            if (senha) {
              console.log('Senha encontrada no cache local:', senha);
              setMinhaSenha(senha);
              setErro(null);
            }
          }
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };
    
    fetchSenhaInfo();
    
    // Recarrega periodicamente a cada 3 segundos para atualização em tempo real
    const interval = setInterval(fetchSenhaInfo, 3000);
    
    return () => clearInterval(interval);
  }, [id, getSenhasPorStatus]);
  
  // Função para atualizar manualmente os dados
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setErro(null);
      const senhaDaApi = await buscarSenhaPorId(id);
      console.log('Senha encontrada via API (refresh manual):', senhaDaApi);
      
      if (senhaDaApi) {
        setMinhaSenha(senhaDaApi);
        
        // Busca senhas aguardando para cálculos
        const senhasAguardando = getSenhasPorStatus('aguardando');
        
        // Calcula tempo estimado de espera
        const tempoEstimado = calcularTempoEspera(senhaDaApi, senhasAguardando);
        setTempoEspera(tempoEstimado);
        
        setUltimaAtualizacao(new Date());
      } else {
        setErro('Não foi possível encontrar a senha. Verifique se o código QR está correto.');
      }
    } catch (error) {
      console.error('Erro ao buscar senha (refresh manual):', error);
      setErro(error.message || 'Erro ao atualizar dados da senha');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Formatar a hora da última atualização
  const formatarUltimaAtualizacao = () => {
    return ultimaAtualizacao.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  if (!minhaSenha) {
    return (
      <PageContainer>
        <Container>
          <Title>Acompanhamento de Senha</Title>
          {isLoading ? (
            <>
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <div style={{ fontSize: '18px', marginBottom: '15px' }}>Carregando informações da senha...</div>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  border: '5px solid #f3f3f3', 
                  borderTop: '5px solid #3498db', 
                  borderRadius: '50%',
                  margin: '0 auto',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <div style={{ fontSize: '18px', color: '#e74c3c', marginBottom: '15px' }}>
                  {erro || 'Não foi possível encontrar a senha'}
                </div>
                <p>Verifique se o código QR está correto ou se a senha ainda está ativa no sistema.</p>
              </div>
              <RefreshButton onClick={handleRefresh}>
                🔄 Tentar Novamente
              </RefreshButton>
            </>
          )}
        </Container>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <Container>        
        <Title>Acompanhamento de Senha</Title>
        
        <SenhaCard $tipo={minhaSenha.tipo} style={{
          transition: 'all 0.3s ease',
          animation: isRefreshing ? 'pulse 1s' : 'none'
        }}>
          <SenhaTipo>
            {getTipoDescricao(minhaSenha.tipo)}
          </SenhaTipo>
          
          <SenhaNumero $tipo={minhaSenha.tipo}>
            {minhaSenha.numero}
          </SenhaNumero>
          
          <StatusBadge $status={minhaSenha.status}>
            {getStatusFormatado(minhaSenha.status)}
          </StatusBadge>
          
          <SenhaInfo>
            Gerada em: {new Date(minhaSenha.horarioGeracao).toLocaleString('pt-BR')}
          </SenhaInfo>
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.03); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); }
              100% { transform: scale(1); }
            }
          `}</style>
        </SenhaCard>
        
        <StatusContainer style={{
          transition: 'all 0.3s ease',
          animation: isRefreshing ? 'highlight 1s' : 'none'
        }}>
          <StatusTitle>Status do Atendimento</StatusTitle>
          
          <StatusInfo>
            <StatusLabel>Status:</StatusLabel>
            <StatusValue>{getStatusFormatado(minhaSenha.status)}</StatusValue>
          </StatusInfo>
          
          {minhaSenha.status === 'aguardando' && (
            <>
              <StatusInfo>
                <StatusLabel>Senhas na frente:</StatusLabel>
                <StatusValue>{senhasNaFrente}</StatusValue>
              </StatusInfo>
              
              <StatusInfo>
                <StatusLabel>Tempo estimado:</StatusLabel>
                <StatusValue>
                  {tempoEspera > 0 ? `Aproximadamente ${tempoEspera} minutos` : 'Menos de 3 minutos'}
                </StatusValue>
              </StatusInfo>
            </>
          )}
          
          {minhaSenha.status === 'chamada' && (
            <StatusInfo>
              <StatusLabel>Guichê:</StatusLabel>
              <StatusValue>{minhaSenha.guiche || 'Não informado'}</StatusValue>
            </StatusInfo>
          )}
          
          {minhaSenha.status === 'finalizada' && (
            <StatusInfo>
              <StatusLabel>Finalizada em:</StatusLabel>
              <StatusValue>
                {minhaSenha.horarioFinalizacao ? 
                  new Date(minhaSenha.horarioFinalizacao).toLocaleString('pt-BR') : 
                  'Não registrado'}
              </StatusValue>
            </StatusInfo>
          )}
          
          <StatusInfo>
            <StatusLabel>Última atualização:</StatusLabel>
            <StatusValue>
              {formatarUltimaAtualizacao()}
              {isRefreshing && <span style={{ marginLeft: '5px', color: '#3498db' }}>⟳</span>}
            </StatusValue>
          </StatusInfo>
          <style>{`
            @keyframes highlight {
              0% { background-color: #f8f9fa; }
              50% { background-color: #e3f2fd; }
              100% { background-color: #f8f9fa; }
            }
          `}</style>
        </StatusContainer>
        
        {senhaAtual && minhaSenha.status === 'aguardando' && (
          <SenhaAtualCard>
            <SenhaAtualTitle>Senha sendo chamada agora:</SenhaAtualTitle>
            <SenhaAtualNumero>{senhaAtual.numero}</SenhaAtualNumero>
            {senhaAtual.guiche && (
              <SenhaAtualGuiche>Guichê: {senhaAtual.guiche}</SenhaAtualGuiche>
            )}
          </SenhaAtualCard>
        )}
        
        <RefreshButton onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? '⟳ Atualizando...' : '🔄 Atualizar'}
        </RefreshButton>
        
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#7f8c8d', marginTop: '10px' }}>
          Atualização automática a cada 3 segundos
        </div>
      </Container>
    </PageContainer>
  );
};

export default AcompanharSenha;