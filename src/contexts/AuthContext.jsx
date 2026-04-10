import React, { createContext, useContext, useState } from 'react';
import { authService } from '../../src/services/api';

const AuthContext = createContext(undefined);

const normalizeUser = (userData) => {
  if (!userData) return null;

  return {
    ...userData,
    id: userData.id ?? userData.id_cliente,
    id_cliente: userData.id_cliente ?? userData.id,
    name: userData.name ?? userData.nome,
    nome: userData.nome ?? userData.name,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(normalizeUser({ id: 1, name: 'Usuário Teste', email: 'teste@email.com' }));

  const login = async (email, password) => {
    try {
      const userData = await authService.login(email, password);
      setUser(normalizeUser(userData));  
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      setUser(normalizeUser(result));
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
<<<<<<< HEAD
        logout 
=======
        logout 
>>>>>>> parent of db191ac (implementa fluxos de edição de perfil com validações)
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
