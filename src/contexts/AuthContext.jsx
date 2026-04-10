import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/api";
import { deleteUser, getPersistedUser, saveUser } from "../services/database";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const persisted = getPersistedUser();
    if (persisted) {
      setUser(persisted);
    }
  }, []);

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
    if (user?.email) {
      deleteUser(user.email);
    }
    setUser(null);
  };

  const updateUserData = async (newData) => {
    try {
      if (!user?.id) {
        throw new Error("Usuário não autenticado.");
      }

      await authService.updateProfile(user.id, {
        name: newData.name ?? user.name,
        email: newData.email ?? user.email,
        phone: newData.phone ?? user.phone,
      });

      setUser((prev) => {
        const updated = { ...prev, ...newData };
        saveUser(updated);
        return updated;
      });
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      return {
        success: false,
        message: error.message || "Erro ao salvar alterações localmente.",
      };
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
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
