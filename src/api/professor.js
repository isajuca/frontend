// src/api/professor.js
import api from './client';

export const professorApi = {
  // Salas
  listarSalas: () => api.get('/api/professor/salas'),
  criarSala: (nome) => api.post('/api/professor/salas', { nome }),
  detalhesSala: (salaId, periodoId) => {
    const params = periodoId ? { periodo_id: periodoId } : {};
    return api.get(`/api/professor/salas/${salaId}`, { params });
  },
  excluirSala: (salaId) => api.delete(`/api/professor/salas/${salaId}`),

  // Períodos (Quadrimestres)
  listarPeriodos: (salaId) => api.get(`/api/professor/salas/${salaId}/periodos`),
  criarPeriodo: (salaId, { nome, meta_missoes }) =>
    api.post(`/api/professor/salas/${salaId}/periodos`, { nome, meta_missoes }),
  excluirPeriodo: (salaId, periodoId) =>
    api.delete(`/api/professor/salas/${salaId}/periodos/${periodoId}`),

  // Missões
  cadastrarMissao: (salaId, dados) =>
    api.post(`/api/professor/salas/${salaId}/missoes`, dados),
  editarMissao: (salaId, missaoId, dados) =>
    api.put(`/api/professor/salas/${salaId}/missoes/${missaoId}`, dados),
  excluirMissao: (salaId, missaoId) =>
    api.delete(`/api/professor/salas/${salaId}/missoes/${missaoId}`),

  // Stickers
  listarStickers: () => api.get('/api/professor/stickers'),
  cadastrarSticker: (formData) =>
    api.post('/api/professor/stickers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  excluirSticker: (stickerId) =>
    api.delete(`/api/professor/stickers/${stickerId}`),

  // Alunos
  adicionarAluno: (salaId, email) =>
    api.post(`/api/professor/salas/${salaId}/alunos`, { email }),
  removerAluno: (salaId, alunoId) =>
    api.delete(`/api/professor/salas/${salaId}/alunos/${alunoId}`),

  // Equipes
  criarEquipe: (salaId, { nome, periodo_id }) =>
    api.post(`/api/professor/salas/${salaId}/equipes`, { nome, periodo_id }),
  detalhesEquipe: (salaId, equipeId) =>
    api.get(`/api/professor/salas/${salaId}/equipes/${equipeId}`),
  excluirEquipe: (salaId, equipeId) =>
    api.delete(`/api/professor/salas/${salaId}/equipes/${equipeId}`),
  adicionarMembroEquipe: (salaId, equipeId, aluno_id) =>
    api.post(`/api/professor/salas/${salaId}/equipes/${equipeId}/membros`, { aluno_id }),
  removerMembroEquipe: (salaId, equipeId, aluno_id) =>
    api.delete(`/api/professor/salas/${salaId}/equipes/${equipeId}/membros/${aluno_id}`),

  // Entregas & Correções
  listarEntregas: (salaId, { missao_id = '', equipe_id = '', periodo_id = '' } = {}) =>
    api.get(`/api/professor/salas/${salaId}/entregas`, {
      params: { missao_id, equipe_id, periodo_id },
    }),
  verEntrega: (progressoId) =>
    api.get(`/api/professor/entregas/${progressoId}`),
  corrigirEntrega: (progressoId, { nota, feedback_professor }) =>
    api.post(`/api/professor/entregas/${progressoId}/corrigir`, {
      nota,
      feedback_professor,
    }),

  // Pauta & Desempenho
  getPauta: (salaId, periodoId) =>
    api.get(`/api/professor/salas/${salaId}/pauta`, {
      params: periodoId ? { periodo_id: periodoId } : {},
    }),
  getDesempenhoConsolidado: (salaId, periodoId) =>
    api.get(`/api/professor/salas/${salaId}/desempenho-consolidado`, {
      params: periodoId ? { periodo_id: periodoId } : {},
    }),

  // Biblioteca de Materiais
  listarBiblioteca: (salaId, missaoId = '') =>
    api.get(`/api/professor/salas/${salaId}/biblioteca`, {
      params: missaoId ? { missao_id: missaoId } : {},
    }),
  criarMaterial: (salaId, dados) =>
    api.post(`/api/professor/salas/${salaId}/biblioteca`, dados),
  editarMaterial: (salaId, materialId, dados) =>
    api.put(`/api/professor/salas/${salaId}/biblioteca/${materialId}`, dados),
  excluirMaterial: (salaId, materialId) =>
    api.delete(`/api/professor/salas/${salaId}/biblioteca/${materialId}`),

  // Gemini Quiz
  gerarQuizGemini: ({ tema, quantidade = 5, dificuldade = 'medio' }) =>
    api.post('/api/professor/gemini/gerar-quiz', { tema, quantidade, dificuldade }),
};
