import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useSenha } from '../context/SenhaContext'
import { useAuth } from '../context/AuthContext'
import { QRCodeSVG } from 'qrcode.react'
import printJS from 'print-js'

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
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
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
    
    // Verifica se deve imprimir imediatamente sem confirmação
    if (config.impressaoAutomatica && config.comportamentoImpressao === 'imediato') {
      // Gera e imprime a senha diretamente
      handleConfirm(tipo)
    } else {
      // Mostra diálogo de confirmação
      setShowConfirm(true)
    }
  }

  const handleConfirm = async (tipoParam) => {
    // Usa o tipo passado como parâmetro ou o tipo selecionado anteriormente
    const tipoSenha = tipoParam || selectedTipo;
    try {
      setIsLoading(true) // Indica que está carregando
      setShowConfirm(false) // Fecha o diálogo de confirmação imediatamente para evitar múltiplos cliques
      
      // Verifica se o usuário está autenticado
      if (!user) {
        console.error('Usuário não autenticado')
        alert('Você não tem permissão para gerar senhas. Faça login novamente.')
        return
      }
      
      // Verifica se o tipo de senha foi selecionado
      if (!tipoSenha) {
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
      
      console.log('Iniciando geração de senha do tipo:', tipoSenha)
      
      // Simplificamos o sistema de retry para evitar problemas
      try {
        // Fazemos uma única chamada para gerarSenha
        console.log(`Fazendo requisição para gerar senha do tipo: ${tipoSenha}`);
        const novaSenha = await gerarSenha(tipoSenha);
        console.log('Resposta completa da geração:', novaSenha);
        
        if (!novaSenha) {
          throw new Error('Não foi possível gerar a senha. Resposta vazia do servidor.');
        }
        
        // Verificamos se a resposta é um objeto válido
        if (typeof novaSenha !== 'object') {
          console.error('Resultado inválido recebido:', novaSenha);
          throw new Error('Formato de resposta inválido do servidor.');
        }
        
        console.log('Senha gerada com sucesso:', novaSenha.numero || novaSenha._id);
        
        // Gerar URL para o QR Code
        const baseUrl = window.location.origin;
        const qrUrl = `${baseUrl}/acompanhar/${novaSenha._id}`;
        setQrCodeUrl(qrUrl);
        
        // Se chegou aqui, a senha foi gerada com sucesso
        // Não precisamos fazer mais nada pois o contexto já atualizou o estado
        
        // Reproduz o som se configurado
        if (config.soundEffect && config.soundEffect !== 'none') {
          try {
            const soundPath = `/assets/${config.soundEffect}.mp3`;
            const audio = new Audio(soundPath);
            audio.volume = (config.volume || 80) / 100;
            audio.play().catch(err => console.error('Erro ao reproduzir som:', err));
          } catch (error) {
            console.error('Erro ao criar objeto de áudio:', error);
          }
        }
        
        // Impressão automática se estiver habilitada nas configurações
        if (config.impressaoAutomatica) {
          console.log('Impressão automática habilitada, imprimindo senha...');
          // Aguarda um pequeno intervalo para garantir que ultimaSenhaGerada foi atualizada
          setTimeout(() => {
            imprimirSenhaAutomatica(novaSenha);
          }, 300);
        }
        
      } catch (error) {
        console.error('Erro ao gerar senha:', error);
        
        // Mensagem de erro mais específica baseada no tipo de erro
        let mensagemErro = 'Erro ao gerar senha. Tente novamente.';
        
        if (error.message === 'Usuário não autenticado') {
          mensagemErro = 'Você precisa estar logado para gerar senhas. Faça login novamente.';
        } else if (error.code === 'permission-denied') {
          mensagemErro = 'Você não tem permissão para gerar senhas. Faça login novamente.';
        } else if (error.code === 'unavailable' || error.code === 'network-request-failed') {
          mensagemErro = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (error.code === 'resource-exhausted') {
          mensagemErro = 'Limite de senhas atingido. Tente novamente mais tarde.';
        }
        
        alert(mensagemErro);
      }
    } catch (error) {
      console.error('Erro inesperado ao gerar senha:', error);
      alert('Ocorreu um erro inesperado. Por favor, tente novamente.');
    } finally {
      setIsLoading(false); // Finaliza o carregamento independente do resultado
    }
  }
  
  // Função para impressão automática de senhas usando impressão direta
  const imprimirSenhaAutomatica = (senha) => {
    if (!senha) return
    
    // Obtém as configurações de impressão
    const tipoImpressora = config.tipoImpressora || 'termica'
    const larguraImpressao = config.larguraImpressao || 80
    
    // Gerar URL para o QR Code
    const baseUrl = window.location.origin
    const qrUrl = `${baseUrl}/acompanhar/${senha._id}`
    
    console.log('Iniciando impressão automática')
    console.log('URL do QR Code:', qrUrl)
    
    // Cria uma nova janela para impressão silenciosa
    const printWindow = window.open('', '_blank', 'width=600,height=600')
    
    if (!printWindow) {
      alert('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desativado.')
      return
    }
    
    // Conteúdo HTML para impressão
    let htmlContent = ''
    
    if (tipoImpressora === 'termica' || tipoImpressora === 'padrao') {
      // Estilo para impressora térmica (papel estreito)
      htmlContent = `
        <div style="font-family:Arial,sans-serif;text-align:center;padding:5px;margin:0;width:${larguraImpressao - 10}mm;">
          <div style="font-size:12px;font-weight:bold;margin-bottom:5px;border-bottom:1px dashed #000;padding-bottom:5px;">
            ${config.footerText || 'Sistema de Senhas'}
          </div>
          <div style="font-size:16px;margin-bottom:10px;font-weight:bold;">
            ${getTipoDescricao(senha.tipo)}
          </div>
          <div style="font-size:48px;font-weight:bold;margin:10px 0;">
            ${senha.numero}
          </div>
          <div style="font-size:10px;margin-top:10px;color:#333;">
            Data: ${new Date(senha.horarioGeracao).toLocaleString('pt-BR')}
          </div>
          <div style="font-size:10px;margin-top:5px;color:#333;">
            Por favor, aguarde ser chamado.
          </div>
          
          <div style="text-align:center;margin:10px auto;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrUrl)}" 
                 alt="QR Code" style="width:100px;height:100px;" />
          </div>
          
          <div style="font-size:9px;margin-top:5px;color:#333;">
            Escaneie o QR Code para acompanhar sua senha
          </div>
          
          <div style="font-size:10px;margin-top:10px;border-top:1px dashed #000;padding-top:5px;">
            Atendimento por ordem de chegada
          </div>
        </div>
      `
    } else if (tipoImpressora === 'escpos') {
      // Para impressoras ESC/POS, usamos um formato mais simples
      htmlContent = `
        <div style="font-family:monospace;text-align:center;padding:0;margin:0;width:${larguraImpressao - 5}mm;">
          <div style="font-size:12px;font-weight:bold;margin-bottom:5px;">
            ${config.footerText || 'Sistema de Senhas'}
          </div>
          <div style="font-size:14px;margin-bottom:5px;">
            ${getTipoDescricao(senha.tipo)}
          </div>
          <div style="font-size:36px;font-weight:bold;margin:5px 0;">
            ${senha.numero}
          </div>
          <div style="font-size:10px;margin-top:5px;">
            Data: ${new Date(senha.horarioGeracao).toLocaleString('pt-BR')}
          </div>
          <div style="font-size:10px;margin-top:5px;">
            Aguarde ser chamado
          </div>
          <div style="font-size:10px;margin-top:5px;">
            -------------------
          </div>
        </div>
      `
    }
    
    // Escreve o conteúdo HTML na nova janela
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Senha ${senha.numero}</title>
          <style>
            @page { size: ${larguraImpressao}mm auto; margin: 0; }
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    
    // Função para imprimir e fechar automaticamente após um pequeno atraso
    const printAndClose = () => {
      try {
        printWindow.focus() // Foca na janela antes de imprimir
        printWindow.print() // Inicia a impressão
        
        // Fecha a janela após a impressão
        setTimeout(() => {
          try {
            if (!printWindow.closed) {
              printWindow.close()
            }
          } catch (e) {
            console.error('Erro ao fechar janela de impressão:', e)
          }
        }, 1000)
      } catch (e) {
        console.error('Erro durante impressão:', e)
        alert('Ocorreu um erro durante a impressão. Por favor, tente novamente.')
      }
    }
    
    // Aguarda um momento para garantir que o conteúdo foi carregado
    setTimeout(printAndClose, 500)
  }
  
  const handlePrint = () => {
    if (!ultimaSenhaGerada) return
    imprimirSenhaAutomatica(ultimaSenhaGerada)
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
            
            {qrCodeUrl && (
              <>
                <QRCodeContainer>
                  <QRCodeSVG value={qrCodeUrl} size={150} />
                </QRCodeContainer>
                <QRCodeLabel>
                  Escaneie o QR Code para acompanhar sua senha pelo celular
                </QRCodeLabel>
              </>
            )}
            
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
                onClick={() => handleConfirm()} 
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

const QRCodeContainer = styled.div`
  margin: 20px auto;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
`

const QRCodeLabel = styled.div`
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 10px;
  text-align: center;
`