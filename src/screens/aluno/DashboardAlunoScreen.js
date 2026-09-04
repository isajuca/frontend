// src/screens/aluno/DashboardAlunoScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { notifyAlert } from '../../utils/alert';
import { getAvatarSource } from '../../constants/avatars';
import { CosmicMissionMap } from '../../components/CosmicMissionMap';

export const DashboardAlunoScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  // Estados para entrar na turma diretamente
  const [codigoSala, setCodigoSala] = useState('');
  const [entrandoSala, setEntrandoSala] = useState(false);
  const [erroEntrarSala, setErroEntrarSala] = useState('');

  const carregarDashboard = useCallback(async () => {
    try {
      const res = await alunoApi.getDashboard();
      setData(res.data);
    } catch (error) {
      notifyAlert('Erro', error.message || 'Falha ao carregar dashboard do aluno.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarDashboard();
    });
    return unsubscribe;
  }, [navigation, carregarDashboard]);

  const handleEntrarSala = async () => {
    const cleanCode = (codigoSala || '').trim().toUpperCase();
    if (!cleanCode) {
      setErroEntrarSala('Por favor, informe o código da sala fornecido pelo professor.');
      return;
    }

    try {
      setEntrandoSala(true);
      setErroEntrarSala('');
      const res = await alunoApi.entrarSala(cleanCode);
      notifyAlert('Sucesso!', res.data?.message || 'Você entrou na turma com sucesso!');
      setCodigoSala('');
      await carregarDashboard();
    } catch (error) {
      const msg = error.message || 'Código inválido ou você já está matriculado nesta turma.';
      setErroEntrarSala(msg);
      notifyAlert('Atenção', msg);
    } finally {
      setEntrandoSala(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Caso o aluno ainda não esteja em nenhuma sala
  if (!data?.tem_sala) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.emptyContainer}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                carregarDashboard();
              }}
              tintColor={colors.primary}
            />
          }
        >
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.brandingLogo}
            resizeMode="contain"
          />

          <View style={styles.mascotBigCircle}>
            <Image
              source={require('../../../assets/Perfil/curioso.png')}
              style={styles.mascotBigImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.emptyTitle}>Olá, Astronauta! 🚀</Text>
          <Text style={styles.emptySubtitle}>
            Digite o código de acesso fornecido pelo seu professor para entrar na turma e desbloquear sua trilha cósmica:
          </Text>

          <Card style={styles.emptyFormCard}>
            {erroEntrarSala ? (
              <View style={styles.inlineErrorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.inlineErrorText}>{erroEntrarSala}</Text>
              </View>
            ) : null}

            <Input
              label="Código da Sala"
              placeholder="Ex: D12E34"
              value={codigoSala}
              onChangeText={(text) => {
                setCodigoSala(text.toUpperCase());
                setErroEntrarSala('');
              }}
              autoCapitalize="characters"
              maxLength={12}
              inputStyle={{ textAlign: 'center', fontSize: 18, letterSpacing: 2, fontWeight: '700' }}
            />

            <Button
              title="Entrar na Turma"
              onPress={handleEntrarSala}
              loading={entrandoSala}
              icon={<Ionicons name="rocket-outline" size={18} color="#0B0E2A" />}
              style={{ marginTop: 8 }}
            />
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const {
    sala,
    equipe,
    equipe_periodo_nome,
    colegas = [],
    periodos_trilha = [],
    total = 0,
    concluidas = 0,
    quizzes_disponiveis = [],
  } = data;

  const nivelCalculado = Math.floor((user?.xp || 0) / 100) + 1;
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
              carregarDashboard();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Barra Superior com Logo no Canto Superior Esquerdo e Código à Direita */}
        <View style={styles.topBar}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.appLogo}
            resizeMode="contain"
          />
          <Badge label={`CÓDIGO: ${sala?.codigo_acesso}`} status="disponivel" />
        </View>

        {/* Hero Card do Astronauta / Mascote */}
        <Card style={styles.heroCard}>
          <View style={styles.heroContentRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroGreeting}>Olá, Astronauta! 👋</Text>
              <Text style={styles.heroTitle}>Bem-vindo(a) de volta!</Text>
              <Text style={styles.heroSubtitle}>
                Continue sua jornada e explore o universo do conhecimento!
              </Text>
            </View>

            <View style={styles.mascotRing}>
              <Image
                source={userAvatarSource}
                style={styles.mascotHeroImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Quick Stats Pills */}
          <View style={styles.statsGrid}>
            <View style={styles.statPill}>
              <View style={[styles.statIconBg, { backgroundColor: colors.tertiaryLight }]}>
                <Ionicons name="flash" size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.statLabel}>XP TOTAL</Text>
                <Text style={styles.statValue}>{user?.xp || 0}</Text>
              </View>
            </View>

            <View style={styles.statPill}>
              <View style={[styles.statIconBg, { backgroundColor: colors.secondaryLight }]}>
                <Ionicons name="planet" size={16} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.statLabel}>NÍVEL</Text>
                <Text style={styles.statValue}>{nivelCalculado}</Text>
              </View>
            </View>

            <View style={styles.statPill}>
              <View style={[styles.statIconBg, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="flag" size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.statLabel}>CONCLUÍDAS</Text>
                <Text style={styles.statValue}>{`${concluidas}/${total}`}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Card da Equipe / Turma */}
        {equipe ? (
          <Card style={styles.teamCard}>
            <View style={styles.teamCardHeader}>
              <View style={styles.teamIconBox}>
                <Ionicons name="people" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.teamTitle}>{equipe.nome}</Text>
                <Text style={styles.teamSubtitle}>
                  {equipe_periodo_nome || 'Equipe do Período'} • {colegas.length + 1} membros
                </Text>
              </View>
              <Badge label="Equipe Ativa" status="concluida" />
            </View>
          </Card>
        ) : null}

        {/* MAPA DE MISSÕES CÓSMICO AMPLIADO (Ilhas 3D Flutuantes Livres e Foguetinho) */}
        {periodos_trilha.length === 0 ? (
          <Card style={styles.emptyTrilhaCard}>
            <Ionicons name="telescope-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyTrilhaTitle}>A galáxia está silenciosa</Text>
            <Text style={styles.emptyTrilhaText}>
              O professor ainda está preparando as missões deste período. Em breve novos desafios serão lançados!
            </Text>
          </Card>
        ) : (
          <CosmicMissionMap
            periodos={periodos_trilha}
            onSelectMissao={(missaoId) => navigation.navigate('MissaoDetalhes', { missaoId })}
          />
        )}

        {/* Atividades & Quizzes Recomendados */}
        {quizzes_disponiveis.length > 0 && (
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>DESAFIOS & QUIZZES</Text>
              <Text style={styles.sectionSubheading}>Teste seus conhecimentos e ganhe bônus de XP</Text>
            </View>
          </View>
        )}

        {quizzes_disponiveis.map((q) => (
          <Card key={q.id} style={styles.quizCard}>
            <View style={styles.quizIconWrapper}>
              <Ionicons name="help-circle" size={24} color={colors.secondary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.quizTitle}>{q.titulo}</Text>
              <Text style={styles.quizSubtitle}>+{q.xp_reward || 50} XP • Dificuldade: {q.dificuldade}</Text>
            </View>
            <Button
              title="Jogar"
              variant="pink"
              size="sm"
              onPress={() => navigation.navigate('Quiz', { quizId: q.id })}
            />
          </Card>
        ))}

        {/* Dica do Astro */}
        <Card style={styles.tipCard}>
          <Ionicons name="sparkles" size={18} color={colors.primary} />
          <Text style={styles.tipText}>
            <Text style={{ fontWeight: '700', color: colors.primary }}>DICA DO ASTRO: </Text>
            Entregue suas missões em dia para conquistar stickers raros e subir de nível no ranking!
          </Text>
        </Card>
      </ScrollView>

      {/* Mascote Companheiro no Canto Inferior Direito da Tela */}
      <View style={styles.floatingMascotContainer} pointerEvents="none">
        <Image
          source={require('../../../assets/mascote.png')}
          style={styles.floatingMascotImage}
          resizeMode="contain"
        />
      </View>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appLogo: {
    width: 180,
    height: 54,
    alignSelf: 'flex-start',
  },
  heroCard: {
    padding: 20,
    marginBottom: 14,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroGreeting: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  mascotRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  mascotHeroImage: {
    width: 66,
    height: 66,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  teamCard: {
    padding: 16,
    marginBottom: 14,
  },
  teamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  teamSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sectionHeaderRow: {
    marginVertical: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  sectionSubheading: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 4,
    borderColor: 'rgba(255, 0, 229, 0.3)',
  },
  quizIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  quizSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    padding: 14,
    marginTop: 14,
    gap: 10,
  },
  tipText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  floatingMascotContainer: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    zIndex: 99,
  },
  floatingMascotImage: {
    width: 88,
    height: 88,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brandingLogo: {
    width: 220,
    height: 75,
    marginBottom: 20,
  },
  mascotBigCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mascotBigImage: {
    width: 90,
    height: 90,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 360,
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyFormCard: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderColor: colors.border,
  },
  inlineErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  inlineErrorText: {
    fontSize: 12,
    color: colors.danger,
    flex: 1,
  },
  emptyTrilhaCard: {
    alignItems: 'center',
    padding: 24,
    marginVertical: 10,
  },
  emptyTrilhaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  emptyTrilhaText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 320,
  },
});

