// src/api/aluno.js
import api from './client';

export const alunoApi = {
  getDashboard: () =>
    api.get('/api/aluno/dashboard'),

  getMissaoDetalhes: (missaoId) =>
    api.get(`/api/aluno/missoes/${missaoId}`),

  enviarMissao: (missaoId) =>
    api.post('/api/aluno/missoes/enviar', { missao_id: missaoId }),

  entrarSala: (codigo_sala) => {
    const code = String(codigo_sala || '').trim().toUpperCase();
    return api.post('/api/aluno/entrar-sala', {
      codigo_sala: code,
      codigo: code,
      codigo_acesso: code,
    });
  },

  responderQuiz: (quizId, respostas) =>
    api.post(`/api/aluno/quiz/${quizId}/responder`, { respostas }),

  // Catálogo Global de Stickers (Loja)
  getStickersCatalogo: () =>
    api.get('/api/professor/stickers'),

  // Biblioteca de Materiais da Sala
  getBibliotecaSala: (salaId) =>
    api.get(`/api/professor/salas/${salaId}/biblioteca`),
};
