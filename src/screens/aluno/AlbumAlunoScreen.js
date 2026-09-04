// src/screens/aluno/AlbumAlunoScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { alunoApi } from '../../api/aluno';
import { colors } from '../../theme/colors';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { getStickerSource } from '../../constants/stickers';

export const AlbumAlunoScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [conquistados, setConquistados] = useState([]);

  const carregarAlbum = useCallback(async () => {
    try {
      const res = await alunoApi.getDashboard();
      if (res.data?.tem_sala) {
        const periodos = res.data.periodos_trilha || [];
        const stickersList = [];

        periodos.forEach((p) => {
          (p.missoes || []).forEach((m) => {
            if (m.progresso?.validada_professor && m.stickers) {
              stickersList.push({
                ...m.stickers,
                missaoTitulo: m.titulo,
                conquistadoEm: m.progresso.entregue_em,
                nota: m.progresso.nota,
              });
            }
          });
        });

        setConquistados(stickersList);
      } else {
        setConquistados([]);
      }
    } catch (e) {
      console.warn('Erro ao carregar álbum:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarAlbum();
    });
    return unsubscribe;
  }, [navigation, carregarAlbum]);

  const renderItem = ({ item }) => {
    const imageSource = getStickerSource(item.imagem_url || item.nome);
    return (
      <Card style={styles.stickerCard}>
        <View style={styles.imageWrapper}>
          <Image source={imageSource} style={styles.stickerImage} resizeMode="contain" />
        </View>
        <Text style={styles.stickerTitle} numberOfLines={1}>
          {item.nome}
        </Text>
        <Badge raridade={item.raridade} style={{ marginTop: 4 }} />
        <Text style={styles.missionOrigin} numberOfLines={1}>
          {item.missaoTitulo}
        </Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Topo com Logo no Canto Esquerdo */}
        <View style={styles.topBar}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.appLogo}
            resizeMode="contain"
          />
          <Badge label={`${conquistados.length} Conquistados`} status="concluida" />
        </View>

        <View style={styles.headerArea}>
          <Text style={styles.pageTitle}>Meu Álbum Cósmico</Text>
          <Text style={styles.pageSubtitle}>
            Insígnias e stickers conquistados ao completar missões
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
            data={conquistados}
            keyExtractor={(item, idx) => `${item.id || idx}`}
            renderItem={renderItem}
            numColumns={3}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  carregarAlbum();
                }}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="images-outline" size={36} color={colors.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>Seu álbum ainda está vazio</Text>
                <Text style={styles.emptyText}>
                  Complete as missões da trilha! Quando o professor validar sua entrega, os stickers conquistados aparecerão automaticamente aqui.
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
    marginBottom: 6,
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
  columnWrapper: {
    gap: 12,
  },
  stickerCard: {
    flex: 1 / 3,
    alignItems: 'center',
    padding: 14,
    marginVertical: 6,
    borderColor: colors.border,
  },
  imageWrapper: {
    width: 84,
    height: 84,
    borderRadius: 14,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  stickerImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  stickerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  missionOrigin: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
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

