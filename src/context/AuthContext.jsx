import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  register as registerUser,
  login as loginUser,
  logout as logoutUser,
  isAuthenticated as checkAuth,
  getCurrentUser,
  updateUserConfig
} from '../config/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        if (checkAuth()) {
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // Se não conseguir obter os dados do usuário, faz logout
            await logout();
          }
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        setError(error.message);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const register = async (email, password, companyName) => {
    try {
      setLoading(true);
      setError(null);
      const { user: newUser } = await registerUser(email, password, companyName);
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error('Erro no registro:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { user: loggedUser } = await loginUser(email, password);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      console.error('Erro no login:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (config) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await updateUserConfig(config);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateConfig,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};