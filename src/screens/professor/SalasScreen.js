// src/screens/professor/SalasScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { professorApi } from '../../api/professor';
import { colors } from '../../theme/colors';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { confirmDialog, notifyAlert } from '../../utils/alert';
import { FloatingMascot } from '../../components/FloatingMascot';

export const SalasScreen = ({ navigation }) => {
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [nomeNovaSala, setNomeNovaSala] = useState('');
  const [creating, setCreating] = useState(false);

  const carregarSalas = useCallback(async () => {
    try {
      const res = await professorApi.listarSalas();
      setSalas(res.data || []);
    } catch (error) {
      notifyAlert('Erro', error.message || 'Falha ao listar salas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarSalas();
    });
    return unsubscribe;
  }, [navigation, carregarSalas]);

  const handleCriarSala = async () => {
    if (!nomeNovaSala.trim()) {
      notifyAlert('Atenção', 'Informe o nome da sala de aula.');
      return;
    }

    try {
      setCreating(true);
      await professorApi.criarSala(nomeNovaSala.trim());
      setNomeNovaSala('');
      setModalVisible(false);
      await carregarSalas();
      notifyAlert('Sucesso!', 'Turma criada com sucesso!');
    } catch (error) {
      notifyAlert('Erro', error.message || 'Falha ao criar sala.');
    } finally {
      setCreating(false);
    }
  };

  const handleExcluirSala = (sala) => {
    confirmDialog(
      'Excluir Sala',
      `Tem certeza que deseja excluir permanentemente a sala "${sala.nome}" e todas as suas missões e equipes?`,
      async () => {
        try {
          await professorApi.excluirSala(sala.id);
          await carregarSalas();
          notifyAlert('Sucesso', 'Sala excluída permanentemente.');
        } catch (error) {
          notifyAlert('Erro', error.message || 'Falha ao excluir sala.');
        }
      },
      'Excluir'
    );
  };

  const renderSalaItem = ({ item }) => (
    <Card
      style={styles.salaCard}
      onPress={() => navigation.navigate('SalaDetalhes', { salaId: item.id, salaNome: item.nome })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleArea}>
          <Text style={styles.salaNome}>{item.nome}</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Código de Acesso: </Text>
            <Text style={styles.codeValue}>{item.codigo_acesso}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleExcluirSala(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={16} color={colors.primary} />
          <Text style={styles.statText}>
            {item.total_alunos} {item.total_alunos === 1 ? 'Aluno' : 'Alunos'}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="flag-outline" size={16} color={colors.secondary} />
          <Text style={styles.statText}>
            {item.total_missoes} {item.total_missoes === 1 ? 'Missão' : 'Missões'}
          </Text>
        </View>

        <View style={styles.arrowIcon}>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Topo com Logo no canto esquerdo e Botão Nova Sala à direita */}
        <View style={styles.topBar}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Button
            title="Nova Turma"
            size="sm"
            onPress={() => setModalVisible(true)}
            icon={<Ionicons name="add" size={16} color="#0B0E2A" />}
          />
        </View>

        <View style={styles.sectionTitleArea}>
          <Text style={styles.pageTitle}>Painel do Docente</Text>
          <Text style={styles.pageSubtitle}>Gerencie suas turmas, quadrimestres e trilhas</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
            data={salas}
            keyExtractor={(item) => item.id}
            renderItem={renderSalaItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  carregarSalas();
                }}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="school-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Nenhuma turma cadastrada</Text>
                <Text style={styles.emptyText}>
                  Crie sua primeira turma para organizar quadrimestres, missões e equipes.
                </Text>
                <Button
                  title="Criar Turma"
                  onPress={() => setModalVisible(true)}
                  style={{ marginTop: 14 }}
                />
              </View>
            }
          />
        )}
      </View>

      {/* Modal de Criação de Sala */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Criar Nova Turma</Text>
            <Text style={styles.modalSubtitle}>
              O código de acesso para os alunos será gerado automaticamente.
            </Text>

            <Input
              label="Nome da Turma"
              placeholder="Ex: TCC - Desenvolvimento de Sistemas"
              value={nomeNovaSala}
              onChangeText={setNomeNovaSala}
              autoFocus
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => {
                  setNomeNovaSala('');
                  setModalVisible(false);
                }}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Criar Turma"
                onPress={handleCriarSala}
                loading={creating}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Mascote Flutuante no Canto Inferior Direito */}
      <FloatingMascot />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logo: {
    width: 180,
    height: 54,
    alignSelf: 'flex-start',
  },
  sectionTitleArea: {
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 24,
  },
  salaCard: {
    padding: 16,
    marginVertical: 6,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleArea: {
    flex: 1,
  },
  salaNome: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  codeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  codeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
  },
  deleteBtn: {
    padding: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  arrowIcon: {
    marginLeft: 'auto',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 300,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
});

