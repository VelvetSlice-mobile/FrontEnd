<<<<<<< Updated upstream
import React, { createContext, useContext, useState } from 'react';
import { authService } from '../../src/services/api';
=======
import PropTypes from "prop-types";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService, registerSessionExpiredHandler } from "../services/api";
import { deleteUser, getPersistedUser, saveUser } from "../services/database";
>>>>>>> Stashed changes

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
<<<<<<< Updated upstream
  // Use esta linha para teste (como você pediu):
  const [user, setUser] = useState({ id: 1, name: 'Miguel Dev', email: 'teste@teste.com', phone: '(11) 99999-9999' });
  // const [user, setUser] = useState(null); 
=======
  const [user, setUser] = useState(null);

  useEffect(() => {
    const persisted = getPersistedUser();
    if (persisted) setUser(persisted);
  }, []);
>>>>>>> Stashed changes

  const logout = useCallback(() => {
    setUser((prev) => {
      if (prev?.email) deleteUser(prev.email);
      return null;
    });
  }, []);

  useEffect(() => {
    registerSessionExpiredHandler(logout);
    return () => registerSessionExpiredHandler(null);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const result = await authService.register(userData);
      setUser(result);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || "Erro ao registrar" };
    }
  }, []);

<<<<<<< Updated upstream
  const logout = () => {
    setUser(null);
  };


  const updateUserData = async (newData) => {
    try {
      setUser(prev => ({ ...prev, ...newData }));
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      return { success: false, message: "Erro ao salvar alterações localmente." };
=======
  const updateUserData = useCallback(async (newData) => {
    try {
      if (!user?.id) throw new Error("Usuário não autenticado.");

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
      return { success: false, message: error.message || "Erro ao salvar alterações." };
    }
  }, [user]);

  const updateUserAvatar = useCallback(async (imageUri) => {
    try {
      if (!user?.id && !user?.id_cliente) throw new Error("Usuário não autenticado.");

      const userId = user.id ?? user.id_cliente;
      const accessToken = user.accessToken ?? user.access_token;

      if (!accessToken) throw new Error("Sessão expirada. Faça login novamente.");

      const updatedUser = await authService.uploadAvatar(userId, imageUri, accessToken);

      setUser((prev) => {
        const merged = { ...prev, ...updatedUser };
        saveUser(merged);
        return merged;
      });

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || "Não foi possível atualizar a foto." };
>>>>>>> Stashed changes
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUserData,
    updateUserAvatar,
  }), [user, login, register, logout, updateUserData, updateUserAvatar]);

  return (
<<<<<<< Updated upstream
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUserData
      }}
    >
=======
    <AuthContext.Provider value={value}>
>>>>>>> Stashed changes
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };

export const useAuth = () => {
  const context = useContext(AuthContext);
<<<<<<< Updated upstream
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
=======
  if (context === undefined) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
>>>>>>> Stashed changes
  return context;
};