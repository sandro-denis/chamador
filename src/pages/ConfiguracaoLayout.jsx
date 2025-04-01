import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import layoutThemes from '../themes/layoutThemes'

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`

const Title = styled.h2`
  font-size: 28px;
  margin-bottom: 30px;
  color: #2c3e50;
`

const Section = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`

const SectionTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 20px;
  color: #2c3e50;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`

const ThemeCard = styled.div`
  border: 2px solid ${props => props.selected ? '#3498db' : '#ddd'};
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const ColorInput = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  
  label {
    min-width: 120px;
  }
  
  input[type="color"] {
    width: 50px;
    height: 30px;
    padding: 0;
    border: none;
    border-radius: 4px;
  }
`

const FontSelect = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  margin-bottom: 15px;
`

const RangeInput = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  
  label {
    min-width: 120px;
  }
  
  input[type="range"] {
    flex: 1;
  }
  
  span {
    min-width: 50px;
    text-align: right;
  }
`

const FileInput = styled.div`
  margin-bottom: 15px;
  
  input[type="file"] {
    display: none;
  }
  
  label {
    display: inline-block;
    padding: 8px 16px;
    background-color: #3498db;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #2980b9;
    }
  }
`

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 16px;
  margin-bottom: 15px;
`

const Button = styled.button`
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #27ae60;
  }
`

const DangerButton = styled(Button)`
  background-color: #e74c3c;
  
  &:hover {
    background-color: #c0392b;
  }
`

const OpenPanelButton = styled(Button)`
  background-color: #3498db;
  margin-right: 10px;
  
  &:hover {
    background-color: #2980b9;
  }
`

const CopyLinkButton = styled(Button)`
  background-color: #9b59b6;
  
  &:hover {
    background-color: #8e44ad;
  }
`

const Preview = styled.div`
  background-color: ${props => props.backgroundColor};
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.textColor};
  font-family: ${props => props.fontFamily};
  font-size: ${props => props.fontSize}px;
  background-image: ${props => props.backgroundImage ? `url(${props.backgroundImage})` : 'none'};
  background-size: cover;
  background-position: center;
`

const ConfiguracaoLayout = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    theme: 'light',
    layoutTheme: 'padrao',
    backgroundColor: '#f8f9fa',
    textColor: '#2c3e50',
    senhaColor: '#3498db',
    fontFamily: 'Arial',
    fontSize: 48,
    logo: null,
    backgroundType: 'color',
    backgroundImage: null,
    footerText: '',
    // Configurações de áudio
    voiceType: 'default',
    volume: 80,
    soundEffect: 'bell',
    repeatInterval: 1,
    // Configurações de impressão
    impressaoAutomatica: false,
    tipoImpressora: 'termica',
    larguraImpressao: 80,
    alturaImpressao: 'auto'
  })
  
  // Importa os temas de layout definidos
  const { useEffect: useLayoutEffect } = React;
  // O layoutThemes já está sendo importado no topo do arquivo, não precisamos importá-lo novamente
  
  // Temas de cores
  const themes = [
    { id: 'light', name: 'Claro', colors: { bg: '#f8f9fa', text: '#2c3e50', senha: '#3498db' } },
    { id: 'dark', name: 'Escuro', colors: { bg: '#2c3e50', text: '#ecf0f1', senha: '#3498db' } },
    { id: 'minimal', name: 'Minimalista', colors: { bg: '#ffffff', text: '#000000', senha: '#666666' } },
    { id: 'colorful', name: 'Colorido', colors: { bg: '#e8f4f8', text: '#2c3e50', senha: '#e74c3c' } }
  ]
  
  const fonts = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Roboto',
    'Open Sans'
  ]
  
  useEffect(() => {
    // Carrega configurações salvas
    const savedConfig = localStorage.getItem('painelConfig')
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
  }, [])
  
  const handleThemeChange = (theme) => {
    setConfig({
      ...config,
      theme: theme.id,
      backgroundColor: theme.colors.bg,
      textColor: theme.colors.text,
      senhaColor: theme.colors.senha
      // Mantém o layoutTheme atual
    })
  }
  
  const handleLayoutChange = (layoutId) => {
    setConfig({
      ...config,
      layoutTheme: layoutId
      // Mantém as cores atuais
    })
  }
  
  const handleLogoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setConfig({ ...config, logo: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleBackgroundUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setConfig({
          ...config,
          backgroundType: 'image',
          backgroundImage: reader.result
        })
      }
      reader.readAsDataURL(file)
    }
  }
  
  const saveConfig = () => {
    localStorage.setItem('painelConfig', JSON.stringify(config))
    alert('Configurações salvas com sucesso!')
  }
  
  const handleOpenPanel = () => {
    const url = `${window.location.origin}/painel-publico`
    window.open(url, '_blank', 'fullscreen=yes')
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/painel-publico`
    navigator.clipboard.writeText(url)
    alert('Link do painel copiado para a área de transferência!')
  }
  
  const limparDados = async () => {
    // Confirmar antes de limpar
    const confirmar = window.confirm(
      'ATENÇÃO: Esta ação irá remover todas as senhas e dados de atendimento da empresa. Esta ação não pode ser desfeita. Deseja continuar?'
    )
    
    if (!confirmar) return
    
    try {
      setLoading(true)
      
      // Obter token do localStorage
      const token = localStorage.getItem('token')
      
      // Chamar a API para limpar dados no banco
      const response = await axios.post(
        '/api/limpar-dados',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Limpar todos os dados relacionados a senhas do localStorage
      localStorage.removeItem('senhas_sistema')
      localStorage.removeItem('senhas_timestamp')
      localStorage.removeItem('contadores')
      localStorage.removeItem('senhasAguardando')
      localStorage.removeItem('ultimasSenhasChamadas')
      
      // Limpar dados estatísticos
      const keysToRemove = [];
      // Identificar todas as chaves relacionadas a senhas e estatísticas
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('senha') || key.includes('Senha') || 
                   key.includes('estatistica') || key.includes('Estatistica') || 
                   key.includes('atendimento') || key.includes('Atendimento'))) {
          keysToRemove.push(key);
        }
      }
      
      // Remover todas as chaves identificadas
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Forçar atualização da página para refletir as mudanças
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      // Manter apenas as configurações de layout e o token
      
      alert(`Dados limpos com sucesso! ${response.data.senhasRemovidas} senhas foram removidas.`)
    } catch (error) {
      console.error('Erro ao limpar dados:', error)
      alert('Erro ao limpar dados: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <Title>Configuração do Layout</Title>
      
      <Section>
        <SectionTitle>Painel Público</SectionTitle>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <OpenPanelButton onClick={handleOpenPanel}>
            Abrir Painel em Tela Cheia
          </OpenPanelButton>
          <CopyLinkButton onClick={handleCopyLink}>
            Copiar Link do Painel
          </CopyLinkButton>
        </div>
      </Section>

      <Section>
        <SectionTitle>Gerador de Senhas</SectionTitle>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <OpenPanelButton onClick={() => window.open(`${window.location.origin}/gerar-senha-publico`, '_blank', 'fullscreen=yes')}>
            Abrir Gerador em Tela Cheia
          </OpenPanelButton>
          <CopyLinkButton onClick={() => {
            const url = `${window.location.origin}/gerar-senha`
            navigator.clipboard.writeText(url)
            alert('Link do gerador copiado para a área de transferência!')
          }}>
            Copiar Link do Gerador
          </CopyLinkButton>
        </div>
      </Section>
      
      <Section>
        <SectionTitle>Temas Predefinidos</SectionTitle>
        <Grid>
          {themes.map(theme => (
            <ThemeCard
              key={theme.id}
              selected={config.theme === theme.id}
              onClick={() => handleThemeChange(theme)}
              style={{
                backgroundColor: theme.colors.bg,
                color: theme.colors.text
              }}
            >
              {theme.name}
            </ThemeCard>
          ))}
        </Grid>
      </Section>
      
      <Section>
        <SectionTitle>Layouts do Painel</SectionTitle>
        <p style={{ marginBottom: '15px' }}>Escolha o layout que melhor se adapta às suas necessidades:</p>
        <Grid>
          {layoutThemes && Object.values(layoutThemes).map(layout => (
            <ThemeCard
              key={layout.id}
              selected={config.layoutTheme === layout.id}
              onClick={() => handleLayoutChange(layout.id)}
              style={{
                backgroundColor: layout.colors.bg,
                color: layout.colors.text,
                border: config.layoutTheme === layout.id ? `2px solid ${layout.colors.senha}` : '2px solid #ddd'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{layout.name}</div>
              <div style={{ fontSize: '12px' }}>{layout.description}</div>
            </ThemeCard>
          ))}
        </Grid>
      </Section>
      
      <Section>
        <SectionTitle>Cores Personalizadas</SectionTitle>
        <ColorInput>
          <label>Cor de Fundo:</label>
          <input
            type="color"
            value={config.backgroundColor}
            onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
          />
        </ColorInput>
        <ColorInput>
          <label>Cor do Texto:</label>
          <input
            type="color"
            value={config.textColor}
            onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
          />
        </ColorInput>
        <ColorInput>
          <label>Cor da Senha:</label>
          <input
            type="color"
            value={config.senhaColor}
            onChange={(e) => setConfig({ ...config, senhaColor: e.target.value })}
          />
        </ColorInput>
      </Section>
      
      <Section>
        <SectionTitle>Fonte e Tamanho</SectionTitle>
        <FontSelect
          value={config.fontFamily}
          onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
        >
          {fonts.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </FontSelect>
        
        <RangeInput>
          <label>Tamanho da Fonte:</label>
          <input
            type="range"
            min="24"
            max="72"
            value={config.fontSize}
            onChange={(e) => setConfig({ ...config, fontSize: parseInt(e.target.value) })}
          />
          <span>{config.fontSize}px</span>
        </RangeInput>
      </Section>
      
      <Section>
        <SectionTitle>Logo e Identidade Visual</SectionTitle>
        <FileInput>
          <label htmlFor="logo-upload">Upload Logo</label>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
          />
        </FileInput>
        
        <input
          type="text"
          placeholder="Texto do Rodapé"
          value={config.footerText}
          onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
          style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
        />
      </Section>
      
      <Section>
        <SectionTitle>Plano de Fundo</SectionTitle>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ marginRight: '15px' }}>
            <input
              type="radio"
              name="backgroundType"
              value="color"
              checked={config.backgroundType === 'color'}
              onChange={(e) => setConfig({ ...config, backgroundType: e.target.value })}
            /> Cor Sólida
          </label>
          <label>
            <input
              type="radio"
              name="backgroundType"
              value="image"
              checked={config.backgroundType === 'image'}
              onChange={(e) => setConfig({ ...config, backgroundType: e.target.value })}
            /> Imagem
          </label>
        </div>
        
        {config.backgroundType === 'image' && (
          <FileInput>
            <label htmlFor="background-upload">Upload Imagem de Fundo</label>
            <input
              id="background-upload"
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
            />
          </FileInput>
        )}
      </Section>
      
      <Section>
        <SectionTitle>🔊 Configuração de Áudio</SectionTitle>
        
        <RangeInput>
          <label>Volume:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={config.volume}
            onChange={(e) => setConfig({ ...config, volume: parseInt(e.target.value) })}
          />
          <span>{config.volume}%</span>
        </RangeInput>
        
        <div style={{ marginBottom: '15px' }}>
          <Label>Efeito Sonoro:</Label>
          <Select
            value={config.soundEffect}
            onChange={(e) => setConfig({ ...config, soundEffect: e.target.value })}
          >
            <option value="bell">Campainha</option>
            <option value="beep">Bipe</option>
            <option value="chime">Sino</option>
            <option value="none">Sem Efeito</option>
          </Select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <Label>Intervalo de Repetição:</Label>
          <Select
            value={config.repeatInterval}
            onChange={(e) => setConfig({ ...config, repeatInterval: parseInt(e.target.value) })}
          >
            <option value="1">1 vez (sem repetição)</option>
            <option value="2">2 vezes</option>
            <option value="3">3 vezes</option>
          </Select>
        </div>
      </Section>
      
      <Section>
        <SectionTitle>🖨️ Configuração de Impressão</SectionTitle>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.impressaoAutomatica}
              onChange={(e) => setConfig({ ...config, impressaoAutomatica: e.target.checked })}
              style={{ marginRight: '10px' }}
            />
            <span>Habilitar impressão automática de senhas</span>
          </label>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
            Quando habilitado, as senhas serão impressas automaticamente após a confirmação, sem necessidade de clicar no botão de impressão.
          </p>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <Label>Tipo de Impressora:</Label>
          <Select
            value={config.tipoImpressora}
            onChange={(e) => setConfig({ ...config, tipoImpressora: e.target.value })}
            disabled={!config.impressaoAutomatica}
          >
            <option value="termica">Impressora Térmica</option>
            <option value="escpos">Impressora ESC/POS</option>
            <option value="padrao">Impressora Padrão do Sistema</option>
          </Select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <Label>Comportamento de Impressão:</Label>
          <Select
            value={config.comportamentoImpressao || 'confirmar'}
            onChange={(e) => setConfig({ ...config, comportamentoImpressao: e.target.value })}
            disabled={!config.impressaoAutomatica}
          >
            <option value="confirmar">Imprimir após confirmação</option>
            <option value="imediato">Imprimir imediatamente (sem confirmação)</option>
          </Select>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
            Recomendado para totens: "Imprimir imediatamente" para melhor experiência do usuário.
          </p>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <Label>Largura do Papel (mm):</Label>
          <Select
            value={config.larguraImpressao}
            onChange={(e) => setConfig({ ...config, larguraImpressao: parseInt(e.target.value) })}
            disabled={!config.impressaoAutomatica}
          >
            <option value="58">58mm (Padrão para mini-impressoras)</option>
            <option value="80">80mm (Padrão para impressoras térmicas)</option>
            <option value="76">76mm</option>
          </Select>
        </div>
      </Section>
      
      <Section>
        <SectionTitle>Prévia</SectionTitle>
        <div style={{ marginBottom: '15px' }}>
          <strong>Layout selecionado:</strong> {layoutThemes[config.layoutTheme]?.name || 'Padrão'}
          <p>{layoutThemes[config.layoutTheme]?.description || 'Layout padrão do sistema'}</p>
        </div>
        <Preview
          backgroundColor={config.backgroundColor}
          textColor={config.textColor}
          fontFamily={config.fontFamily}
          fontSize={config.fontSize}
          backgroundImage={config.backgroundType === 'image' ? config.backgroundImage : null}
          style={{
            backgroundColor: layoutThemes[config.layoutTheme]?.colors?.bg || config.backgroundColor,
            color: layoutThemes[config.layoutTheme]?.colors?.text || config.textColor
          }}
        >
          {config.logo && (
            <img
              src={config.logo}
              alt="Logo"
              style={{ maxWidth: '200px', marginBottom: '20px' }}
            />
          )}
          <div style={{ 
            color: layoutThemes[config.layoutTheme]?.colors?.senha || config.senhaColor, 
            fontWeight: 'bold',
            fontSize: `${config.fontSize}px`
          }}>A001</div>
          <div>Guichê 01</div>
          {config.footerText && (
            <div style={{ marginTop: '20px', fontSize: '16px' }}>{config.footerText}</div>
          )}
        </Preview>
      </Section>
      
      <Section>
        <SectionTitle>Manutenção do Sistema</SectionTitle>
        <p style={{ marginBottom: '15px' }}>
          Utilize esta opção para limpar todos os dados de senhas e atendimentos da empresa {user?.companyName}.
          Esta ação não pode ser desfeita.  
        </p>
        <DangerButton 
          onClick={limparDados} 
          disabled={loading}
          style={{ marginBottom: '20px' }}
        >
          {loading ? 'Limpando...' : 'Limpar Dados do Sistema'}
        </DangerButton>
      </Section>
      
      <Button onClick={saveConfig}>Salvar Configurações</Button>
    </Container>
  )
}

export default ConfiguracaoLayout