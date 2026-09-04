// src/screens/professor/EntregasScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { professorApi } from '../../api/professor';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';

export const EntregasScreen = ({ route, navigation }) => {
  const { salaId, salaNome } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [entregas, setEntregas] = useState([]);
  const [missoes, setMissoes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [resumo, setResumo] = useState({ total: 0, pendentes: 0, corrigidas: 0 });

  const [filtroMissao, setFiltroMissao] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');

  const carregarEntregas = useCallback(async () => {
    try {
      const res = await professorApi.listarEntregas(salaId, {
        missao_id: filtroMissao,
        periodo_id: filtroPeriodo,
      });
      setEntregas(res.data?.entregas || []);
      setMissoes(res.data?.missoes || []);
      setPeriodos(res.data?.periodos || []);
      setResumo(res.data?.resumo || { total: 0, pendentes: 0, corrigidas: 0 });
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao listar entregas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [salaId, filtroMissao, filtroPeriodo]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarEntregas();
    });
    return unsubscribe;
  }, [navigation, carregarEntregas]);

  const renderItem = ({ item }) => {
    const isCorrigido = item.status === 'corrigido';
    return (
      <Card
        style={styles.entregaCard}
        onPress={() => navigation.navigate('Correcao', { progressoId: item.id, entrega: item })}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Badge
              label={isCorrigido ? 'Corrigido' : 'Pendente de Correção'}
              status={isCorrigido ? 'concluida' : 'entregue'}
            />
            <Text style={styles.missaoTitulo}>{item.titulo_missao}</Text>
          </View>
          {isCorrigido && (
            <View style={styles.gradeBox}>
              <Text style={styles.gradeText}>Nota</Text>
              <Text style={styles.gradeValue}>{Number(item.nota).toFixed(1)}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.studentInfo}>
          <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.studentName}>{item.perfis?.nome || 'Aluno'}</Text>
          <Text style={styles.teamName}>• {item.nome_equipe}</Text>
        </View>

        {item.entregue_em && (
          <Text style={styles.dateText}>
            Enviado em: {new Date(item.entregue_em).toLocaleString('pt-BR')}
          </Text>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Entregas da Turma"
        subtitle={salaNome}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.container}>
        {/* Resumo em Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.summaryNumber}>{resumo.total}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.infoLight }]}>
            <Text style={[styles.summaryNumber, { color: colors.info }]}>{resumo.pendentes}</Text>
            <Text style={[styles.summaryLabel, { color: colors.info }]}>Pendentes</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.summaryNumber, { color: colors.success }]}>{resumo.corrigidas}</Text>
            <Text style={[styles.summaryLabel, { color: colors.success }]}>Corrigidas</Text>
          </View>
        </View>

        {/* Filtros de Quadrimestre */}
        {periodos.length > 0 && (
          <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, !filtroPeriodo && styles.filterChipActive]}
              onPress={() => setFiltroPeriodo('')}
            >
              <Text style={[styles.filterChipText, !filtroPeriodo && styles.filterChipTextActive]}>
                Todos os Períodos
              </Text>
            </TouchableOpacity>
            {periodos.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.filterChip, filtroPeriodo === p.id && styles.filterChipActive]}
                onPress={() => setFiltroPeriodo(p.id)}
              >
                <Text style={[styles.filterChipText, filtroPeriodo === p.id && styles.filterChipTextActive]}>
                  {p.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
            data={entregas}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  carregarEntregas();
                }}
              />
            }
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <Ionicons name="document-text-outline" size={40} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Nenhuma entrega encontrada</Text>
                <Text style={styles.emptySubtitle}>
                  Quando os alunos marcarem missões como concluídas, elas aparecerão aqui para avaliação.
                </Text>
              </Card>
            }
          />
        )}
      </View>
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
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },
  filterScroll: {
    maxHeight: 40,
    marginBottom: 10,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  entregaCard: {
    marginVertical: 5,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  missaoTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 6,
  },
  gradeBox: {
    backgroundColor: colors.successLight,
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  gradeText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '600',
  },
  gradeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studentName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  teamName: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 30,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});

