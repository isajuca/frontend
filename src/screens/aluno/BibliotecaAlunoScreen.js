// src/screens/aluno/BibliotecaAlunoScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { alunoApi } from '../../api/aluno';
import { colors } from '../../theme/colors';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';

export const BibliotecaAlunoScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [materiais, setMateriais] = useState([]);
  const [salaNome, setSalaNome] = useState('');

  const carregarBiblioteca = useCallback(async () => {
    try {
      const dash = await alunoApi.getDashboard();
      if (dash.data?.tem_sala && dash.data.sala?.id) {
        setSalaNome(dash.data.sala.nome);
        const res = await alunoApi.getBibliotecaSala(dash.data.sala.id);
        setMateriais(res.data?.materiais || []);
      } else {
        setMateriais([]);
      }
    } catch (e) {
      console.warn('Erro ao carregar biblioteca do aluno:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarBiblioteca();
    });
    return unsubscribe;
  }, [navigation, carregarBiblioteca]);

  const renderItem = ({ item }) => (
    <Card style={styles.materialCard}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          {item.missoes?.titulo && (
            <Badge label={`Missão: ${item.missoes.titulo}`} style={{ marginBottom: 6 }} />
          )}
          <Text style={styles.materialTitle}>{item.titulo}</Text>
          {item.descricao ? (
            <Text style={styles.materialDesc}>{item.descricao}</Text>
          ) : null}
        </View>
      </View>

      {item.links && item.links.length > 0 && (
        <View style={styles.linksContainer}>
          <Text style={styles.linksHeader}>Links & Arquivos de Apoio:</Text>
          {item.links.map((link, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.linkButton}
              onPress={() => Linking.openURL(link)}
            >
              <Ionicons name="link-outline" size={16} color={colors.primary} />
              <Text style={styles.linkUrlText} numberOfLines={1}>
                {link}
              </Text>
              <Ionicons name="open-outline" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Topo com Logo no canto esquerdo e Badge à direita */}
        <View style={styles.topBar}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.appLogo}
            resizeMode="contain"
          />
          <Badge label={`${materiais.length} Materiais`} status="disponivel" />
        </View>

        <View style={styles.headerArea}>
          <Text style={styles.pageTitle}>Biblioteca Cósmica</Text>
          <Text style={styles.pageSubtitle}>
            {salaNome ? `Materiais e arquivos de apoio da turma: ${salaNome}` : 'Arquivos disponibilizados pelo professor'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={materiais}
            keyExtractor={(item) => `${item.id}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  carregarBiblioteca();
                }}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="folder-open-outline" size={36} color={colors.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>Nenhum material disponível</Text>
                <Text style={styles.emptyText}>
                  Quando o professor cadastrar apostilas, tutoriais e links de estudo, eles aparecerão aqui.
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
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
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
  listContent: {
    paddingBottom: 24,
  },
  materialCard: {
    marginVertical: 6,
    padding: 14,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  materialDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  linksContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  linksHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    borderRadius: 8,
    marginVertical: 3,
    gap: 8,
  },
  linkUrlText: {
    fontSize: 13,
    color: colors.primary,
    flex: 1,
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
