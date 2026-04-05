import React, { createContext, useContext, useState } from 'react';
import { authService } from '../../src/services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // USEI PARA FAZER O TESTE DOS PEDIDOS, COLOQUE A LINHA DE CIMA COMO COMENTÁRIO E DEIXE ESSA ATIVA PARA TESTAR: const [user, setUser] = useState({ id: 1, name: 'Miguel Dev', email: 'teste@teste.com' });
  const login = async (email, password) => {
    try {
      const userData = await authService.login(email, password);
      setUser(userData); 
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      setUser(result);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || "Erro ao registrar" };
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        login, 
        register,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};