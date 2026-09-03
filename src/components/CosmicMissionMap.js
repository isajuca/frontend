// src/components/CosmicMissionMap.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Card } from './Card';
import { Badge } from './Badge';
import { notifyAlert } from '../utils/alert';

// Imagens reais das estações cósmicas e do foguetinho
const ESTACAO_IMAGES = [
  require('../../assets/Trilha/estacao1.png'),
  require('../../assets/Trilha/estacao2.png'),
  require('../../assets/Trilha/estacao3.png'),
  require('../../assets/Trilha/estacao4.png'),
  require('../../assets/Trilha/estacao5.png'),
  require('../../assets/Trilha/estacao6.png'),
  require('../../assets/Trilha/estacao7.png'),
  require('../../assets/Trilha/estacao8.png'),
  require('../../assets/Trilha/estacao9.png'),
  require('../../assets/Trilha/estacao10.png'),
];

const FOGUETINHO_IMG = require('../../assets/Trilha/foguetinho.png');

export const CosmicMissionMap = ({ periodos = [], onSelectMissao }) => {
  const [selectedPeriodoId, setSelectedPeriodoId] = useState(periodos[0]?.id || '');
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'

  if (periodos.length === 0) return null;

  const currentPeriodo = periodos.find((p) => p.id === selectedPeriodoId) || periodos[0];
  const missoes = currentPeriodo?.missoes || [];

  // Encontra a primeira missão ativa/disponível para posicionar o foguete
  const activeMissionIndex = missoes.findIndex(
    (m) => m.status_aluno === 'disponivel' || m.status_aluno === 'entregue'
  );

  return (
    <Card style={styles.cardContainer}>
      {/* Cabeçalho do Mapa de Missões */}
      <View style={styles.mapHeader}>
        <View>
          <View style={styles.titleWithIcon}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <Text style={styles.mapTitle}>MAPA DE MISSÕES</Text>
          </View>
          <Text style={styles.mapSubtitle}>Seu progresso pela galáxia</Text>
        </View>

        <TouchableOpacity
          style={styles.toggleViewBtn}
          onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
        >
          <Text style={styles.toggleViewText}>
            {viewMode === 'map' ? 'Ver todas as missões >' : 'Ver mapa galáctico >'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Seleção de Quadrimestres / Períodos (se houver mais de 1) */}
      {periodos.length > 1 && (
        <View style={styles.periodosSelectorRow}>
          {periodos.map((p) => {
            const isSelected = p.id === (selectedPeriodoId || periodos[0]?.id);
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.periodoChip, isSelected && styles.periodoChipActive]}
                onPress={() => setSelectedPeriodoId(p.id)}
              >
                <Ionicons
                  name="planet-outline"
                  size={14}
                  color={isSelected ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.periodoChipText,
                    isSelected && styles.periodoChipTextActive,
                  ]}
                >
                  {p.nome}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Visualização 1: MAPA GALÁCTICO COM ILHAS FLUTUANTES LIVRES E FOGUETE GRANDE */}
      {viewMode === 'map' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mapScrollContent}
        >
          {missoes.length === 0 ? (
            <View style={styles.emptyMapState}>
              <Text style={styles.emptyMapText}>Nenhuma missão cadastrada neste período.</Text>
            </View>
          ) : (
            <View style={styles.trailTrack}>
              {missoes.map((missao, idx) => {
                const estacaoImg = ESTACAO_IMAGES[idx % ESTACAO_IMAGES.length];
                const isCompleted = missao.status_aluno === 'concluida';
                const isAvailable = missao.status_aluno === 'disponivel';
                const isLocked = missao.status_aluno === 'bloqueada';
                const isCurrentActive = idx === (activeMissionIndex >= 0 ? activeMissionIndex : 0);

                // Alterna a altura vertical para criar o caminho ondulado em zigue-zague
                const isWaveElevated = idx % 2 === 1;

                return (
                  <View key={missao.id} style={styles.stationWrapper}>
                    {/* Linha Conectora Neon Pontilhada */}
                    {idx < missoes.length - 1 && (
                      <View
                        style={[
                          styles.connectorDashed,
                          isWaveElevated ? styles.connectorDown : styles.connectorUp,
                          isCompleted && styles.connectorCompleted,
                        ]}
                      />
                    )}

                    <TouchableOpacity
                      activeOpacity={isLocked ? 1 : 0.8}
                      onPress={() => {
                        if (isLocked) {
                          notifyAlert(
                            'Missão Bloqueada',
                            'Complete as missões anteriores da trilha para desbloquear esta estação espacial!'
                          );
                          return;
                        }
                        onSelectMissao(missao.id);
                      }}
                      style={[
                        styles.stationNode,
                        isWaveElevated && styles.stationNodeElevated,
                      ]}
                    >
                      {/* Foguetinho Grande Navegador sobre a missão ativa */}
                      {isCurrentActive && (
                        <View style={styles.shuttleContainer}>
                          <Image
                            source={FOGUETINHO_IMG}
                            style={styles.shuttleImage}
                            resizeMode="contain"
                          />
                        </View>
                      )}

                      {/* Imagem da Ilha Flutuante Livre (sem quadrado de borda) */}
                      <View
                        style={[
                          styles.islandImageContainer,
                          isLocked && styles.islandLocked,
                        ]}
                      >
                        <Image
                          source={estacaoImg}
                          style={styles.islandImage}
                          resizeMode="contain"
                        />

                        {/* Indicador sobreposto apenas de Cadeado (se bloqueada) */}
                        {isLocked && (
                          <View style={styles.badgeLockedOverlay}>
                            <Ionicons name="lock-closed" size={18} color="#A5B4FC" />
                          </View>
                        )}
                      </View>

                      {/* Informações e Título da Estação */}
                      <View style={styles.stationInfoBox}>
                        <Text style={styles.stationTitle} numberOfLines={2}>
                          {idx + 1}. {missao.titulo}
                        </Text>

                        {isCompleted && (
                          <View style={styles.statusRow}>
                            <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
                            <Text style={styles.statusCompletedText}>Concluída</Text>
                          </View>
                        )}

                        {isAvailable && (
                          <View style={styles.progressBarWrapper}>
                            <View style={styles.progressBarFill} />
                          </View>
                        )}

                        {isLocked && (
                          <View style={styles.statusRow}>
                            <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
                            <Text style={styles.statusLockedText}>Bloqueada</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      ) : (
        /* Visualização 2: LISTA DE MISSÕES EXPANDIDA */
        <View style={styles.listContainer}>
          {missoes.map((m, idx) => {
            const isCompleted = m.status_aluno === 'concluida';
            const isLocked = m.status_aluno === 'bloqueada';
            const estacaoImg = ESTACAO_IMAGES[idx % ESTACAO_IMAGES.length];

            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => {
                  if (isLocked) {
                    notifyAlert('Missão Bloqueada', 'Complete as missões anteriores para desbloquear.');
                    return;
                  }
                  onSelectMissao(m.id);
                }}
                style={styles.listItem}
              >
                <Image source={estacaoImg} style={styles.listItemImage} resizeMode="contain" />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.listItemTitle}>{idx + 1}. {m.titulo}</Text>
                  <Text style={styles.listItemXp}>+{m.xp_reward || 0} XP</Text>
                </View>
                <Badge status={m.status_aluno} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#080A21',
    borderColor: colors.border,
    padding: 20,
    marginVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    minHeight: 400,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  mapSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toggleViewBtn: {
    backgroundColor: 'rgba(112, 0, 255, 0.25)',
    borderColor: colors.tertiary,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  toggleViewText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  periodosSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  periodoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodoChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
  },
  periodoChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodoChipTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  mapScrollContent: {
    paddingVertical: 45,
    paddingHorizontal: 16,
  },
  trailTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 30,
  },
  stationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  stationNode: {
    alignItems: 'center',
    width: 190,
    marginHorizontal: 16,
  },
  stationNodeElevated: {
    transform: [{ translateY: 44 }],
  },
  connectorDashed: {
    position: 'absolute',
    top: 90,
    left: 130,
    width: 140,
    height: 48,
    borderTopWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#2B3168',
    zIndex: 1,
  },
  connectorUp: {
    transform: [{ rotate: '18deg' }],
  },
  connectorDown: {
    transform: [{ rotate: '-18deg' }],
  },
  connectorCompleted: {
    borderColor: colors.primary,
  },
  shuttleContainer: {
    position: 'absolute',
    top: -68,
    zIndex: 25,
    alignItems: 'center',
  },
  shuttleImage: {
    width: 95,
    height: 95,
  },
  islandImageContainer: {
    width: 175,
    height: 175,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  islandImage: {
    width: 170,
    height: 170,
  },
  islandLocked: {
    opacity: 0.4,
  },
  badgeCompletedOverlay: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    backgroundColor: '#0B0E2A',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  badgeLockedOverlay: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    backgroundColor: '#0B0E2A',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  stationInfoBox: {
    alignItems: 'center',
    marginTop: 10,
    minHeight: 52,
  },
  stationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  statusCompletedText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  statusLockedText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  progressBarWrapper: {
    width: 70,
    height: 6,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '75%',
    height: 6,
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  listContainer: {
    gap: 10,
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listItemImage: {
    width: 52,
    height: 52,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  listItemXp: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  emptyMapState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyMapText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
