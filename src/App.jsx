import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { SenhaProvider } from './context/SenhaContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import GerarSenha from './pages/GerarSenha'
import ChamarSenha from './pages/ChamarSenha'
import PainelSenhas from './pages/PainelSenhas'
import Estatisticas from './pages/Estatisticas'
import ConfiguracaoLayout from './pages/ConfiguracaoLayout'
import Login from './pages/Login'
import { FaTicketAlt, FaBell, FaDesktop, FaChartBar, FaCog, FaSignOutAlt, FaUserCircle } from 'react-icons/fa'
import AcompanharSenha from './pages/AcompanharSenha'

const Container = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: ${props => props.$isPublico ? '0' : '20px'};
`

const Nav = styled.nav`
  background: linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%);
  padding: 15px 25px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #3498db, #2ecc71, #e74c3c);
    z-index: 1;
  }
`

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`

const NavItem = styled.li`
  a {
    color: white;
    text-decoration: none;
    font-size: 15px;
    font-weight: 500;
    padding: 10px 16px;
    border-radius: 8px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(5px);
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    &.active {
      background: rgba(52, 152, 219, 0.3);
      box-shadow: 0 0 15px rgba(52, 152, 219, 0.5);
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: #3498db;
        z-index: 2;
      }
    }
    
    svg {
      font-size: 18px;
    }
  }
`

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: auto;
  padding-left: 20px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 30px;
    width: 1px;
    background: rgba(255, 255, 255, 0.2);
  }
`

const CompanyName = styled.div`
  color: white;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    font-size: 18px;
    color: #3498db;
  }
`

const LogoutButton = styled.button`
  background-color: rgba(231, 76, 60, 0.2);
  color: white;
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: rgba(231, 76, 60, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
  }
  
  svg {
    font-size: 16px;
  }
`

// Componente para proteger rotas que requerem autenticação
// Movido para dentro do AppContent para ter acesso ao contexto de autenticação

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

const AppContent = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  // Verificação para páginas públicas, incluindo acompanhamento de senha via QR code
  const isPublico = location.pathname === '/painel-publico' || 
                   location.pathname === '/gerar-senha-publico' || 
                   location.pathname === '/login' || 
                   location.pathname.includes('/acompanhar/')
  
  // Componente para proteger rotas que requerem autenticação
  const PrivateRoute = ({ children }) => {
    if (!user && !isPublico) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <SenhaProvider>
      <Container $isPublico={isPublico}>
        {!isPublico && (
          <Nav>
            <NavList>
              <NavItem>
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                  <FaTicketAlt /> Gerar Senha
                </Link>
              </NavItem>
              <NavItem>
                <Link to="/chamar" className={location.pathname === '/chamar' ? 'active' : ''}>
                  <FaBell /> Chamar Senha
                </Link>
              </NavItem>
              <NavItem>
                <Link to="/painel" className={location.pathname === '/painel' ? 'active' : ''}>
                  <FaDesktop /> Painel de Senhas
                </Link>
              </NavItem>
              <NavItem>
                <Link to="/estatisticas" className={location.pathname === '/estatisticas' ? 'active' : ''}>
                  <FaChartBar /> Estatísticas
                </Link>
              </NavItem>
              <NavItem>
                <Link to="/configuracao" className={location.pathname === '/configuracao' ? 'active' : ''}>
                  <FaCog /> Configuração
                </Link>
              </NavItem>
            </NavList>
            <UserSection>
              {user && (
                <CompanyName>
                  <FaUserCircle /> Olá, {user.companyName}
                </CompanyName>
              )}
              <LogoutButton onClick={() => {
                logout();
                window.location.href = '/login';
              }}>
                <FaSignOutAlt /> Sair
              </LogoutButton>
            </UserSection>
          </Nav>
        )}
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><GerarSenha /></PrivateRoute>} />
          <Route path="/chamar" element={<PrivateRoute><ChamarSenha /></PrivateRoute>} />
          <Route path="/painel" element={<PrivateRoute><PainelSenhas /></PrivateRoute>} />
          <Route path="/estatisticas" element={<PrivateRoute><Estatisticas /></PrivateRoute>} />
          <Route path="/configuracao" element={<PrivateRoute><ConfiguracaoLayout /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/painel-publico" element={<PainelSenhas isPublico={true} />} />
          <Route path="/gerar-senha-publico" element={<GerarSenha />} />
          <Route path="/acompanhar/:id" element={<AcompanharSenha />} />
        </Routes>
      </Container>
    </SenhaProvider>
  )
}

export default App