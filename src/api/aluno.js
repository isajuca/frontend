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

  // Biblioteca de Materiais da Sala com fallback inteligente
  getBibliotecaSala: async (salaId, missoesIds = []) => {
    try {
      const res = await api.get(`/api/aluno/salas/${salaId}/biblioteca`);
      return res;
    } catch (e) {
      try {
        const resProf = await api.get(`/api/professor/salas/${salaId}/biblioteca`);
        return resProf;
      } catch (err) {
        // Fallback inteligente: reúne materiais de todas as missões da trilha
        if (missoesIds && missoesIds.length > 0) {
          const promises = missoesIds.map((mid) =>
            api.get(`/api/aluno/missoes/${mid}`).catch(() => null)
          );
          const results = await Promise.all(promises);
          const allMateriais = [];
          results.forEach((r) => {
            if (r?.data?.materiais && Array.isArray(r.data.materiais)) {
              r.data.materiais.forEach((mat) => {
                allMateriais.push({
                  ...mat,
                  missoes: { titulo: r.data.missao?.titulo || 'Missão' },
                });
              });
            }
          });
          return { data: { materiais: allMateriais } };
        }
        return { data: { materiais: [] } };
      }
    }
  },
};
