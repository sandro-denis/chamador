import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  overflow: hidden;
  
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
`;

const LoginCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 35px;
  width: 100%;
  max-width: 400px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
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
    background: linear-gradient(90deg, #3498db, #2ecc71, #e74c3c);
    z-index: 1;
  }
`;

const Title = styled.h2`
  font-size: 28px;
  margin-bottom: 30px;
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
    z-index: 1;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Input = styled.input`
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
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
`;

const Button = styled.button`
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
  }
  
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(52, 152, 219, 0.3);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
  margin-top: 15px;
  padding: 10px;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 8px;
  border-left: 3px solid #e74c3c;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const RegisterLink = styled.button`
  background: none;
  border: none;
  color: #3498db;
  font-size: 15px;
  cursor: pointer;
  padding: 8px 12px;
  margin-top: 20px;
  transition: all 0.3s ease;
  border-radius: 6px;
  display: block;
  width: 100%;
  text-align: center;
  
  &:hover {
    background-color: rgba(52, 152, 219, 0.1);
    color: #2980b9;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
`;

const ToggleButton = styled(RegisterLink)`
  margin-top: 15px;
  font-size: 14px;
  color: #7f8c8d;
  
  &:hover {
    color: #3498db;
    background-color: rgba(52, 152, 219, 0.1);
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('Renderizando Login:', { showRegister, email, error, loading });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const trimmedEmail = email?.trim();
      const trimmedPassword = password?.trim();
      const trimmedCompanyName = companyName?.trim();

      console.log('Tentando autenticar:', { 
        showRegister, 
        email: trimmedEmail, 
        companyName: trimmedCompanyName,
        passwordLength: trimmedPassword?.length 
      });

      if (!trimmedEmail) {
        throw new Error('Email é obrigatório');
      }

      if (!trimmedPassword) {
        throw new Error('Senha é obrigatória');
      }

      if (showRegister && !trimmedCompanyName) {
        throw new Error('Nome da empresa é obrigatório');
      }

      try {
        if (showRegister) {
          console.log('Iniciando processo de registro...');
          await register(trimmedEmail, trimmedPassword, trimmedCompanyName);
          console.log('Registro concluído com sucesso');
        } else {
          console.log('Iniciando processo de login...');
          await login(trimmedEmail, trimmedPassword);
          console.log('Login concluído com sucesso');
        }

        // Aguardar um momento para garantir que o token foi salvo
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirecionar para a página inicial
        navigate('/', { replace: true });
      } catch (authError) {
        console.error('Erro na autenticação:', {
          name: authError.name,
          message: authError.message,
          status: authError.response?.status,
          statusText: authError.response?.statusText,
          data: authError.response?.data
        });
        throw authError;
      }
    } catch (error) {
      console.error('Erro detalhado:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao fazer login. Verifique suas credenciais.';
      console.log('Mensagem de erro:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <LoginCard>
        <Title>{showRegister ? 'Cadastro' : 'Login'}</Title>
        <Form onSubmit={handleSubmit}>
          {showRegister && (
            <FormGroup>
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Digite o nome da empresa"
                required
              />
            </FormGroup>
          )}
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="password">Senha</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </FormGroup>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Carregando...' : (showRegister ? 'Cadastrar' : 'Entrar')}
          </Button>
        </Form>
        <ToggleButton onClick={() => setShowRegister(!showRegister)}>
          {showRegister ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Cadastre-se'}
        </ToggleButton>
      </LoginCard>
    </Container>
  );
};

export default Login;