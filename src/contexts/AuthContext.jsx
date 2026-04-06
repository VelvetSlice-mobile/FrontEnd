import React, { createContext, useContext, useState } from 'react';
import { authService } from '../../src/services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  // Use esta linha para teste (como você pediu):
  const [user, setUser] = useState({ id: 1, name: 'Miguel Dev', email: 'teste@teste.com', phone: '(11) 99999-9999' });
  // const [user, setUser] = useState(null); 

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

  // --- ADICIONE ESTA FUNÇÃO AQUI DENTRO ---
  const updateUserData = async (newData) => {
    try {
      // Atualiza o estado 'user' mantendo o que já tinha e trocando apenas o novo
      setUser(prev => ({ ...prev, ...newData }));
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      return { success: false, message: "Erro ao salvar alterações localmente." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUserData // --- NÃO ESQUEÇA DE EXPORTAR AQUI ---
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