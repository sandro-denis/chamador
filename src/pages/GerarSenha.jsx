import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useSenha } from '../context/SenhaContext'
import { useAuth } from '../context/AuthContext'

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  padding: 0;
  background: ${props => props.ispublico ? 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' : 'linear-gradient(135deg, #f5f6fa 0%, #e9ecef 100%)'};
  display: flex;
  justify-content: center;
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
  gap: 30px;
  width: 100%;
  height: 100%;
  margin: 0;
  background-color: white;
  border-radius: ${props => props.ispublico ? '0' : '12px'};
  box-shadow: ${props => props.ispublico ? 'none' : '0 8px 24px rgba(0, 0, 0, 0.15)'};
  padding: ${props => props.ispublico ? '20px' : '35px'};
  position: relative;
  overflow: hidden;
  
  ${props => !props.ispublico && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, #3498db, #2ecc71);
    }
  `}
`

const Title = styled.h2`
  font-size: 28px;
  margin-bottom: 25px;
  text-align: center;
  color: #2c3e50;
  position: relative;
  padding-bottom: 15px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    border-radius: 3px;
  }
`

const ButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  width: 100%;
`

const SenhaButton = styled.button`
  background: linear-gradient(135deg, ${props => props.color} 0%, ${props => {
    const color = props.color;
    return color === '#e74c3c' ? '#c0392b' : 
           color === '#3498db' ? '#2980b9' : 
           color === '#2ecc71' ? '#27ae60' : '#7f8c8d';
  }} 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 30px 20px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 220px;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(-3px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  }
`

const ButtonIcon = styled.div`
  font-size: 40px;
  margin-bottom: 10px;
`

const SenhaGeradaContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 35px;
  text-align: center;
  width: 100%;
  max-width: 400px;
  margin-top: 25px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
  }
  
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

const SenhaNumero = styled.div`
  font-size: 64px;
  font-weight: bold;
  margin: 20px 0;
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
  font-size: 20px;
  margin-bottom: 15px;
  color: #7f8c8d;
`

const SenhaInfo = styled.div`
  font-size: 16px;
  color: #7f8c8d;
  margin-top: 15px;
`

const PrintButton = styled.button`
  background: linear-gradient(135deg, #7f8c8d 0%, #6d7b7c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 18px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(127, 140, 141, 0.3);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(127, 140, 141, 0.4);
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(127, 140, 141, 0.3);
  }
`

const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const DialogContent = styled.div`
  background-color: white;
  padding: 35px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  text-align: center;
  max-width: 400px;
  width: 90%;
  position: relative;
  overflow: hidden;
  animation: dialogAppear 0.3s ease;
  
  @keyframes dialogAppear {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #3498db, #2ecc71, #e74c3c);
  }
`

const DialogTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 20px;
  color: #2c3e50;
`

const DialogButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
`

const DialogButton = styled.button`
  padding: 12px 22px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &.confirm {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
    box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
    }
    
    &:active {
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(52, 152, 219, 0.3);
    }
  }
  
  &.cancel {
    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    color: white;
    box-shadow: 0 4px 10px rgba(149, 165, 166, 0.3);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 15px rgba(149, 165, 166, 0.4);
    }
    
    &:active {
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(149, 165, 166, 0.3);
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: 0.5s;
  }
  
  &:hover::after {
    left: 100%;
  }
`

const GerarSenha = () => {
  const { TIPOS_SENHA, gerarSenha, ultimaSenhaGerada, setUltimaSenhaGerada } = useSenha()
  const { user } = useAuth()
  const isPublico = window.location.pathname === '/gerar-senha-publico'
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedTipo, setSelectedTipo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Carrega configurações salvas
  const [config, setConfig] = useState({
    theme: 'light',
    backgroundColor: '#f8f9fa',
    textColor: '#2c3e50',
    senhaColor: '#3498db',
    fontFamily: 'Arial',
    fontSize: 120,
    logo: null,
    backgroundType: 'color',
    backgroundImage: null,
    footerText: '',
    volume: 80,
    soundEffect: 'beep',
    repeatInterval: 1
  })
  
  // Carrega configurações salvas
  useEffect(() => {
    const savedConfig = localStorage.getItem('painelConfig')
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
    
    // Adiciona listener para mudanças no localStorage de outras abas
    const handleStorageChange = (e) => {
      if (e.key === 'painelConfig') {
        setConfig(JSON.parse(e.newValue))
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  
  const handleGerarSenha = (tipo) => {
    setSelectedTipo(tipo)
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    try {
      setIsLoading(true) // Indica que está carregando
      
      // Verifica se o usuário está autenticado
      if (!user) {
        console.error('Usuário não autenticado')
        alert('Você não tem permissão para gerar senhas. Faça login novamente.')
        return
      }
      
      // Verifica se o tipo de senha foi selecionado
      if (!selectedTipo) {
        console.error('Tipo de senha não selecionado')
        alert('Por favor, selecione um tipo de senha válido.')
        return
      }
      
      // Verifica conectividade com a internet
      if (!navigator.onLine) {
        console.error('Dispositivo parece estar offline')
        alert('Seu dispositivo parece estar sem conexão com a internet. Verifique sua conexão e tente novamente.')
        return
      }
      
      console.log('Iniciando geração de senha do tipo:', selectedTipo)
      
      // Tenta gerar a senha com sistema de retry aprimorado
      let tentativas = 0
      let novaSenha = null
      let ultimoErro = null
      const maxTentativas = 3
      
      while (tentativas < maxTentativas && !novaSenha) {
        try {
          console.log(`Tentativa ${tentativas + 1} de gerar senha...`)
          // Captura explicitamente apenas o valor retornado, não a função
          const resultado = await gerarSenha(selectedTipo)
          novaSenha = resultado
          
          console.log('Resultado da geração:', novaSenha ? 'Sucesso' : 'Falha')
          
          // Verifica se o resultado é válido
          if (novaSenha && typeof novaSenha === 'object') {
            console.log('Detalhes da senha gerada:', JSON.stringify(novaSenha))
            break // Sai do loop se tiver sucesso
          } else {
            novaSenha = null // Reseta se o resultado não for válido
            console.error('Resultado inválido recebido:', resultado)
          }
          
          tentativas++
          
          if (tentativas < maxTentativas && !novaSenha) {
            // Espera um pouco antes de tentar novamente (tempo crescente)
            const tempoEspera = 500 * tentativas
            console.log(`Tentativa ${tentativas} falhou, aguardando ${tempoEspera}ms antes de tentar novamente...`)
            await new Promise(resolve => setTimeout(resolve, tempoEspera))
          }
        } catch (err) {
          ultimoErro = err
          console.error(`Erro detalhado na tentativa ${tentativas + 1}:`, err)
          tentativas++
          
          if (tentativas < maxTentativas) {
            // Espera um pouco antes de tentar novamente (tempo crescente)
            const tempoEspera = 500 * tentativas
            console.log(`Aguardando ${tempoEspera}ms antes da próxima tentativa...`)
            await new Promise(resolve => setTimeout(resolve, tempoEspera))
          }
        }
      }
      
      if (novaSenha) {
        // Verificar se o objeto novaSenha tem a propriedade numero ou _id
        if (novaSenha.numero !== undefined) {
          console.log('Senha gerada com sucesso:', novaSenha.numero)
        } else if (novaSenha._id !== undefined) {
          console.log('Senha gerada com sucesso:', novaSenha._id)
          // Garantir que a propriedade numero existe para compatibilidade
          novaSenha.numero = novaSenha._id
        } else {
          console.log('Senha gerada com sucesso, mas sem identificador definido:', novaSenha)
          // Se não tiver identificador definido, não devemos continuar o processo
          throw new Error('Senha gerada sem identificador definido')
        }
        
        // Garantir que a propriedade horarioGeracao existe
        if (!novaSenha.horarioGeracao) {
          console.log('Adicionando horarioGeracao à senha')
          try {
            novaSenha.horarioGeracao = novaSenha.createdAt || new Date().toISOString()
            console.log('horarioGeracao adicionado com sucesso:', novaSenha.horarioGeracao)
          } catch (err) {
            console.error('Erro ao adicionar horarioGeracao:', err)
            // Criar uma cópia do objeto para evitar problemas de mutabilidade
            novaSenha = { ...novaSenha, horarioGeracao: novaSenha.createdAt || new Date().toISOString() }
            console.log('Objeto novaSenha recriado com horarioGeracao')
          }
        }
        setUltimaSenhaGerada(novaSenha)
        setShowConfirm(false)
        
        // Reproduz o som de geração com base nas configurações
        if (config.soundEffect && config.soundEffect !== 'none') {
          try {
            // Corrigindo o caminho para acessar os arquivos na pasta public
            const soundPath = `/assets/${config.soundEffect}.mp3`
            console.log('Tentando reproduzir som:', soundPath)
            const audio = new Audio(soundPath)
            audio.volume = (config.volume || 80) / 100 // Converte porcentagem para valor entre 0 e 1
            
            // Pré-carrega o áudio
            audio.load()
            
            // Múltiplas estratégias para garantir a reprodução
            const playSound = () => {
              console.log('Tentando reproduzir áudio de geração...')
              const playPromise = audio.play()
              
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log('Som de geração reproduzido com sucesso')
                  })
                  .catch(e => {
                    console.error('Erro ao reproduzir som de geração:', e)
                    
                    // Verifica se o erro é por falta de interação do usuário
                    if (e.name === 'NotAllowedError') {
                      console.log('Erro de permissão, tentando com interação do usuário')
                      // Tenta novamente com interação do usuário simulada
                      document.addEventListener('click', () => {
                        audio.play().catch(err => console.error('Falha na segunda tentativa:', err))
                      }, { once: true })
                    } else if (e.name === 'NotSupportedError') {
                      console.error('Formato de áudio não suportado ou arquivo não encontrado')
                      // Tenta com um arquivo de fallback
                      const fallbackAudio = new Audio('/assets/beep.mp3')
                      fallbackAudio.volume = (config.volume || 80) / 100
                      fallbackAudio.play().catch(err => console.error('Erro no fallback:', err))
                    }
                  })
              }
            }
            
            // Tenta reproduzir quando o áudio estiver carregado
            audio.addEventListener('canplaythrough', playSound, { once: true })
            
            // Adiciona handler para erros de carregamento
            audio.addEventListener('error', (e) => {
              console.error('Erro ao carregar áudio:', e)
              // Tenta com um arquivo de fallback em caso de erro
              const fallbackAudio = new Audio('/assets/beep.mp3')
              fallbackAudio.volume = (config.volume || 80) / 100
              fallbackAudio.play().catch(err => console.error('Erro no fallback:', err))
            }, { once: true })
            
            // Fallback se o evento não disparar
            setTimeout(() => {
              if (audio.readyState >= 3) { // HAVE_FUTURE_DATA ou HAVE_ENOUGH_DATA
                playSound()
              } else {
                console.log('Áudio não carregado completamente, tentando mesmo assim')
                playSound()
              }
            }, 300)
          } catch (error) {
            console.log('Erro ao criar objeto de áudio:', error)
          }
        }
      } else {
        console.error(`Não foi possível gerar a senha após ${maxTentativas} tentativas`)
        
        // Mensagem de erro mais específica baseada no último erro capturado
        let mensagemErro = 'Não foi possível gerar a senha. Tentando novamente automaticamente...'
        
        if (ultimoErro) {
          console.error('Último erro capturado:', ultimoErro)
          
          if (ultimoErro.message === 'Usuário não autenticado') {
            mensagemErro = 'Você precisa estar logado para gerar senhas. Faça login novamente.'
          } else if (ultimoErro.code === 'permission-denied') {
            mensagemErro = 'Você não tem permissão para gerar senhas. Faça login novamente.'
          } else if (ultimoErro.code === 'unavailable' || ultimoErro.code === 'network-request-failed') {
            mensagemErro = 'Erro de conexão com o servidor. O sistema tentará novamente automaticamente. Se o problema persistir, verifique sua conexão Wi-Fi ou dados móveis.'
          } else if (ultimoErro.code === 'resource-exhausted') {
            mensagemErro = 'Limite de senhas atingido. Tente novamente mais tarde.'
          } else if (ultimoErro.message === 'Sem conexão com o servidor') {
            mensagemErro = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.'
          }
        }
        
        alert(mensagemErro)
      }
    } catch (error) {
      console.error('Erro geral ao gerar senha:', error)
      
      // Mensagem de erro mais específica baseada no tipo de erro
      let mensagemErro = 'Erro ao gerar senha. Tente novamente.'
      
      if (error.message === 'Usuário não autenticado') {
        mensagemErro = 'Você precisa estar logado para gerar senhas. Faça login novamente.'
      } else if (error.code === 'permission-denied') {
        mensagemErro = 'Você não tem permissão para gerar senhas. Faça login novamente.'
      } else if (error.code === 'unavailable' || error.code === 'network-request-failed') {
        mensagemErro = 'Erro de conexão. Verifique sua internet e tente novamente.'
      } else if (error.code === 'resource-exhausted') {
        mensagemErro = 'Limite de senhas atingido. Tente novamente mais tarde.'
      }
      
      alert(mensagemErro)
    } finally {
      setIsLoading(false) // Finaliza o carregamento independente do resultado
    }
  }
  
  const handlePrint = () => {
    if (!ultimaSenhaGerada) return
    
    // Cria uma janela de impressão
    const printWindow = window.open('', '_blank')
    
    // Conteúdo da impressão
    printWindow.document.write(`
      <html>
        <head>
          <title>Senha ${ultimaSenhaGerada.numero}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .senha {
              font-size: 72px;
              font-weight: bold;
              margin: 20px 0;
            }
            .tipo {
              font-size: 24px;
              margin-bottom: 15px;
            }
            .info {
              font-size: 14px;
              margin-top: 30px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>Sistema de Senhas</h1>
          <div class="tipo">${getTipoDescricao(ultimaSenhaGerada.tipo)}</div>
          <div class="senha">${ultimaSenhaGerada.numero}</div>
          <div class="info">Data: ${new Date(ultimaSenhaGerada.horarioGeracao).toLocaleString('pt-BR')}</div>
          <div class="info">Por favor, aguarde ser chamado.</div>
        </body>
      </html>
    `)
    
    // Imprime e fecha a janela
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }
  
  const getTipoDescricao = (tipo) => {
    switch(tipo) {
      case TIPOS_SENHA.PRIORITARIA: return 'Senha Prioritária';
      case TIPOS_SENHA.NORMAL: return 'Senha Normal';
      case TIPOS_SENHA.RAPIDO: return 'Atendimento Rápido';
      default: return '';
    }
  }
  
  return (
    <PageContainer ispublico={isPublico ? "true" : undefined}>
      <Container ispublico={isPublico ? "true" : undefined}>
        <Title>Retire sua senha</Title>
        <ButtonsContainer>
          <SenhaButton 
            color="#e74c3c"
            onClick={() => handleGerarSenha(TIPOS_SENHA.PRIORITARIA)}
          >
            <ButtonIcon>🔴</ButtonIcon>
            Senha Prioritária
          </SenhaButton>
          
          <SenhaButton 
            color="#3498db"
            onClick={() => handleGerarSenha(TIPOS_SENHA.NORMAL)}
          >
            <ButtonIcon>🔵</ButtonIcon>
            Senha Normal
          </SenhaButton>
          
          <SenhaButton 
            color="#2ecc71"
            onClick={() => handleGerarSenha(TIPOS_SENHA.RAPIDO)}
          >
            <ButtonIcon>🟢</ButtonIcon>
            Atendimento Rápido
          </SenhaButton>
        </ButtonsContainer>
        
        {ultimaSenhaGerada && (
          <SenhaGeradaContainer>
            <SenhaTipo>
              {getTipoDescricao(ultimaSenhaGerada.tipo)}
            </SenhaTipo>
            
            <SenhaNumero $tipo={ultimaSenhaGerada.tipo}>
              {ultimaSenhaGerada.numero}
            </SenhaNumero>
            
            <SenhaInfo>
              Gerada em: {new Date(ultimaSenhaGerada.horarioGeracao).toLocaleString('pt-BR')}
            </SenhaInfo>
            
            <PrintButton onClick={handlePrint}>
              <span>🖨️</span> Imprimir Senha
            </PrintButton>
          </SenhaGeradaContainer>
        )}
      </Container>
      {showConfirm && (
        <ConfirmDialog>
          <DialogContent>
            <DialogTitle>Confirmar geração de senha</DialogTitle>
            <p>Deseja realmente gerar uma {getTipoDescricao(selectedTipo).toLowerCase()}?</p>
            <DialogButtons>
              <DialogButton 
                className="confirm" 
                onClick={handleConfirm} 
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? 'Gerando...' : 'Confirmar'}
              </DialogButton>
              <DialogButton 
                className="cancel" 
                onClick={() => setShowConfirm(false)} 
                disabled={isLoading}
              >
                Cancelar
              </DialogButton>
            </DialogButtons>
          </DialogContent>
        </ConfirmDialog>
      )}
    </PageContainer>
  )
}

export default GerarSenha