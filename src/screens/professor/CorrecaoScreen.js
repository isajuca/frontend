// src/screens/professor/CorrecaoScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
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

export const CorrecaoScreen = ({ route, navigation }) => {
  const { progressoId } = route.params;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [nota, setNota] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    carregarEntrega();
  }, [progressoId]);

  const carregarEntrega = async () => {
    try {
      const res = await professorApi.verEntrega(progressoId);
      setData(res.data);
      if (res.data?.progresso) {
        const p = res.data.progresso;
        if (p.nota !== null && p.nota !== undefined) {
          setNota(String(p.nota));
        }
        if (p.comentario_professor) {
          setFeedback(p.comentario_professor);
        }
      }
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao carregar dados da entrega.');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarCorrecao = async () => {
    const numNota = parseFloat(nota);
    if (isNaN(numNota) || numNota < 0 || numNota > 10) {
      Alert.alert('Atenção', 'Informe uma nota válida entre 0 e 10.');
      return;
    }

    try {
      setSubmitting(true);
      await professorApi.corrigirEntrega(progressoId, {
        nota: numNota,
        feedback_professor: feedback.trim(),
      });
      Alert.alert('Sucesso', 'Entrega corrigida e validada! O aluno receberá o sticker correspondente.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao salvar correção.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Avaliar Entrega" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const progresso = data?.progresso;
  const aluno = progresso?.perfis;
  const missao = progresso?.missoes;
  const equipe = data?.equipe;
  const membros = data?.membros || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Avaliar Entrega" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Card do Aluno e Equipe */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Estudante & Equipe</Text>

          <View style={styles.rowItem}>
            <Text style={styles.label}>Aluno:</Text>
            <Text style={styles.value}>{aluno?.nome} ({aluno?.email})</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>Equipe:</Text>
            <Text style={styles.value}>{equipe ? equipe.nome : 'Sem equipe vinculada'}</Text>
          </View>

          {membros.length > 0 && (
            <View style={styles.rowItem}>
              <Text style={styles.label}>Integrantes:</Text>
              <Text style={styles.value}>{membros.join(', ')}</Text>
            </View>
          )}

          {progresso?.entregue_em && (
            <View style={styles.rowItem}>
              <Text style={styles.label}>Entregue em:</Text>
              <Text style={styles.value}>
                {new Date(progresso.entregue_em).toLocaleString('pt-BR')}
              </Text>
            </View>
          )}
        </Card>

        {/* Card da Missão */}
        <Card style={styles.infoCard}>
          <View style={styles.missionHeader}>
            <Text style={styles.sectionTitle}>Missão: {missao?.titulo}</Text>
            <Badge label={`Peso ${missao?.peso_nota || 1}`} status="disponivel" />
          </View>
          {missao?.sticker_recompensa_id && (
            <View style={styles.stickerNotice}>
              <Ionicons name="gift-outline" size={16} color={colors.primary} />
              <Text style={styles.stickerNoticeText}>
                Esta missão concede um sticker de recompensa após a validação.
              </Text>
            </View>
          )}
        </Card>

        {/* Formulário de Correção */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Lançamento de Avaliação</Text>

          <Input
            label="Nota da Missão (0 a 10)"
            placeholder="Ex: 8.5"
            value={nota}
            onChangeText={setNota}
            keyboardType="numeric"
          />

          <Input
            label="Feedback do Professor"
            placeholder="Deixe comentários, orientações ou pontos de melhoria para o aluno..."
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={4}
          />

          <Button
            title="Lançar Nota e Validar"
            onPress={handleSalvarCorrecao}
            loading={submitting}
            icon={<Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />}
            style={styles.submitBtn}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  rowItem: {
    flexDirection: 'row',
    marginVertical: 3,
  },
  label: {
    width: 100,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stickerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderColor: '#BFDBFE',
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
  },
  stickerNoticeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    flex: 1,
  },
  formCard: {
    padding: 16,
  },
  submitBtn: {
    marginTop: 14,
  },
});

