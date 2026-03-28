import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(undefined);

/**
 * Provedor de Autenticação
 * Envolve a aplicação para prover estado de usuário e funções de login/logout
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  /**
   * Função de Login
   * @param {string} email 
   * @param {string} pass 
   */
  const login = async (email, pass) => {
    try {
      const apiUrl = 'http://192.168.1.15:3000/api/login'; 

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, senha: pass }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha na autenticação. Verifique suas credenciais.');
      }

      const data = await response.json();
      
      setUser({ 
        id: data.id, 
        name: data.nome,
        email: data.email
      });

    } catch (error) {
      console.error("Erro na comunicação com a API:", error.message);
      throw error;
    }
  };

  /**
   * Função de Logout
   */
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook customizado para usar o contexto de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};