/**
 * Definições de temas e layouts para o painel de senhas
 * Este arquivo contém as configurações para diferentes layouts que podem ser aplicados ao painel
 */

const layoutThemes = {
  // Layout padrão (atual)
  padrao: {
    id: 'padrao',
    name: 'Padrão',
    description: 'Layout padrão do sistema com visualização equilibrada',
    colors: { 
      bg: '#f8f9fa', 
      text: '#2c3e50', 
      senha: '#3498db',
      header: 'linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%)',
      headerText: '#ffffff'
    },
    layout: {
      painelContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px'
      },
      senhaAtualContainer: {
        flex: 2,
        minWidth: '300px'
      },
      senhasListContainer: {
        flex: 1,
        minWidth: '300px'
      }
    }
  },
  
  // Layout minimalista
  minimalista: {
    id: 'minimalista',
    name: 'Minimalista',
    description: 'Layout simplificado com foco na senha atual',
    colors: { 
      bg: '#ffffff', 
      text: '#333333', 
      senha: '#555555',
      header: '#f5f5f5',
      headerText: '#333333'
    },
    layout: {
      painelContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'auto auto',
        gap: '15px'
      },
      senhaAtualContainer: {
        gridColumn: '1',
        gridRow: '1',
        padding: '40px 20px'
      },
      senhasListContainer: {
        gridColumn: '1',
        gridRow: '2',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px'
      }
    }
  },
  
  // Layout de alto contraste
  altoContraste: {
    id: 'altoContraste',
    name: 'Alto Contraste',
    description: 'Layout com alto contraste para melhor visibilidade',
    colors: { 
      bg: '#000000', 
      text: '#ffffff', 
      senha: '#ffff00',
      header: '#000000',
      headerText: '#ffffff'
    },
    layout: {
      painelContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      },
      senhaAtualContainer: {
        padding: '30px',
        border: '3px solid #ffffff'
      },
      senhasListContainer: {
        display: 'flex',
        gap: '20px'
      }
    }
  },
  
  // Layout para telas grandes
  telasGrandes: {
    id: 'telasGrandes',
    name: 'Telas Grandes',
    description: 'Layout otimizado para monitores e TVs de grande formato',
    colors: { 
      bg: '#0a192f', 
      text: '#e6f1ff', 
      senha: '#64ffda',
      header: '#172a45',
      headerText: '#e6f1ff'
    },
    layout: {
      painelContainer: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: 'auto auto',
        gap: '25px',
        padding: '30px'
      },
      senhaAtualContainer: {
        gridColumn: '1',
        gridRow: '1 / span 2',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '50px 20px'
      },
      senhasListContainer: {
        gridColumn: '2',
        gridRow: '1 / span 2'
      }
    }
  },
  
  // Layout horizontal
  horizontal: {
    id: 'horizontal',
    name: 'Horizontal',
    description: 'Layout com disposição horizontal dos elementos',
    colors: { 
      bg: '#f0f4f8', 
      text: '#334e68', 
      senha: '#0f609b',
      header: '#334e68',
      headerText: '#f0f4f8'
    },
    layout: {
      painelContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
        height: 'calc(100vh - 140px)'
      },
      senhaAtualContainer: {
        flex: '0 0 50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      },
      senhasListContainer: {
        flex: '0 0 50%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }
    }
  }
};

export default layoutThemes;