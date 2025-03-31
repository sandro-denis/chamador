import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useSenha } from '../context/SenhaContext'

// Importa a constante STORAGE_KEY do contexto
const STORAGE_KEY = 'senhas_sistema'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${props => props.$backgroundColor || '#f8f9fa'};
  background-image: ${props => props.$backgroundImage ? `url(${props.$backgroundImage})` : 'none'};
  background-size: cover;
  background-position: center;
  overflow: hidden;
  font-family: ${props => props.$fontFamily || 'Arial'};
`

const Header = styled.div`
  background: linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%);
  color: white;
  padding: 15px 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  
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

const Title = styled.h1`
  font-size: 32px;
  margin: 0;
  position: relative;
  padding: 0 15px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #3498db, #2ecc71);
    border-radius: 3px;
  }
`

const PainelContainer = styled.div`
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 20px;
  overflow: hidden;
  flex-wrap: wrap;
`

const SenhaAtualContainer = styled.div`
  flex: 2;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
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

const SenhaAtualTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  color: ${props => props.$textColor || '#2c3e50'};
`

const SenhaAtualNumero = styled.div`
  font-size: ${props => props.$fontSize || 120}px;
  font-weight: bold;
  margin: 20px 0;
  color: ${props => props.$senhaColor || (
    props.$tipo === 'P' ? '#e74c3c' : 
    props.$tipo === 'N' ? '#3498db' : 
    props.$tipo === 'R' ? '#2ecc71' : 
    '#7f8c8d'
  )};
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`

const SenhaAtualTipo = styled.div`
  font-size: 32px;
  margin-bottom: 15px;
  color: ${props => props.$textColor || '#7f8c8d'};
`

const GuicheInfo = styled.div`
  font-size: 48px;
  font-weight: bold;
  margin: 15px 0;
  color: ${props => props.$textColor || '#2c3e50'};
`

const SenhasContainer = styled.div`
  flex: 1;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 25px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-width: 300px;
  
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

const UltimasSenhasContainer = styled(SenhasContainer)``

const SenhasAguardandoContainer = styled(SenhasContainer)``

const UltimasSenhasTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
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
    z-index: 1;
  }
`

const SenhasList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
  max-height: 300px;
  flex: 1;
`

const SenhaItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: #f8f9fa;
  border-left: 5px solid ${props => {
    switch(props.$tipo) {
      case 'P': return '#e74c3c';
      case 'N': return '#3498db';
      case 'R': return '#2ecc71';
      default: return '#7f8c8d';
    }
  }};
  margin-bottom: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
`

const SenhaNumero = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${props => {
    switch(props.$tipo) {
      case 'P': return '#e74c3c';
      case 'N': return '#3498db';
      case 'R': return '#2ecc71';
      default: return '#7f8c8d';
    }
  }};
`

const SenhaGuiche = styled.div`
  font-size: 20px;
  color: #2c3e50;
  font-weight: 600;
`

const Footer = styled.div`
  background: linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%);
  color: white;
  padding: 12px;
  text-align: center;
  font-size: 18px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #3498db, #2ecc71, #e74c3c);
  }
`

const Clock = styled.div`
  font-size: 20px;
  font-weight: 500;
`

const PainelSenhas = () => {
  const { getSenhasPorStatus, TIPOS_SENHA } = useSenha()
  const [senhaAtual, setSenhaAtual] = useState(null)
  const [ultimasSenhas, setUltimasSenhas] = useState([])
  const [senhasAguardando, setSenhasAguardando] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())
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
  
  // Carrega configurações salvas e configura listeners
  useEffect(() => {
    const loadConfig = () => {
      try {
        const savedConfig = localStorage.getItem('painelConfig')
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig))
        } else {
          // Configurações padrão de áudio
          setConfig(prev => ({
            ...prev,
            voiceType: 'default',
            volume: 80,
            soundEffect: 'bell',
            repeatInterval: 1
          }))
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      }
    }

    loadConfig()

    // Adiciona listener para mudanças no localStorage de outras abas
    const handleStorageChange = (e) => {
      if (e.key === 'painelConfig') {
        loadConfig()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Função para reproduzir áudio
  const playAudio = async (audioPath, volume = config.volume) => {
    try {
      const audio = new Audio(audioPath)
      audio.volume = (volume || 80) / 100
      
      // Adiciona timeout para evitar espera infinita
      const loadPromise = new Promise((resolve, reject) => {
        // Evento disparado quando o áudio está pronto para reprodução
        audio.addEventListener('canplaythrough', resolve, { once: true })
        
        // Evento disparado quando ocorre um erro
        audio.addEventListener('error', (e) => {
          console.warn(`Erro ao carregar áudio ${audioPath}:`, e)
          // Resolvemos mesmo com erro para tentar reproduzir de qualquer forma
          resolve()
        }, { once: true })
        
        // Inicia o carregamento
        audio.load()
      })
      
      // Adiciona um timeout para não esperar indefinidamente
      const timeoutPromise = new Promise(resolve => {
        setTimeout(() => {
          console.warn(`Áudio não carregado completamente em 3 segundos: ${audioPath}, tentando mesmo assim`)
          resolve()
        }, 3000)
      })
      
      // Espera o que acontecer primeiro: carregamento completo ou timeout
      await Promise.race([loadPromise, timeoutPromise])
      
      // Tenta reproduzir o áudio mesmo se não estiver totalmente carregado
      try {
        await audio.play()
        return true
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
          return false
        }
      }
    } catch (error) {
      console.error(`Erro crítico ao reproduzir áudio ${audioPath}:`, error)
      return false
    }
  }

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

  // Função para reproduzir sequência de áudios
  const playAudioSequence = async (senha) => {
    try {
      // Reproduz o efeito sonoro
      if (config.soundEffect && config.soundEffect !== 'none') {
        // Garante que o caminho do arquivo de som esteja correto
        const soundPath = `/assets/${config.soundEffect}.mp3`
        console.log(`Tentando reproduzir efeito sonoro: ${soundPath}`)
        const soundSuccess = await playAudio(soundPath)
        
        if (soundSuccess) {
          // Só espera o delay se o som foi reproduzido com sucesso
          await new Promise(resolve => setTimeout(resolve, 500)) // Delay entre som e voz
        } else {
          console.warn(`Não foi possível reproduzir o efeito sonoro: ${soundPath}`)
        }
      }

      // Tenta usar a síntese de voz para anunciar a senha
      anunciarSenha(senha)
      
      // Reproduz repetições adicionais se configurado
      if (config.repeatInterval && config.repeatInterval > 1) {
        for (let i = 1; i < config.repeatInterval; i++) {
          await new Promise(resolve => setTimeout(resolve, 3000)) // 3 segundos entre repetições
          anunciarSenha(senha)
        }
      }
    } catch (error) {
      console.error('Erro na sequência de áudio:', error)
    }
  }

  // Função para atualizar as senhas
  const atualizarSenhas = () => {
    try {
      const senhasChamadas = getSenhasPorStatus('chamada')
      const senhasFinalizadas = getSenhasPorStatus('finalizada')
      const aguardando = getSenhasPorStatus('aguardando')
      
      // Atualiza a lista de senhas aguardando
      setSenhasAguardando(aguardando)
      
      // Mantém a ordem estável das senhas chamadas e finalizadas
      // Ordenamos por horário de chamada para garantir que as mais recentes apareçam primeiro
      // mas mantemos a ordem estável entre atualizações para evitar troca de posições
      const senhasChamadasOrdenadas = [...senhasChamadas].sort((a, b) => {
        // Se ambas têm horário de chamada, ordena pela mais recente primeiro
        if (a.horarioChamada && b.horarioChamada) {
          return new Date(b.horarioChamada) - new Date(a.horarioChamada)
        }
        // Se apenas uma tem horário, ela vem primeiro
        if (a.horarioChamada) return -1
        if (b.horarioChamada) return 1
        // Se nenhuma tem horário, mantém a ordem original
        return 0
      })
      
      // Ordenamos as senhas finalizadas pela mais recente primeiro
      const senhasFinalizadasOrdenadas = [...senhasFinalizadas].sort((a, b) => {
        // Se ambas têm horário de finalização, ordena pela mais recente primeiro
        if (a.horarioFinalizacao && b.horarioFinalizacao) {
          return new Date(b.horarioFinalizacao) - new Date(a.horarioFinalizacao)
        }
        // Se apenas uma tem horário, ela vem primeiro
        if (a.horarioFinalizacao) return -1
        if (b.horarioFinalizacao) return 1
        // Se nenhuma tem horário, mantém a ordem original
        return 0
      })
      
      // Une as duas listas mantendo a ordem estável
      const todasSenhas = [...senhasChamadasOrdenadas, ...senhasFinalizadasOrdenadas]
      
      if (todasSenhas.length > 0) {
        // A senha atual é a primeira da lista de senhas chamadas ordenadas
        const novaSenhaAtual = senhasChamadasOrdenadas.length > 0 ? senhasChamadasOrdenadas[0] : null;
        
        if (novaSenhaAtual) {
          // Garantir que a senha atual tenha todos os campos necessários
          // Verificamos explicitamente se o guichê existe antes de usar
          const guicheValor = novaSenhaAtual.guiche !== undefined && novaSenhaAtual.guiche !== null ? 
            novaSenhaAtual.guiche : 'N/A';
            
          const senhaAtualFormatada = {
            ...novaSenhaAtual,
            id: novaSenhaAtual._id || novaSenhaAtual.id,
            numero: novaSenhaAtual.numero || (novaSenhaAtual.valor ? `${novaSenhaAtual.tipo}${String(novaSenhaAtual.valor).padStart(2, '0')}` : `${novaSenhaAtual.tipo}01`),
            guiche: guicheValor
          }
          
          setSenhaAtual(senhaAtualFormatada)
          
          // Verifica se a senha foi chamada nos últimos 5 segundos
          const horarioChamada = new Date(novaSenhaAtual.horarioChamada)
          const agora = new Date()
          const diferencaSegundos = (agora - horarioChamada) / 1000
          
          if (diferencaSegundos < 5) {
            // Reproduz a sequência de áudios
            playAudioSequence(senhaAtualFormatada)
          }
        } else {
          setSenhaAtual(null)
        }
        
        // Atualiza a lista de últimas senhas (excluindo a senha atual se existir)
        // e limitando a 8 senhas para exibição, mantendo a ordem estável
        const ultimasSenhasLista = novaSenhaAtual ? 
          todasSenhas.filter(senha => senha._id !== novaSenhaAtual._id).slice(0, 8) : 
          todasSenhas.slice(0, 8);
        
        // Garantir que as senhas tenham todos os campos necessários para exibição
        // Verificamos explicitamente se o guichê existe antes de usar
        const senhasFormatadas = ultimasSenhasLista.map(senha => {
          // Garantir que o guichê seja sempre exibido corretamente
          const guicheValor = senha.guiche !== undefined && senha.guiche !== null ? 
            senha.guiche : 'N/A';
            
          return {
            ...senha,
            id: senha._id || senha.id, // Garantir que tenha um id para a key do componente
            numero: senha.numero || (senha.valor ? `${senha.tipo}${String(senha.valor).padStart(2, '0')}` : `${senha.tipo}01`),
            guiche: guicheValor
          };
        });
        
        // Usamos uma função de atualização para garantir que não haja reordenação desnecessária
        // Comparamos os IDs para evitar atualizações desnecessárias que causariam re-renderização
        setUltimasSenhas(prev => {
          // Se os IDs são os mesmos e na mesma ordem, não atualiza
          const prevIds = prev.map(s => s._id || s.id);
          const newIds = senhasFormatadas.map(s => s._id || s.id);
          
          // Verifica se os arrays têm o mesmo tamanho e os mesmos IDs na mesma ordem
          const idsIguais = prevIds.length === newIds.length && 
            prevIds.every((id, index) => id === newIds[index]);
          
          // Se os IDs são iguais, mantém o estado anterior para evitar re-renderização
          return idsIguais ? prev : senhasFormatadas;
        })
      } else {
        // Se não houver senhas em atendimento, limpa os estados
        setSenhaAtual(null)
        setUltimasSenhas([])
      }
    } catch (error) {
      console.error('Erro ao atualizar senhas:', error)
    }
  }

  // Atualiza as senhas e o relógio a cada 1 segundo
  useEffect(() => {
    atualizarSenhas()
    
    const senhasInterval = setInterval(atualizarSenhas, 1000)
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    // Adiciona listener para atualizações de outras abas
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY || e.key === 'senhas_timestamp') {
        atualizarSenhas()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(senhasInterval)
      clearInterval(clockInterval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [getSenhasPorStatus]) // Adiciona getSenhasPorStatus como dependência
  
  const getTipoDescricao = (tipo) => {
    switch(tipo) {
      case TIPOS_SENHA.PRIORITARIA: return 'Prioritária';
      case TIPOS_SENHA.NORMAL: return 'Normal';
      case TIPOS_SENHA.RAPIDO: return 'Atendimento Rápido';
      default: return '';
    }
  }
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  
  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
  }
  
  const calcularTempoEspera = (dataGeracao) => {
    if (!dataGeracao) return '0 min';
    
    try {
      const agora = new Date();
      const geracao = new Date(dataGeracao);
      
      if (isNaN(geracao.getTime())) return '0 min';
      
      const diferencaMs = agora - geracao;
      const minutos = Math.floor(diferencaMs / (1000 * 60));
      
      if (minutos < 60) {
        return `${minutos} min`;
      } else {
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;
        return `${horas}h ${minutosRestantes}min`;
      }
    } catch (error) {
      console.error('Erro ao calcular tempo de espera:', error);
      return '0 min';
    }
  }
  
  return (
    <Container 
      $backgroundColor={config.backgroundType === 'color' ? config.backgroundColor : 'transparent'}
      $backgroundImage={config.backgroundType === 'image' ? config.backgroundImage : null}
      $fontFamily={config.fontFamily}
    >
      <Header>
        {config.logo && (
          <img 
            src={config.logo} 
            alt="Logo" 
            style={{ maxHeight: '40px', marginRight: '15px' }} 
          />
        )}
        <Title>Painel de Senhas</Title>
      </Header>
      
      <PainelContainer>
        <SenhaAtualContainer>
          <SenhaAtualTitle $textColor={config.textColor}>Senha Atual</SenhaAtualTitle>
          
          {senhaAtual ? (
            <>
              <SenhaAtualTipo $textColor={config.textColor}>
                {getTipoDescricao(senhaAtual.tipo)}
              </SenhaAtualTipo>
              
              <SenhaAtualNumero 
                $tipo={senhaAtual.tipo}
                $senhaColor={config.senhaColor}
                $fontSize={config.fontSize}
              >
                {senhaAtual.numero}
              </SenhaAtualNumero>
              
              <GuicheInfo $textColor={config.textColor}>
                Guichê {senhaAtual.guiche}
              </GuicheInfo>
            </>
          ) : (
            <SenhaAtualTipo>Aguardando chamada...</SenhaAtualTipo>
          )}
        </SenhaAtualContainer>
        
        <UltimasSenhasContainer>
          <UltimasSenhasTitle>Últimas Senhas Chamadas</UltimasSenhasTitle>
          
          <SenhasList>
            {ultimasSenhas.length > 0 ? (
              ultimasSenhas.map(senha => (
                <SenhaItem key={senha._id || senha.id} $tipo={senha.tipo}>
                  <SenhaNumero $tipo={senha.tipo}>
                    {senha.numero}
                  </SenhaNumero>
                  <SenhaGuiche>
                    Guichê {senha.guiche || 'N/A'}
                  </SenhaGuiche>
                </SenhaItem>
              ))
            ) : (
              <p style={{ textAlign: 'center' }}>Nenhuma senha chamada recentemente.</p>
            )}
          </SenhasList>
        </UltimasSenhasContainer>
        
        <SenhasAguardandoContainer>
          <UltimasSenhasTitle>Senhas Aguardando</UltimasSenhasTitle>
          
          <SenhasList>
            {senhasAguardando.length > 0 ? (
              senhasAguardando
                .sort((a, b) => {
                  // Ordena por tipo (prioritária primeiro) e depois por horário de geração
                  if (a.tipo === TIPOS_SENHA.PRIORITARIA && b.tipo !== TIPOS_SENHA.PRIORITARIA) return -1;
                  if (a.tipo !== TIPOS_SENHA.PRIORITARIA && b.tipo === TIPOS_SENHA.PRIORITARIA) return 1;
                  return new Date(a.horarioGeracao) - new Date(b.horarioGeracao);
                })
                .map(senha => (
                <SenhaItem key={senha._id || senha.id} $tipo={senha.tipo}>
                  <SenhaNumero $tipo={senha.tipo}>
                    {senha.numero}
                  </SenhaNumero>
                  <SenhaGuiche>
                    Espera: {calcularTempoEspera(senha.horarioGeracao)}
                  </SenhaGuiche>
                </SenhaItem>
              ))
            ) : (
              <p style={{ textAlign: 'center' }}>Nenhuma senha aguardando atendimento.</p>
            )}
          </SenhasList>
        </SenhasAguardandoContainer>
      </PainelContainer>
      
      <Footer>
        <Clock>
          {formatTime(currentTime)} - {formatDate(currentTime)}
        </Clock>
        {config.footerText && (
          <div style={{ marginTop: '5px' }}>{config.footerText}</div>
        )}
      </Footer>
    </Container>
  )
}

export default PainelSenhas