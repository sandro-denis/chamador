import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useSenha } from '../context/SenhaContext'
import { useAuth } from '../context/AuthContext'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  position: relative;
`

const Title = styled.h2`
  font-size: 28px;
  margin-bottom: 25px;
  color: #2c3e50;
  position: relative;
  padding-bottom: 15px;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    border-radius: 3px;
  }
`

const PainelControle = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`

const Card = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 25px;
  flex: 1;
  min-width: 300px;
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

const CardTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 18px;
  color: #2c3e50;
  position: relative;
  padding-bottom: 10px;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    border-radius: 2px;
  }
`

const GuicheSelector = styled.div`
  margin-bottom: 20px;
`

const Label = styled.label`
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 15px;
`

const Select = styled.select`
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 4px 10px rgba(52, 152, 219, 0.2);
    transform: translateY(-2px);
  }
  
  &:hover {
    border-color: #bbb;
  }
`

const Button = styled.button`
  background: linear-gradient(135deg, ${props => props.color || '#3498db'} 0%, ${props => {
    const color = props.color || '#3498db';
    return color === '#e74c3c' ? '#c0392b' : 
           color === '#3498db' ? '#2980b9' : 
           color === '#2ecc71' ? '#27ae60' : '#7f8c8d';
  }} 100%);
  color: white;
  padding: 14px 16px;
  width: 100%;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }
`

const SenhaChamadaCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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

const NumeroSenha = styled.div`
  font-size: 56px;
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
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`

const InfoSenha = styled.div`
  font-size: 18px;
  margin-bottom: 10px;
`

const GuicheInfo = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin: 15px 0;
  color: #2c3e50;
`

const FilaContainer = styled.div`
  margin-top: 25px;
  position: relative;
`

const FilaTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 18px;
  color: #2c3e50;
  position: relative;
  padding-bottom: 10px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    border-radius: 2px;
  }
`

const FilaList = styled.ul`
  list-style: none;
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`

const FilaItem = styled.li`
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  transition: all 0.3s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f8f9fa;
    transform: translateX(5px);
    box-shadow: inset 4px 0 0 ${props => {
      switch(props.$tipo) {
        case 'P': return '#e74c3c';
        case 'N': return '#3498db';
        case 'R': return '#2ecc71';
        default: return '#7f8c8d';
      }
    }};
  }
`

const SenhaNumero = styled.span`
  font-weight: 600;
  color: ${props => {
    switch(props.$tipo) {
      case 'P': return '#e74c3c';
      case 'N': return '#3498db';
      case 'R': return '#2ecc71';
      default: return '#7f8c8d';
    }
  }};
`

const SenhaInfo = styled.span`
  color: #7f8c8d;
  font-size: 14px;
`

const ChamarSenha = () => {
  const { TIPOS_SENHA, chamarProximaSenha, finalizarAtendimento, getSenhasPorStatus } = useSenha()
  const { user } = useAuth()
  const [guicheAtual, setGuicheAtual] = useState('1')
  const [senhaChamada, setSenhaChamada] = useState(null)
  const [senhasAguardando, setSenhasAguardando] = useState([])
  const [senhasEmAtendimento, setSenhasEmAtendimento] = useState([])
  
  // Função para atualizar a fila de senhas
  const atualizarFila = () => {
    const senhas = getSenhasPorStatus('aguardando')
    setSenhasAguardando(senhas)
    
    const senhasAtendimento = getSenhasPorStatus('chamada')
    setSenhasEmAtendimento(senhasAtendimento)
    
    // Atualizar o localStorage para garantir persistência
    // Combina as senhas aguardando e em atendimento para salvar no localStorage
    const todasSenhas = [...senhas, ...senhasAtendimento]
    
    // Usar o ID do usuário para isolar os dados no localStorage
    const userId = user?._id || 'guest'
    localStorage.setItem(`senhas_sistema_${userId}`, JSON.stringify(todasSenhas))
  }
  
  // Atualiza a lista de senhas aguardando e em atendimento a cada 1 segundo para maior responsividade
  useEffect(() => {
    atualizarFila()
    const interval = setInterval(atualizarFila, 1000)
    
    return () => clearInterval(interval)
  }, [getSenhasPorStatus])
  
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
    soundEffect: 'bell',
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
      } else if (e.key && e.key.startsWith('senhas_sistema_')) {
        // Força atualização das senhas quando o localStorage for atualizado em outra aba
        // Verifica se a chave corresponde ao usuário atual
        const userId = user?._id || 'guest'
        if (e.key === `senhas_sistema_${userId}`) {
          atualizarFila()
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  
  // Função para anunciar a senha usando síntese de voz
  const anunciarSenha = (senha) => {
    if (!senha) return false
    
    try {
      // Usa a API de síntese de voz do navegador como alternativa aos arquivos de áudio
      if ('speechSynthesis' in window) {
        // Cancela qualquer fala anterior
        window.speechSynthesis.cancel()
        
        // Cria uma nova instância de fala
        const msg = new SpeechSynthesisUtterance()
        
        // Define o texto a ser falado
        const numeroSenha = senha.numero || ''
        const guiche = senha.guiche || ''
        msg.text = `Senha ${numeroSenha}, guichê ${guiche}`
        
        // Define o volume
        msg.volume = (config.volume || 80) / 100
        
        // Define a voz com base na configuração
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          // Tenta encontrar uma voz em português
          const ptVoices = voices.filter(voice => 
            voice.lang.includes('pt') || voice.lang.includes('PT'))
          
          if (ptVoices.length > 0) {
            // Se encontrou vozes em português, usa a primeira
            msg.voice = ptVoices[0]
          }
        }
        
        // Fala o texto
        window.speechSynthesis.speak(msg)
        console.log('Anunciando senha usando síntese de voz:', msg.text)
        
        return true
      } else {
        console.warn('API de síntese de voz não disponível neste navegador')
        return false
      }
    } catch (error) {
      console.error('Erro ao usar síntese de voz:', error)
      return false
    }
  }

  // Função para reproduzir áudio com múltiplas estratégias de fallback
  const playAudio = async (audioPath, volume = config.volume) => {
    try {
      console.log(`Tentando reproduzir áudio: ${audioPath}`)
      const audio = new Audio(audioPath)
      audio.volume = (volume || 80) / 100
      
      // Pré-carrega o áudio
      audio.load()
      
      // Tenta reproduzir o áudio
      try {
        const playPromise = audio.play()
        
        if (playPromise !== undefined) {
          await playPromise
          console.log(`Áudio ${audioPath} reproduzido com sucesso`)
          return true
        }
      } catch (playError) {
        console.warn(`Falha ao reproduzir áudio ${audioPath}, tentando método alternativo:`, playError)
        
        // Método alternativo: criar um novo elemento de áudio e anexá-lo ao DOM
        const audioElement = document.createElement('audio')
        audioElement.src = audioPath
        audioElement.volume = (volume || 80) / 100
        document.body.appendChild(audioElement)
        
        try {
          await audioElement.play()
          // Remove o elemento após a reprodução
          audioElement.onended = () => document.body.removeChild(audioElement)
          return true
        } catch (fallbackError) {
          console.error(`Falha no método alternativo para ${audioPath}:`, fallbackError)
          if (document.body.contains(audioElement)) {
            document.body.removeChild(audioElement)
          }
          
          // Tenta um terceiro método usando o beep.mp3 como fallback
          try {
            const fallbackPath = '/assets/beep.mp3'
            console.log(`Tentando reproduzir áudio fallback: ${fallbackPath}`)
            const fallbackAudio = new Audio(fallbackPath)
            fallbackAudio.volume = (volume || 80) / 100
            await fallbackAudio.play()
            return true
          } catch (finalError) {
            console.error(`Falha em todos os métodos de reprodução de áudio:`, finalError)
            return false
          }
        }
      }
    } catch (error) {
      console.error(`Erro crítico ao reproduzir áudio ${audioPath}:`, error)
      return false
    }
  }

  const handleChamarProxima = async (tipoPrioridade = null) => {
    try {
        const senha = await chamarProximaSenha(guicheAtual, tipoPrioridade)
        if (senha) {
            setSenhaChamada(senha)
            // Atualiza a lista de senhas aguardando
            setSenhasAguardando(getSenhasPorStatus('aguardando'))
            // Força uma atualização do localStorage para disparar o evento storage em outras abas
            const userId = user?._id || 'guest'
            const senhasAtuais = JSON.parse(localStorage.getItem(`senhas_sistema_${userId}`) || '[]')
            localStorage.setItem(`senhas_sistema_${userId}`, JSON.stringify(senhasAtuais))
            
            // Primeiro tenta anunciar a senha usando síntese de voz
            const voiceSuccess = anunciarSenha(senha)
            
            // Se a síntese de voz falhar ou não estiver disponível, tenta reproduzir o som de efeito
            if (!voiceSuccess && config.soundEffect && config.soundEffect !== 'none') {
                // Garantindo que o caminho do áudio esteja correto
                const soundPath = `/assets/${config.soundEffect}.mp3`
                playAudio(soundPath).catch(error => {
                    console.error('Erro ao reproduzir som de chamada:', error)
                })
            }
        } else {
            alert('Não há senhas disponíveis para chamar!')
        }
    } catch (error) {
        console.error('Erro ao chamar próxima senha:', error)
        alert('Erro ao chamar a próxima senha. Tente novamente.')
    }
  }
  
  const handleFinalizarAtendimento = () => {
    if (senhaChamada) {
      finalizarAtendimento(senhaChamada._id || senhaChamada.id)
        .then(() => {
          setSenhaChamada(null)
          // Atualiza as listas de senhas
          atualizarFila()
          // Força uma atualização do localStorage para disparar o evento storage em outras abas
          const userId = user?._id || 'guest'
          const senhasAtuais = JSON.parse(localStorage.getItem(`senhas_sistema_${userId}`)) || []
          localStorage.setItem(`senhas_sistema_${userId}`, JSON.stringify(senhasAtuais))
        })
        .catch(error => {
          console.error('Erro ao finalizar atendimento:', error)
          alert('Erro ao finalizar atendimento. Tente novamente.')
        })
    }
  }
  
  const getTipoDescricao = (tipo) => {
    switch(tipo) {
      case TIPOS_SENHA.PRIORITARIA: return 'Prioritária';
      case TIPOS_SENHA.NORMAL: return 'Normal';
      case TIPOS_SENHA.RAPIDO: return 'Atendimento Rápido';
      default: return '';
    }
  }
  
  const formatarData = (dataString) => {
    const data = new Date(dataString)
    return data.toLocaleString('pt-BR')
  }
  
  const calcularTempoEspera = (dataGeracao) => {
    const agora = new Date()
    const geracao = new Date(dataGeracao)
    const diferencaMs = agora - geracao
    
    const minutos = Math.floor(diferencaMs / (1000 * 60))
    
    if (minutos < 60) {
      return `${minutos} min`
    } else {
      const horas = Math.floor(minutos / 60)
      const minutosRestantes = minutos % 60
      return `${horas}h ${minutosRestantes}min`
    }
  }
  
  const calcularTempoAtendimento = (horarioChamada) => {
    if (!horarioChamada) return '0 min'
    
    const agora = new Date()
    const chamada = new Date(horarioChamada)
    const diferencaMs = agora - chamada
    
    const minutos = Math.floor(diferencaMs / (1000 * 60))
    
    if (minutos < 60) {
      return `${minutos} min`
    } else {
      const horas = Math.floor(minutos / 60)
      const minutosRestantes = minutos % 60
      return `${horas}h ${minutosRestantes}min`
    }
  }
  
  return (
    <Container>
      <Title>Chamar Próxima Senha</Title>
      
      <PainelControle>
        <Card>
          <CardTitle>Painel de Controle</CardTitle>
          
          <GuicheSelector>
            <Label>Selecione o Guichê:</Label>
            <Select 
              value={guicheAtual} 
              onChange={(e) => setGuicheAtual(e.target.value)}
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num.toString()}>
                  Guichê {num}
                </option>
              ))}
            </Select>
          </GuicheSelector>
          
          <Button onClick={() => handleChamarProxima()}>
            Chamar Próxima Senha
          </Button>
          
          <Button 
            color="#e74c3c" 
            onClick={() => handleChamarProxima(TIPOS_SENHA.PRIORITARIA)}
          >
            Chamar Senha Prioritária
          </Button>
          
          <Button 
            color="#3498db" 
            onClick={() => handleChamarProxima(TIPOS_SENHA.NORMAL)}
          >
            Chamar Senha Normal
          </Button>
          
          <Button 
            color="#2ecc71" 
            onClick={() => handleChamarProxima(TIPOS_SENHA.RAPIDO)}
          >
            Chamar Senha Rápida
          </Button>
          
          {senhaChamada && (
            <Button 
              color="#7f8c8d" 
              onClick={handleFinalizarAtendimento}
            >
              Finalizar Atendimento
            </Button>
          )}
        </Card>
        
        <Card>
          <CardTitle>Fila de Espera</CardTitle>
          
          <FilaContainer>
            <FilaTitle>Senhas Aguardando: {senhasAguardando.length}</FilaTitle>
            
            {senhasAguardando.length > 0 ? (
              <FilaList>
                {senhasAguardando
                  .sort((a, b) => {
                    // Ordena por tipo (prioritária primeiro) e depois por horário de geração
                    if (a.tipo === TIPOS_SENHA.PRIORITARIA && b.tipo !== TIPOS_SENHA.PRIORITARIA) return -1;
                    if (a.tipo !== TIPOS_SENHA.PRIORITARIA && b.tipo === TIPOS_SENHA.PRIORITARIA) return 1;
                    return new Date(a.horarioGeracao) - new Date(b.horarioGeracao);
                  })
                  .map(senha => (
                    <FilaItem key={senha._id || senha.id}>
                      <SenhaNumero tipo={senha.tipo}>
                        {senha.numero}
                      </SenhaNumero>
                      <SenhaInfo>
                        {getTipoDescricao(senha.tipo)} - Espera: {calcularTempoEspera(senha.horarioGeracao)}
                      </SenhaInfo>
                    </FilaItem>
                  ))}
              </FilaList>
            ) : (
              <p>Não há senhas aguardando atendimento.</p>
            )}
          </FilaContainer>
        </Card>
      </PainelControle>
      
      {senhaChamada && (
        <SenhaChamadaCard>
          <InfoSenha>Senha Atual</InfoSenha>
          <NumeroSenha tipo={senhaChamada.tipo}>
            {senhaChamada.numero}
          </NumeroSenha>
          <InfoSenha>{getTipoDescricao(senhaChamada.tipo)}</InfoSenha>
          <GuicheInfo>Guichê {senhaChamada.guiche}</GuicheInfo>
        </SenhaChamadaCard>
      )}
      
      {/* Seção de Atendimentos em Andamento */}
      <Card>
        <CardTitle>Atendimentos em Andamento</CardTitle>
        
        <FilaContainer>
          <FilaTitle>Senhas em Atendimento: {senhasEmAtendimento.length}</FilaTitle>
          
          {senhasEmAtendimento.length > 0 ? (
            <FilaList>
              {senhasEmAtendimento.map(senha => (
                <FilaItem tipo={senha.tipo} key={senha._id || senha.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SenhaNumero tipo={senha.tipo}>
                      {senha.numero}
                    </SenhaNumero>
                    <SenhaInfo>
                      {getTipoDescricao(senha.tipo)} - Guichê {senha.guiche} - Tempo: {calcularTempoAtendimento(senha.horarioChamada)}
                    </SenhaInfo>
                  </div>
                  <button 
                    onClick={() => finalizarAtendimento(senha._id || senha.id)}
                    style={{
                      backgroundColor: '#7f8c8d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      cursor: 'pointer'
                    }}
                  >
                    Finalizar
                  </button>
                </FilaItem>
              ))}
            </FilaList>
          ) : (
            <p>Não há atendimentos em andamento.</p>
          )}
        </FilaContainer>
      </Card>
    </Container>
  )
}

export default ChamarSenha