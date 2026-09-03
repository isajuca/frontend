// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/auth';
import { setOnUnauthorizedCallback } from '../api/client';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Registra listener para desconectar automaticamente se o JWT expirar
    setOnUnauthorizedCallback(() => {
      setToken(null);
      setUser(null);
    });

    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@auth_token');
      const storedUser = await AsyncStorage.getItem('@auth_user');

      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData?.id) {
          const localAvatar = await AsyncStorage.getItem(`@user_avatar_${userData.id}`);
          if (localAvatar) {
            userData.avatar_url = localAvatar;
          }
        }
        setToken(storedToken);
        setUser(userData);
      }
    } catch (e) {
      console.warn('Erro ao restaurar sessão local:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, senha) => {
    const res = await authApi.login({ email, senha });
    const { access_token, user: userData } = res.data;

    // Recupera avatar salvo pelo usuário localmente para garantir persistência mesmo se o banco tiver null
    if (userData?.id) {
      const localAvatar = await AsyncStorage.getItem(`@user_avatar_${userData.id}`);
      if (localAvatar) {
        userData.avatar_url = localAvatar;
      }
    }

    await AsyncStorage.setItem('@auth_token', access_token);
    await AsyncStorage.setItem('@auth_user', JSON.stringify(userData));

    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const cadastro = async ({ nome, email, senha, role, chave_mestra }) => {
    const res = await authApi.cadastro({ nome, email, senha, role, chave_mestra });
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignora erro no logout do servidor se offline
    } finally {
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@auth_user');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = async (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    setUser(updated);

    if (user?.id) {
      if (updatedFields.avatar_url) {
        await AsyncStorage.setItem(`@user_avatar_${user.id}`, updatedFields.avatar_url);
        try {
          await authApi.setAvatar(updatedFields.avatar_url);
        } catch (e) {
          console.warn('Tentativa de sincronizar avatar com backend:', e);
        }
      }
      await AsyncStorage.setItem('@auth_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        isProfessor: user?.role === 'professor',
        isAluno: user?.role === 'aluno',
        login,
        cadastro,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
