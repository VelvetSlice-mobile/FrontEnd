import React, { createContext, ReactNode, useContext, useState } from 'react';


interface User {
  id: string;
  name: string;
  email: string;
}


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, pass: string) => {

    try {
      const apiUrl = 'http://192.168.1.15:3000/api/login'; //Ip deve ser configurado para o Ip atual seja máquina ou celular

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, senha: pass }),
      });

      if (!response.ok) {
        throw new Error('Falha na autenticação. Verifica as tuas credenciais.');
      }

      
      const data = await response.json();
      
      setUser({ 
        id: data.id, 
        name: data.nome,
        email: data.email
      });

    } catch (error) {
      console.error("Erro na comunicação com a API real:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};