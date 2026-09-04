// src/screens/professor/StickersScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { professorApi } from '../../api/professor';
import { colors } from '../../theme/colors';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { confirmDialog, notifyAlert } from '../../utils/alert';
import { PRESET_STICKERS, getStickerSource } from '../../constants/stickers';
import { FloatingMascot } from '../../components/FloatingMascot';

export const StickersScreen = ({ navigation }) => {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal de Criação
  const [modalVisible, setModalVisible] = useState(false);
  const [nomeSticker, setNomeSticker] = useState('');
  const [raridade, setRaridade] = useState('comum'); // 'comum' | 'raro' | 'epico' | 'lendario'
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const carregarStickers = useCallback(async () => {
    try {
      const res = await professorApi.listarStickers();
      const serverStickers = res.data || [];
      if (serverStickers.length > 0) {
        setStickers(serverStickers);
      } else {
        setStickers(PRESET_STICKERS);
      }
    } catch (error) {
      setStickers(PRESET_STICKERS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarStickers();
    });
    return unsubscribe;
  }, [navigation, carregarStickers]);

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        notifyAlert('Permissão necessária', 'Permita o acesso à galeria para enviar uma imagem.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (e) {
      notifyAlert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  };

  const handleCadastrarSticker = async () => {
    if (!nomeSticker.trim()) {
      notifyAlert('Atenção', 'Informe o nome do sticker.');
      return;
    }
    if (!selectedImage) {
      notifyAlert('Atenção', 'Selecione uma imagem para o sticker.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('nome', nomeSticker.trim());
      formData.append('raridade', raridade);

      const filename = selectedImage.uri.split('/').pop() || 'sticker.png';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/png';

      formData.append('imagem_arquivo', {
        uri: selectedImage.uri,
        name: filename,
        type,
      });

      await professorApi.cadastrarSticker(formData);
      setNomeSticker('');
      setSelectedImage(null);
      setRaridade('comum');
      setModalVisible(false);
      await carregarStickers();
      notifyAlert('Sucesso!', 'Sticker cadastrado no catálogo!');
    } catch (error) {
      notifyAlert('Erro', error.message || 'Falha ao cadastrar sticker.');
    } finally {
      setUploading(false);
    }
  };

  const handleExcluirSticker = (sticker) => {
    confirmDialog(
      'Excluir Sticker',
      `Excluir o sticker "${sticker.nome}" do catálogo?`,
      async () => {
        try {
          await professorApi.excluirSticker(sticker.id);
          await carregarStickers();
          notifyAlert('Sucesso', 'Sticker removido.');
        } catch (error) {
          notifyAlert('Erro', error.message || 'Falha ao excluir sticker.');
        }
      },
      'Excluir'
    );
  };

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
        {item.id && typeof item.id === 'string' && item.id.length > 20 ? (
          <TouchableOpacity
            onPress={() => handleExcluirSticker(item)}
            style={styles.deleteBtn}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
          </TouchableOpacity>
        ) : null}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Topo com Logo no canto esquerdo e Botão Novo Sticker à direita */}
        <View style={styles.topBar}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.appLogo}
            resizeMode="contain"
          />
          <Button
            title="Novo Sticker"
            size="sm"
            onPress={() => setModalVisible(true)}
            icon={<Ionicons name="add" size={16} color="#0B0E2A" />}
          />
        </View>

        <View style={styles.headerArea}>
          <Text style={styles.pageTitle}>Catálogo de Stickers</Text>
          <Text style={styles.pageSubtitle}>Recompensas e insígnias para vincular às missões</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
            data={stickers}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={3}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  carregarStickers();
                }}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <Ionicons name="gift-outline" size={40} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Nenhum sticker cadastrado</Text>
                <Text style={styles.emptySubtitle}>
                  Cadastre novos stickers para premiar seus alunos nas missões.
                </Text>
              </Card>
            }
          />
        )}

        {/* Modal de Criação */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <Text style={styles.modalTitle}>Cadastrar Novo Sticker</Text>
              <Text style={styles.modalSubtitle}>Adicione uma nova insígnia ao catálogo global</Text>

              <Input
                label="Nome do Sticker"
                placeholder="Ex: Explorador Quântico"
                value={nomeSticker}
                onChangeText={setNomeSticker}
              />

              <Text style={styles.fieldLabel}>Raridade do Sticker</Text>
              <View style={styles.raridadeRow}>
                {['comum', 'raro', 'epico', 'lendario'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.raridadeChip,
                      raridade === r && styles.raridadeChipActive,
                    ]}
                    onPress={() => setRaridade(r)}
                  >
                    <Text
                      style={[
                        styles.raridadeChipText,
                        raridade === r && styles.raridadeChipTextActive,
                      ]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Imagem do Sticker</Text>
              <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} resizeMode="contain" />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
                    <Text style={styles.uploadText}>Clique para selecionar imagem</Text>
                    <Text style={styles.uploadSubtext}>Formato quadrado recomendado (PNG ou JPG)</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  variant="outline"
                  onPress={() => {
                    setNomeSticker('');
                    setSelectedImage(null);
                    setModalVisible(false);
                  }}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Salvar Sticker"
                  onPress={handleCadastrarSticker}
                  loading={uploading}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </Card>
          </View>
        </Modal>

        {/* Mascote Flutuante no Canto Inferior Direito */}
        <FloatingMascot />
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
  columnWrapper: {
    gap: 10,
  },
  stickerCard: {
    flex: 1 / 3,
    alignItems: 'center',
    padding: 12,
    marginVertical: 5,
    borderColor: colors.border,
    position: 'relative',
  },
  imageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stickerImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  stickerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 4,
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    padding: 20,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginVertical: 6,
  },
  raridadeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  raridadeChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
  },
  raridadeChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
  },
  raridadeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  raridadeChipTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  uploadArea: {
    height: 110,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 6,
  },
  uploadSubtext: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
});

