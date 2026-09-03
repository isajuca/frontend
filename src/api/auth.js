// src/api/auth.js
import api from './client';

export const authApi = {
  cadastro: ({ nome, email, senha, role, chave_mestra }) =>
    api.post('/api/auth/cadastro', { nome, email, senha, role, chave_mestra }),

  login: ({ email, senha }) =>
    api.post('/api/auth/login', { email, senha }),

  logout: () =>
    api.post('/api/auth/logout'),

  uploadAvatar: (formData) =>
    api.post('/api/perfil/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};
