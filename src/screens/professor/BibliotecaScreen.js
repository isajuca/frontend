// src/screens/professor/BibliotecaScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Linking,
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
import { confirmDialog } from '../../utils/alert';

export const BibliotecaScreen = ({ route, navigation }) => {
  const { salaId, salaNome } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [materiais, setMateriais] = useState([]);
  const [missoes, setMissoes] = useState([]);

  // Modal de Criação
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [missaoId, setMissaoId] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [links, setLinks] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const carregarBiblioteca = useCallback(async () => {
    try {
      const res = await professorApi.listarBiblioteca(salaId);
      setMateriais(res.data?.materiais || []);
      setMissoes(res.data?.missoes || []);
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao carregar biblioteca de materiais.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [salaId]);

  useEffect(() => {
    carregarBiblioteca();
  }, [carregarBiblioteca]);

  const handleAddLink = () => {
    if (!linkInput.trim()) return;
    setLinks([...links, linkInput.trim()]);
    setLinkInput('');
  };

  const handleRemoveLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSalvarMaterial = async () => {
    if (!titulo.trim()) {
      Alert.alert('Atenção', 'Informe o título do material.');
      return;
    }

    try {
      setSubmitting(true);
      await professorApi.criarMaterial(salaId, {
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        missao_id: missaoId || null,
        links,
      });

      setTitulo('');
      setDescricao('');
      setMissaoId('');
      setLinks([]);
      setModalVisible(false);
      carregarBiblioteca();
      Alert.alert('Sucesso', 'Material cadastrado na biblioteca!');
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao cadastrar material.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExcluir = (item) => {
    confirmDialog(
      'Excluir Material',
      `Remover "${item.titulo}"?`,
      async () => {
        try {
          await professorApi.excluirMaterial(salaId, item.id);
          carregarBiblioteca();
        } catch (e) {
          Alert.alert('Erro', e.message);
        }
      },
      'Excluir'
    );
  };

  const renderItem = ({ item }) => (
    <Card style={styles.materialCard}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          {item.missoes?.titulo && (
            <Badge label={`Missão: ${item.missoes.titulo}`} style={{ marginBottom: 4 }} />
          )}
          <Text style={styles.materialTitle}>{item.titulo}</Text>
          {item.descricao ? (
            <Text style={styles.materialDesc}>{item.descricao}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={() => handleExcluir(item)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {item.links && item.links.length > 0 && (
        <View style={styles.linksContainer}>
          <Text style={styles.linksLabel}>Links de Referência:</Text>
          {item.links.map((link, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.linkRow}
              onPress={() => Linking.openURL(link)}
            >
              <Ionicons name="link-outline" size={14} color={colors.primary} />
              <Text style={styles.linkUrl} numberOfLines={1}>
                {link}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Biblioteca de Materiais"
        subtitle={salaNome}
        onBack={() => navigation.goBack()}
        rightAction={
          <Button
            title="Novo Material"
            size="sm"
            onPress={() => setModalVisible(true)}
            icon={<Ionicons name="add" size={16} color="#FFFFFF" />}
          />
        }
      />

      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={materiais}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  carregarBiblioteca();
                }}
              />
            }
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <Ionicons name="folder-open-outline" size={40} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Biblioteca vazia</Text>
                <Text style={styles.emptySubtitle}>
                  Compartilhe apostilas, tutoriais e links complementares para auxiliar os alunos nas missões.
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
              <Text style={styles.modalTitle}>Novo Material de Estudo</Text>

              <Input
                label="Título do Material"
                placeholder="Ex: Tutorial de Arquitetura em Camadas"
                value={titulo}
                onChangeText={setTitulo}
              />

              <Input
                label="Descrição / Orientações"
                placeholder="Explique o conteúdo deste material..."
                value={descricao}
                onChangeText={setDescricao}
                multiline
                numberOfLines={3}
              />

              {missoes.length > 0 && (
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>Vincular à Missão (Opcional)</Text>
                  <View style={styles.chipRow}>
                    <TouchableOpacity
                      style={[styles.chip, !missaoId && styles.chipActive]}
                      onPress={() => setMissaoId('')}
                    >
                      <Text style={[styles.chipText, !missaoId && styles.chipTextActive]}>
                        Geral da Sala
                      </Text>
                    </TouchableOpacity>
                    {missoes.map((m) => (
                      <TouchableOpacity
                        key={m.id}
                        style={[styles.chip, missaoId === m.id && styles.chipActive]}
                        onPress={() => setMissaoId(m.id)}
                      >
                        <Text style={[styles.chipText, missaoId === m.id && styles.chipTextActive]}>
                          {m.titulo}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Links de Apoio */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>Adicionar Link Externo</Text>
                <View style={styles.linkInputRow}>
                  <View style={{ flex: 1 }}>
                    <Input
                      placeholder="https://..."
                      value={linkInput}
                      onChangeText={setLinkInput}
                      autoCapitalize="none"
                    />
                  </View>
                  <Button
                    title="Adicionar"
                    size="sm"
                    variant="outline"
                    onPress={handleAddLink}
                    style={{ marginLeft: 8 }}
                  />
                </View>

                {links.map((link, idx) => (
                  <View key={idx} style={styles.linkAddedRow}>
                    <Text style={styles.linkAddedText} numberOfLines={1}>
                      {link}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveLink(idx)}>
                      <Ionicons name="close-circle" size={16} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  variant="secondary"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Salvar Material"
                  onPress={handleSalvarMaterial}
                  loading={submitting}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          </View>
        </Modal>
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
  listContent: {
    paddingVertical: 14,
    paddingBottom: 30,
  },
  materialCard: {
    marginVertical: 6,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  materialTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  materialDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  linksContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  linksLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  linkUrl: {
    fontSize: 12,
    color: colors.primary,
    textDecorationLine: 'underline',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  fieldSection: {
    marginVertical: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  linkInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkAddedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  linkAddedText: {
    fontSize: 12,
    color: colors.primary,
    flex: 1,
    marginRight: 6,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
});
