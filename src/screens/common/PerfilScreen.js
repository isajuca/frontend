// src/screens/common/PerfilScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { confirmDialog, notifyAlert } from '../../utils/alert';
import { PRESET_AVATARS, getAvatarSource } from '../../constants/avatars';

export const PerfilScreen = () => {
  const { user, logout, updateUser } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectAvatar = async (avatar) => {
    try {
      await updateUser({ avatar_url: avatar.id });
      setModalVisible(false);
      notifyAlert('Sucesso!', `Mascote "${avatar.nome}" selecionado com sucesso!`);
    } catch (err) {
      notifyAlert('Erro', 'Não foi possível atualizar o avatar.');
    }
  };

  const handleLogout = () => {
    confirmDialog('Sair da Conta', 'Deseja realmente encerrar a sessão?', () => {
      logout();
    }, 'Sair');
  };

  const currentAvatarSource = getAvatarSource(user?.avatar_url) || require('../../../assets/Perfil/feliz.png');
  const nivelCalculado = Math.floor((user?.xp || 0) / 100) + 1;

  const renderAvatarOption = ({ item }) => {
    const isSelected = user?.avatar_url === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.avatarOptionCard,
          isSelected && styles.avatarOptionSelected,
        ]}
        onPress={() => handleSelectAvatar(item)}
      >
        <Image source={item.source} style={styles.optionImage} resizeMode="contain" />
        <Text style={[styles.optionName, isSelected && styles.optionNameSelected]} numberOfLines={1}>
          {item.nome}
        </Text>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Topo com Logo no canto esquerdo e Badge à direita */}
        <View style={styles.topBar}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.appLogo}
            resizeMode="contain"
          />
          <Badge
            label={user?.role === 'professor' ? 'Docente' : `Nível ${nivelCalculado}`}
            status={user?.role === 'professor' ? 'disponivel' : 'concluida'}
          />
        </View>

        <Text style={styles.screenTitle}>Meu Perfil Cósmico</Text>

        <Card style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image source={currentAvatarSource} style={styles.avatar} resizeMode="contain" />
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="pencil" size={15} color="#0B0E2A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{user?.nome || 'Astronauta'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>

            <TouchableOpacity
              style={styles.changeAvatarBtn}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="sparkles" size={14} color={colors.primary} />
              <Text style={styles.changeAvatarText}>Escolher Mascote Avatar</Text>
            </TouchableOpacity>

            {/* Caixinhas de ESTUDANTE e PONTOS exatamente no mesmo tamanho */}
            <View style={styles.badgeRow}>
              <View style={styles.roleBadgePill}>
                <Text style={styles.roleBadgeText}>
                  {user?.role === 'professor' ? 'PROFESSOR' : 'ESTUDANTE'}
                </Text>
              </View>

              {user?.role === 'aluno' && (
                <View style={styles.xpBadgePill}>
                  <Ionicons name="flash" size={14} color={colors.primary} />
                  <Text style={styles.xpText}>{user?.xp || 0} XP</Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Informações da Conta */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardHeader}>Detalhes da Conta</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Identificador</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {user?.id}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Função na Plataforma</Text>
            <Text style={styles.infoValue}>
              {user?.role === 'professor' ? 'Docente / Criador de Salas' : 'Aluno / Explorador'}
            </Text>
          </View>
        </Card>

        <Button
          title="Encerrar Sessão"
          variant="danger"
          onPress={handleLogout}
          icon={<Ionicons name="log-out-outline" size={18} color="#FFFFFF" />}
          style={styles.logoutBtn}
        />
      </ScrollView>

      {/* Modal de Escolha de Avatares Pré-definidos */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Escolha seu Mascote</Text>
                <Text style={styles.modalSubtitle}>
                  Selecione uma das 8 versões oficiais do mascote
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
              data={PRESET_AVATARS}
              keyExtractor={(item) => item.id}
              renderItem={renderAvatarOption}
              numColumns={2}
              columnWrapperStyle={styles.avatarGrid}
              contentContainerStyle={{ paddingVertical: 8 }}
            />

            <Button
              title="Fechar"
              variant="outline"
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 12 }}
            />
          </Card>
        </View>
      </Modal>
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
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 10,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    borderColor: colors.border,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSubtle,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  changeAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  changeAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  roleBadgePill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  xpBadgePill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  infoCard: {
    marginTop: 12,
    borderColor: colors.border,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 6,
  },
  logoutBtn: {
    marginTop: 20,
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
    maxHeight: '80%',
    padding: 18,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  avatarGrid: {
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  avatarOptionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    position: 'relative',
  },
  avatarOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 6,
  },
  optionName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  optionNameSelected: {
    color: colors.primary,
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
});

