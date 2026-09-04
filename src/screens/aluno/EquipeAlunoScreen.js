// src/screens/aluno/EquipeAlunoScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { alunoApi } from '../../api/aluno';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { ProgressBar } from '../../components/ProgressBar';
import { getAvatarSource } from '../../constants/avatars';

export const EquipeAlunoScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const carregarEquipe = useCallback(async () => {
    try {
      const res = await alunoApi.getDashboard();
      setData(res.data);
    } catch (e) {
      console.warn('Erro ao carregar equipe:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarEquipe();
    });
    return unsubscribe;
  }, [navigation, carregarEquipe]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const { equipe, equipe_periodo_nome, colegas = [], sala, total = 0, concluidas = 0 } = data || {};
  const progressRatio = total > 0 ? concluidas / total : 0;
  const userAvatarSource = getAvatarSource(user?.avatar_url) || require('../../../assets/Perfil/feliz.png');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              carregarEquipe();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Topo com Logo no canto esquerdo e Badge à direita */}
        <View style={styles.topBar}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.appLogo}
            resizeMode="contain"
          />
          <Badge label={sala?.nome || 'Turma'} status="disponivel" />
        </View>

        <View style={styles.headerArea}>
          <Text style={styles.pageTitle}>Minha Tripulação</Text>
          <Text style={styles.pageSubtitle}>
            Acompanhe os integrantes e o progresso da sua equipe
          </Text>
        </View>

        {!equipe ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="people-outline" size={36} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Sem equipe no momento</Text>
            <Text style={styles.emptyText}>
              Você ainda não foi alocado em uma equipe para este quadrimestre. O professor fará a organização em breve!
            </Text>
          </Card>
        ) : (
          <View>
            {/* Card Principal da Equipe */}
            <Card style={styles.teamHeroCard}>
              <View style={styles.teamHeaderRow}>
                <View style={styles.teamIconBadge}>
                  <Ionicons name="planet" size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.teamName}>{equipe.nome}</Text>
                  {equipe_periodo_nome ? (
                    <Badge label={equipe_periodo_nome} style={{ marginTop: 4 }} />
                  ) : null}
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.salaInfoRow}>
                <Ionicons name="school-outline" size={16} color={colors.primary} />
                <Text style={styles.salaInfoText}>
                  Turma: {sala?.nome || '—'}
                </Text>
              </View>
            </Card>

            {/* Progresso de Atividades da Equipe */}
            <Card style={styles.progressCard}>
              <Text style={styles.sectionTitle}>Progresso da Equipe nas Missões</Text>
              <Text style={styles.sectionSubtitle}>
                Missões validadas pelo professor no período
              </Text>

              <ProgressBar
                progress={progressRatio}
                label={`${concluidas} de ${total} atividades concluídas`}
                color={colors.primary}
                height={12}
                style={{ marginTop: 10 }}
              />
            </Card>

            {/* Integrantes da Equipe */}
            <View style={styles.membersSection}>
              <Text style={styles.sectionTitle}>
                Integrantes da Tripulação ({colegas.length + 1})
              </Text>

              {/* Card do próprio aluno com seu avatar */}
              <Card style={styles.memberCard}>
                <Image source={userAvatarSource} style={styles.memberAvatarImg} resizeMode="contain" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.memberName}>{user?.nome || 'Você'}</Text>
                  <Text style={styles.memberRole}>Astronauta • Você</Text>
                </View>
                <Badge label="Eu" status="disponivel" />
              </Card>

              {/* Co-integrantes */}
              {colegas.map((c) => (
                <Card key={c.id} style={styles.memberCard}>
                  <View style={styles.memberAvatarPlaceholder}>
                    <Ionicons name="person-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.memberName}>{c.nome}</Text>
                    <Text style={styles.memberRole}>Colega de Grupo</Text>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}
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
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 36,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  appLogo: {
    width: 180,
    height: 54,
    alignSelf: 'flex-start',
  },
  headerArea: {
    paddingVertical: 10,
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
  teamHeroCard: {
    padding: 18,
    marginBottom: 10,
    borderColor: colors.border,
  },
  teamHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  salaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  salaInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  progressCard: {
    padding: 16,
    marginBottom: 14,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  membersSection: {
    marginTop: 6,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderColor: colors.border,
  },
  memberAvatarImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSubtle,
  },
  memberAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  memberRole: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
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
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 340,
  },
});

