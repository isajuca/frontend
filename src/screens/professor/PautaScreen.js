// src/screens/professor/PautaScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { professorApi } from '../../api/professor';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';

export const PautaScreen = ({ route, navigation }) => {
  const { salaId, salaNome } = route.params;

  const [loading, setLoading] = useState(true);
  const [pautaData, setPautaData] = useState([]);
  const [missoes, setMissoes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [filtroPeriodo, setFiltroPeriodo] = useState('');

  const carregarPauta = useCallback(async () => {
    try {
      setLoading(true);
      const res = await professorApi.getPauta(salaId, filtroPeriodo);
      setPautaData(res.data?.pauta_data || []);
      setMissoes(res.data?.missoes || []);
      setQuizzes(res.data?.quizzes || []);
      setPeriodos(res.data?.periodos || []);
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao carregar pauta.');
    } finally {
      setLoading(false);
    }
  }, [salaId, filtroPeriodo]);

  useEffect(() => {
    carregarPauta();
  }, [carregarPauta]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Pauta de Avaliação"
        subtitle={salaNome}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.container}>
        {/* Filtro de Período */}
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
          <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {pautaData.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="stats-chart-outline" size={40} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Nenhum registro de notas</Text>
                <Text style={styles.emptySubtitle}>
                  Conforme os alunos realizarem missões e quizzes, as notas consolidadas serão exibidas aqui.
                </Text>
              </Card>
            ) : (
              pautaData.map((item) => {
                const aluno = item.aluno;
                const mediaFinal = item.media;
                return (
                  <Card key={aluno.id} style={styles.studentCard}>
                    <View style={styles.cardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.studentName}>{aluno.nome}</Text>
                        <Text style={styles.teamText}>Equipe: {item.equipe_nome}</Text>
                      </View>
                      <View style={styles.mediaBadge}>
                        <Text style={styles.mediaLabel}>Média Final</Text>
                        <Text style={styles.mediaValue}>
                          {mediaFinal !== null ? Number(mediaFinal).toFixed(1) : '—'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Notas de Missões */}
                    <Text style={styles.sectionHeading}>Missões Entregues</Text>
                    <View style={styles.gradesGrid}>
                      {missoes.map((m) => {
                        const n = item.notas[m.id];
                        return (
                          <View key={m.id} style={styles.gradeItem}>
                            <Text style={styles.gradeItemLabel} numberOfLines={1}>
                              {m.titulo}
                            </Text>
                            <Text style={[styles.gradeItemVal, n !== null ? styles.gradeFilled : null]}>
                              {n !== null && n !== undefined ? Number(n).toFixed(1) : '—'}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    {/* Médias Parciais */}
                    <View style={styles.averagesRow}>
                      <View style={styles.avgItem}>
                        <Text style={styles.avgLabel}>Média Missões:</Text>
                        <Text style={styles.avgValue}>
                          {item.media_missoes !== null ? Number(item.media_missoes).toFixed(1) : '—'}
                        </Text>
                      </View>

                      <View style={styles.avgItem}>
                        <Text style={styles.avgLabel}>Média Quizzes:</Text>
                        <Text style={styles.avgValue}>
                          {item.media_quizzes !== null ? Number(item.media_quizzes).toFixed(1) : '—'}
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              })
            )}
          </ScrollView>
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
  filterScroll: {
    maxHeight: 42,
    marginVertical: 10,
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
  scrollContent: {
    paddingBottom: 24,
  },
  studentCard: {
    marginVertical: 6,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  teamText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mediaBadge: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  mediaLabel: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  mediaValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  gradesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gradeItem: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 70,
  },
  gradeItemLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    maxWidth: 90,
  },
  gradeItemVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 2,
  },
  gradeFilled: {
    color: colors.textPrimary,
  },
  averagesRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  avgItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  avgLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  avgValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
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

