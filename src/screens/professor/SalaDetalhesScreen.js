// src/screens/professor/SalaDetalhesScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { professorApi } from '../../api/professor';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { confirmDialog, notifyAlert } from '../../utils/alert';
import { FloatingMascot } from '../../components/FloatingMascot';

export const SalaDetalhesScreen = ({ route, navigation }) => {
  const { salaId, salaNome } = route.params;

  const [activeTab, setActiveTab] = useState('periodos'); // 'periodos' | 'missoes' | 'alunos' | 'equipes'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modais de Criação Rápida
  const [modalPeriodo, setModalPeriodo] = useState(false);
  const [nomePeriodo, setNomePeriodo] = useState('');
  const [metaPeriodo, setMetaPeriodo] = useState('5');
  const [modalAluno, setModalAluno] = useState(false);
  const [emailAluno, setEmailAluno] = useState('');
  const [modalEquipe, setModalEquipe] = useState(false);
  const [nomeEquipe, setNomeEquipe] = useState('');
  const [periodoEquipeId, setPeriodoEquipeId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [totalPendentes, setTotalPendentes] = useState(0);

  const carregarDetalhes = useCallback(async () => {
    try {
      const [res, resEntregas] = await Promise.all([
        professorApi.detalhesSala(salaId),
        professorApi.listarEntregas(salaId).catch(() => null),
      ]);
      setData(res.data);
      if (resEntregas?.data?.resumo?.pendentes !== undefined) {
        setTotalPendentes(resEntregas.data.resumo.pendentes);
      }
    } catch (error) {
      notifyAlert('Erro', error.message || 'Falha ao carregar detalhes da sala.');
    } finally {
      setLoading(false);
    }
  }, [salaId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarDetalhes();
    });
    return unsubscribe;
  }, [navigation, carregarDetalhes]);

  // Períodos
  const handleCriarPeriodo = async () => {
    if (!nomePeriodo.trim()) {
      notifyAlert('Atenção', 'Informe o nome do período (ex: 1º Quadrimestre).');
      return;
    }
    try {
      setSubmitting(true);
      await professorApi.criarPeriodo(salaId, {
        nome: nomePeriodo.trim(),
        meta_missoes: parseInt(metaPeriodo, 10) || 5,
      });
      setNomePeriodo('');
      setModalPeriodo(false);
      await carregarDetalhes();
      notifyAlert('Sucesso!', 'Quadrimestre criado com sucesso!');
    } catch (error) {
      notifyAlert('Erro', error.message || 'Falha ao criar período.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExcluirPeriodo = (periodo) => {
    confirmDialog('Excluir Período', `Excluir "${periodo.nome}"?`, async () => {
      try {
        await professorApi.excluirPeriodo(salaId, periodo.id);
        await carregarDetalhes();
      } catch (e) {
        notifyAlert('Erro', e.message);
      }
    }, 'Excluir');
  };

  // Alunos
  const handleAdicionarAluno = async () => {
    if (!emailAluno.trim()) {
      notifyAlert('Atenção', 'Informe o e-mail do aluno.');
      return;
    }
    try {
      setSubmitting(true);
      await professorApi.adicionarAluno(salaId, emailAluno.trim());
      setEmailAluno('');
      setModalAluno(false);
      await carregarDetalhes();
      notifyAlert('Sucesso', 'Aluno matriculado na sala!');
    } catch (error) {
      notifyAlert('Erro', error.message || 'Falha ao adicionar aluno.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoverAluno = (aluno) => {
    confirmDialog('Remover Aluno', `Remover "${aluno.nome}" da sala?`, async () => {
      try {
        await professorApi.removerAluno(salaId, aluno.id);
        await carregarDetalhes();
      } catch (e) {
        notifyAlert('Erro', e.message);
      }
    }, 'Remover');
  };

  // Equipes
  const handleCriarEquipe = async () => {
    if (!nomeEquipe.trim()) {
      notifyAlert('Atenção', 'Informe o nome da equipe.');
      return;
    }
    if (!periodoEquipeId) {
      notifyAlert('Atenção', 'Selecione o quadrimestre da equipe.');
      return;
    }
    try {
      setSubmitting(true);
      await professorApi.criarEquipe(salaId, {
        nome: nomeEquipe.trim(),
        periodo_id: periodoEquipeId,
      });
      setNomeEquipe('');
      setPeriodoEquipeId('');
      setModalEquipe(false);
      await carregarDetalhes();
      notifyAlert('Sucesso!', 'Equipe criada com sucesso!');
    } catch (error) {
      notifyAlert('Erro', error.message || 'Falha ao criar equipe.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExcluirEquipe = (equipe) => {
    confirmDialog('Excluir Equipe', `Excluir equipe "${equipe.nome}"?`, async () => {
      try {
        await professorApi.excluirEquipe(salaId, equipe.id);
        carregarDetalhes();
      } catch (e) {
        Alert.alert('Erro', e.message);
      }
    }, 'Excluir');
  };

  // Missão
  const handleExcluirMissao = (missao) => {
    confirmDialog('Excluir Missão', `Deseja remover a missão "${missao.titulo}"?`, async () => {
      try {
        await professorApi.excluirMissao(salaId, missao.id);
        carregarDetalhes();
      } catch (e) {
        Alert.alert('Erro', e.message);
      }
    }, 'Excluir');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={salaNome || 'Sala'} onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const periodos = data?.periodos || [];
  const missoes = data?.missoes || [];
  const alunos = data?.alunos || [];
  const equipes = data?.equipes || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={data?.sala?.nome || salaNome}
        subtitle={`Código: ${data?.sala?.codigo_acesso || ''}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Ações Rápidas da Sala */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, totalPendentes > 0 && styles.actionCardPending]}
            onPress={() => navigation.navigate('Entregas', { salaId, salaNome })}
          >
            <View
              style={[
                styles.actionIconCircle,
                {
                  backgroundColor: totalPendentes > 0 ? colors.dangerLight : colors.primaryLight,
                },
              ]}
            >
              <Ionicons
                name="checkbox-outline"
                size={20}
                color={totalPendentes > 0 ? colors.danger : colors.primary}
              />
              {totalPendentes > 0 && (
                <View style={styles.badgePendingCount}>
                  <Text style={styles.badgePendingText}>{totalPendentes}</Text>
                </View>
              )}
            </View>
            <Text style={styles.actionCardText}>Entregas</Text>
            {totalPendentes > 0 ? (
              <Text style={styles.actionSubPendingText}>{totalPendentes} pendente(s)</Text>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Pauta', { salaId, salaNome })}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.successLight }]}>
              <Ionicons name="bar-chart-outline" size={20} color={colors.success} />
            </View>
            <Text style={styles.actionCardText}>Pauta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Biblioteca', { salaId, salaNome })}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="book-outline" size={20} color={colors.warning} />
            </View>
            <Text style={styles.actionCardText}>Biblioteca</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('GerarQuiz', { salaId, salaNome })}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="sparkles-outline" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.actionCardText}>IA Quiz</Text>
          </TouchableOpacity>
        </View>

        {/* Abas de Navegação */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'periodos' && styles.tabButtonActive]}
            onPress={() => setActiveTab('periodos')}
          >
            <Text style={[styles.tabText, activeTab === 'periodos' && styles.tabTextActive]}>
              Períodos ({periodos.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'missoes' && styles.tabButtonActive]}
            onPress={() => setActiveTab('missoes')}
          >
            <Text style={[styles.tabText, activeTab === 'missoes' && styles.tabTextActive]}>
              Missões ({missoes.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'equipes' && styles.tabButtonActive]}
            onPress={() => setActiveTab('equipes')}
          >
            <Text style={[styles.tabText, activeTab === 'equipes' && styles.tabTextActive]}>
              Equipes ({equipes.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'alunos' && styles.tabButtonActive]}
            onPress={() => setActiveTab('alunos')}
          >
            <Text style={[styles.tabText, activeTab === 'alunos' && styles.tabTextActive]}>
              Alunos ({alunos.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo das Abas */}

        {/* ABA: PERÍODOS */}
        {activeTab === 'periodos' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quadrimestres / Períodos</Text>
              <Button
                title="Novo Período"
                size="sm"
                onPress={() => setModalPeriodo(true)}
                icon={<Ionicons name="add" size={16} color="#FFFFFF" />}
              />
            </View>

            {periodos.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>Nenhum período criado ainda.</Text>
              </Card>
            ) : (
              periodos.map((p) => (
                <Card key={p.id} style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{p.nome}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleExcluirPeriodo(p)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </Card>
              ))
            )}
          </View>
        )}

        {/* ABA: MISSÕES */}
        {activeTab === 'missoes' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trilha de Missões</Text>
              <Button
                title="Cadastrar Missão"
                size="sm"
                onPress={() =>
                  navigation.navigate('MissoesGerenciar', {
                    salaId,
                    periodos,
                  })
                }
                icon={<Ionicons name="add" size={16} color="#FFFFFF" />}
              />
            </View>

            {missoes.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>Nenhuma missão cadastrada nesta sala.</Text>
              </Card>
            ) : (
              missoes.map((m) => {
                const periodoNome = periodos.find((p) => p.id === m.periodo_id)?.nome;
                return (
                  <Card key={m.id} style={styles.itemCard}>
                    <View style={styles.itemContent}>
                      <View style={styles.badgeRow}>
                        <Badge label={`#${m.ordem}`} status="disponivel" />
                        {periodoNome ? <Badge label={periodoNome} /> : null}
                        <Badge label={`${m.xp_reward || 0} XP`} status="corrigida_sem_validacao" />
                      </View>
                      <Text style={styles.itemTitle}>{m.titulo}</Text>
                      {m.descricao ? (
                        <Text style={styles.itemSubtitle} numberOfLines={2}>
                          {m.descricao}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('MissoesGerenciar', {
                            salaId,
                            periodos,
                            missao: m,
                          })
                        }
                        style={styles.iconBtn}
                      >
                        <Ionicons name="pencil-outline" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleExcluirMissao(m)}
                        style={styles.iconBtn}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        )}

        {/* ABA: EQUIPES */}
        {activeTab === 'equipes' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Equipes da Turma</Text>
              <Button
                title="Nova Equipe"
                size="sm"
                onPress={() => {
                  if (periodos.length === 0) {
                    Alert.alert('Atenção', 'Crie pelo menos um período antes de cadastrar equipes.');
                    return;
                  }
                  setPeriodoEquipeId(periodos[0].id);
                  setModalEquipe(true);
                }}
                icon={<Ionicons name="add" size={16} color="#FFFFFF" />}
              />
            </View>

            {equipes.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>Nenhuma equipe cadastrada.</Text>
              </Card>
            ) : (
              equipes.map((eq) => (
                <Card
                  key={eq.id}
                  style={styles.itemCard}
                  onPress={() =>
                    navigation.navigate('EquipesGerenciar', {
                      salaId,
                      equipeId: eq.id,
                      equipeNome: eq.nome,
                    })
                  }
                >
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{eq.nome}</Text>
                    {eq.periodos?.nome ? (
                      <Badge label={eq.periodos.nome} style={{ marginTop: 4 }} />
                    ) : null}
                  </View>
                  <View style={styles.itemActions}>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    <TouchableOpacity
                      onPress={() => handleExcluirEquipe(eq)}
                      style={[styles.iconBtn, { marginLeft: 10 }]}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* ABA: ALUNOS */}
        {activeTab === 'alunos' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Estudantes Matriculados</Text>
              <Button
                title="Adicionar Aluno"
                size="sm"
                onPress={() => setModalAluno(true)}
                icon={<Ionicons name="add" size={16} color="#FFFFFF" />}
              />
            </View>

            {alunos.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>
                  Nenhum aluno matriculado. Forneça o código da sala ou adicione por e-mail.
                </Text>
              </Card>
            ) : (
              alunos.map((a) => (
                <Card key={a.id} style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{a.nome}</Text>
                    <Text style={styles.itemSubtitle}>{a.email}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoverAluno(a)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="person-remove-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </Card>
              ))
            )}
          </View>
        )}

        {/* Modal: Novo Período */}
        <Modal
          visible={modalPeriodo}
          transparent
          animationType="fade"
          onRequestClose={() => setModalPeriodo(false)}
        >
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Novo Quadrimestre / Período</Text>
              <Input
                label="Nome do Período"
                placeholder="Ex: 1º Quadrimestre"
                value={nomePeriodo}
                onChangeText={setNomePeriodo}
              />
              <Input
                label="Meta de Missões"
                placeholder="5"
                value={metaPeriodo}
                onChangeText={setMetaPeriodo}
                keyboardType="numeric"
              />
              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  variant="secondary"
                  onPress={() => setModalPeriodo(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Salvar"
                  onPress={handleCriarPeriodo}
                  loading={submitting}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          </View>
        </Modal>

        {/* Modal: Adicionar Aluno */}
        <Modal
          visible={modalAluno}
          transparent
          animationType="fade"
          onRequestClose={() => setModalAluno(false)}
        >
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Matricular Aluno</Text>
              <Text style={styles.modalSubtitle}>
                O aluno precisa ter criado conta na plataforma previamente.
              </Text>
              <Input
                label="E-mail do Aluno"
                placeholder="aluno@email.com"
                value={emailAluno}
                onChangeText={setEmailAluno}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  variant="secondary"
                  onPress={() => setModalAluno(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Adicionar"
                  onPress={handleAdicionarAluno}
                  loading={submitting}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          </View>
        </Modal>

        {/* Modal: Nova Equipe */}
        <Modal
          visible={modalEquipe}
          transparent
          animationType="fade"
          onRequestClose={() => setModalEquipe(false)}
        >
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Nova Equipe</Text>
              <Input
                label="Nome da Equipe"
                placeholder="Ex: Grupo Alpha"
                value={nomeEquipe}
                onChangeText={setNomeEquipe}
              />

              <Text style={styles.fieldLabel}>Quadrimestre / Período</Text>
              <View style={styles.periodPicker}>
                {periodos.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.periodChip,
                      periodoEquipeId === p.id && styles.periodChipActive,
                    ]}
                    onPress={() => setPeriodoEquipeId(p.id)}
                  >
                    <Text
                      style={[
                        styles.periodChipText,
                        periodoEquipeId === p.id && styles.periodChipTextActive,
                      ]}
                    >
                      {p.nome}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  variant="secondary"
                  onPress={() => setModalEquipe(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Salvar"
                  onPress={handleCriarEquipe}
                  loading={submitting}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          </View>
        </Modal>
      </ScrollView>

      {/* Mascote Flutuante no Canto Inferior Direito */}
      <FloatingMascot />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
  },
  container: {
    padding: 16,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  actionCardPending: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  badgePendingCount: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#0B0E2A',
  },
  badgePendingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  actionCardText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionSubPendingText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.danger,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    padding: 12,
  },
  itemContent: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCardText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 6,
  },
  periodPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  periodChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  periodChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  periodChipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  periodChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
});
