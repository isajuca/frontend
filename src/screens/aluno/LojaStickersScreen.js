// src/screens/aluno/LojaStickersScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { alunoApi } from '../../api/aluno';
import { colors } from '../../theme/colors';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { PRESET_STICKERS, getStickerSource } from '../../constants/stickers';

export const LojaStickersScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stickers, setStickers] = useState(PRESET_STICKERS);
  const [filtroRaridade, setFiltroRaridade] = useState('todos');

  const carregarCatalogo = useCallback(async () => {
    try {
      const res = await alunoApi.getStickersCatalogo();
      const serverStickers = res.data || [];
      if (serverStickers.length > 0) {
        // Combina catálogo do servidor com o preset oficial
        const merged = [...PRESET_STICKERS];
        serverStickers.forEach((s) => {
          if (!merged.some((p) => p.nome.toLowerCase() === s.nome.toLowerCase())) {
            merged.push({
              ...s,
              source: getStickerSource(s.imagem_url || s.nome),
            });
          }
        });
        setStickers(merged);
      } else {
        setStickers(PRESET_STICKERS);
      }
    } catch (e) {
      setStickers(PRESET_STICKERS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarCatalogo();
    });
    return unsubscribe;
  }, [navigation, carregarCatalogo]);

  const stickersFiltrados =
    filtroRaridade === 'todos'
      ? stickers
      : stickers.filter((s) => s.raridade === filtroRaridade);

  const renderItem = ({ item }) => {
    const imageSource = item.source || getStickerSource(item.imagem_url || item.nome);
    return (
      <Card style={styles.stickerCard}>
        <View style={styles.imageWrapper}>
          <Image source={imageSource} style={styles.stickerImage} resizeMode="contain" />
        </View>
        <Text style={styles.stickerTitle} numberOfLines={1}>
          {item.nome}
        </Text>
        <Badge raridade={item.raridade} style={{ marginTop: 4 }} />
        <Text style={styles.unlockHint}>Desbloqueie nas Missões</Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Topo com Logo no Canto Esquerdo e Badge à Direita */}
        <View style={styles.topBar}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.appLogo}
            resizeMode="contain"
          />
          <Badge label={`${stickersFiltrados.length} Stickers`} status="disponivel" />
        </View>

        <View style={styles.headerArea}>
          <Text style={styles.pageTitle}>Loja & Catálogo Cósmico</Text>
          <Text style={styles.pageSubtitle}>
            Conheça todas as insígnias disponíveis na galáxia separadas por raridade
          </Text>
        </View>

        {/* Filtros de Raridade */}
        <View style={styles.filterRow}>
          {['todos', 'comum', 'raro', 'epico', 'lendario'].map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.filterChip,
                filtroRaridade === r && styles.filterChipActive,
              ]}
              onPress={() => setFiltroRaridade(r)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filtroRaridade === r && styles.filterChipTextActive,
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={stickersFiltrados}
            keyExtractor={(item, idx) => `${item.id || item.nome || idx}`}
            renderItem={renderItem}
            numColumns={3}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  carregarCatalogo();
                }}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <Ionicons name="sparkles-outline" size={36} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Nenhum sticker encontrado</Text>
                <Text style={styles.emptyText}>
                  Não há stickers cadastrados nesta categoria no momento.
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '800',
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
    borderColor: 'rgba(255, 0, 229, 0.3)',
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
  unlockHint: {
    fontSize: 10,
    color: colors.textMuted,
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
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
