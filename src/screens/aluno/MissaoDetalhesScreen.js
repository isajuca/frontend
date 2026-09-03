// src/screens/aluno/MissaoDetalhesScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { alunoApi } from '../../api/aluno';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { confirmDialog } from '../../utils/alert';

export const MissaoDetalhesScreen = ({ route, navigation }) => {
  const { missaoId } = route.params;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const carregarDetalhes = useCallback(async () => {
    try {
      const res = await alunoApi.getMissaoDetalhes(missaoId);
      setData(res.data);
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao carregar missão.');
    } finally {
      setLoading(false);
    }
  }, [missaoId]);

  useEffect(() => {
    carregarDetalhes();
  }, [carregarDetalhes]);

  const handleEntregarMissao = () => {
    confirmDialog(
      'Confirmar Conclusão',
      'Deseja marcar esta missão como concluída/entregue para o professor avaliar?',
      async () => {
        try {
          setSubmitting(true);
          const res = await alunoApi.enviarMissao(missaoId);
          Alert.alert('Sucesso!', res.data?.message || 'Missão enviada para correção!');
          carregarDetalhes();
        } catch (error) {
          Alert.alert('Erro', error.message || 'Falha ao entregar missão.');
        } finally {
          setSubmitting(false);
        }
      },
      'Confirmar Entrega'
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Missão" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const missao = data?.missao;
  const progresso = data?.progresso;
  const bloqueada = data?.bloqueada;
  const materiais = data?.materiais || [];
  const sticker = missao?.stickers;

  const isCorrigido = progresso?.status === 'corrigido';
  const isEntregue = progresso?.status === 'entregue';
  const isDisponivel = !isCorrigido && !isEntregue && !bloqueada;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={`Missão #${missao?.ordem || 1}`}
        subtitle={missao?.salas?.nome}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Card Principal da Missão */}
        <Card style={styles.mainCard}>
          <View style={styles.badgeRow}>
            <Badge label={`#${missao?.ordem}`} status="disponivel" />
            <Badge label={`+${missao?.xp_reward || 0} XP`} status="corrigida_sem_validacao" />
            {missao?.peso_nota && <Badge label={`Peso ${missao.peso_nota}`} />}
          </View>

          <Text style={styles.missionTitle}>{missao?.titulo}</Text>

          {missao?.data_limite && (
            <View style={styles.deadlineRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.deadlineText}>
                Prazo: {new Date(missao.data_limite).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          )}

          {missao?.descricao ? (
            <View style={styles.descSection}>
              <Text style={styles.sectionHeading}>Instruções da Missão</Text>
              <Text style={styles.descText}>{missao.descricao}</Text>
            </View>
          ) : null}
        </Card>

        {/* Sticker de Recompensa */}
        {sticker && (
          <Card style={styles.rewardCard}>
            <Image source={{ uri: sticker.imagem_url }} style={styles.stickerImg} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.rewardTitle}>Badge / Recompensa</Text>
              <Text style={styles.stickerName}>{sticker.nome}</Text>
              <Badge raridade={sticker.raridade} style={{ marginTop: 4 }} />
            </View>
          </Card>
        )}

        {/* Materiais de Apoio */}
        {materiais.length > 0 && (
          <View style={styles.materialsSection}>
            <Text style={styles.sectionHeading}>Materiais de Apoio</Text>
            {materiais.map((mat) => (
              <Card key={mat.id} style={styles.materialCard}>
                <Text style={styles.materialTitle}>{mat.titulo}</Text>
                {mat.descricao ? (
                  <Text style={styles.materialDesc}>{mat.descricao}</Text>
                ) : null}
                {mat.links?.map((link, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.linkItem}
                    onPress={() => Linking.openURL(link)}
                  >
                    <Ionicons name="link-outline" size={14} color={colors.primary} />
                    <Text style={styles.linkText} numberOfLines={1}>
                      {link}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Card>
            ))}
          </View>
        )}

        {/* Seção de Status e Ação de Entrega */}
        <Card style={styles.actionCard}>
          <Text style={styles.sectionHeading}>Status da sua Entrega</Text>

          {bloqueada && (
            <View style={styles.statusBoxBlocked}>
              <Ionicons name="lock-closed" size={20} color={colors.textMuted} />
              <Text style={styles.statusBoxBlockedText}>
                Esta missão está bloqueada. É necessário que o professor valide sua entrega na missão anterior.
              </Text>
            </View>
          )}

          {isDisponivel && (
            <View>
              <Text style={styles.statusPromptText}>
                Após concluir a atividade solicitada, clique no botão abaixo para registrar a entrega.
              </Text>
              <Button
                title="Marcar como Entregue"
                onPress={handleEntregarMissao}
                loading={submitting}
                icon={<Ionicons name="checkmark-done" size={18} color="#FFFFFF" />}
                style={styles.deliverBtn}
              />
            </View>
          )}

          {isEntregue && (
            <View style={styles.statusBoxPending}>
              <Ionicons name="time-outline" size={24} color={colors.info} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.statusPendingTitle}>Missão Entregue!</Text>
                <Text style={styles.statusPendingDesc}>
                  Sua entrega está aguardando avaliação e validação do professor.
                </Text>
              </View>
            </View>
          )}

          {isCorrigido && (
            <View style={styles.statusBoxDone}>
              <View style={styles.gradeHeader}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                <Text style={styles.statusDoneTitle}>Missão Validada!</Text>
                <View style={styles.finalGradeBox}>
                  <Text style={styles.finalGradeLabel}>Nota</Text>
                  <Text style={styles.finalGradeVal}>
                    {Number(progresso?.nota).toFixed(1)}
                  </Text>
                </View>
              </View>

              {progresso?.comentario_professor ? (
                <View style={styles.feedbackContainer}>
                  <Text style={styles.feedbackLabel}>Feedback do Professor:</Text>
                  <Text style={styles.feedbackText}>
                    "{progresso.comentario_professor}"
                  </Text>
                </View>
              ) : null}
            </View>
          )}
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
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCard: {
    padding: 16,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  deadlineText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  descSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  descText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
  },
  stickerImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  rewardTitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  stickerName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  materialsSection: {
    marginVertical: 6,
  },
  materialCard: {
    marginVertical: 4,
    padding: 12,
  },
  materialTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  materialDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  linkText: {
    fontSize: 12,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  actionCard: {
    marginTop: 8,
    padding: 16,
  },
  statusPromptText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  deliverBtn: {
    marginTop: 4,
  },
  statusBoxBlocked: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    padding: 12,
    borderRadius: 8,
    gap: 10,
    marginTop: 6,
  },
  statusBoxBlockedText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  statusBoxPending: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.infoLight,
    borderColor: '#BFDBFE',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  statusPendingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.info,
  },
  statusPendingDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBoxDone: {
    backgroundColor: colors.successLight,
    borderColor: '#A7F3D0',
    borderWidth: 1,
    padding: 14,
    borderRadius: 8,
    marginTop: 6,
  },
  gradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDoneTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.success,
    marginLeft: 8,
    flex: 1,
  },
  finalGradeBox: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  finalGradeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  finalGradeVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.success,
  },
  feedbackContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#A7F3D0',
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  feedbackText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
});
