// src/api/client.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL da API hospedada no Render
export const API_BASE_URL = 'https://steam-project-backend.onrender.com';

let onUnauthorizedCallback = null;

export const setOnUnauthorizedCallback = (cb) => {
  onUnauthorizedCallback = cb;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 35000, // 35 segundos para suportar inicialização (cold start) do Render
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar JWT Token em cada requisição
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Erro ao obter token do storage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para padronizar tratamento de erro e expiração de sessão
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status;
    let errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message;

    const isTokenExpired =
      status === 401 ||
      (typeof errorMsg === 'string' &&
        (errorMsg.toLowerCase().includes('token is expired') ||
          errorMsg.toLowerCase().includes('invalid jwt') ||
          errorMsg.toLowerCase().includes('token has invalid claims') ||
          errorMsg.toLowerCase().includes('falha na autenticação')));

    if (isTokenExpired) {
      try {
        await AsyncStorage.removeItem('@auth_token');
        await AsyncStorage.removeItem('@auth_user');
      } catch (e) {}

      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      errorMsg = 'Sua sessão expirou por segurança. Por favor, faça login novamente.';
    }

    if (!errorMsg) {
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        errorMsg = 'Não foi possível conectar ao servidor backend no Render. O servidor pode estar iniciando (aguarde alguns segundos e tente novamente).';
      } else if (error.code === 'ECONNABORTED') {
        errorMsg = 'O servidor demorou para responder. Tente novamente em alguns instantes.';
      } else {
        errorMsg = error.message || 'Ocorreu um erro inesperado.';
      }
    }

    return Promise.reject(new Error(errorMsg));
  }
);

export default api;
