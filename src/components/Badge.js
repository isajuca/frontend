// src/components/Badge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const Badge = ({ label, status, raridade, variant = 'default', style, textStyle }) => {
  const getBadgeColors = () => {
    if (raridade) {
      const rColor = colors.raridade[raridade] || colors.raridade.comum;
      return {
        bg: `${rColor}25`,
        text: rColor,
        border: `${rColor}60`,
      };
    }

    switch (status) {
      case 'concluida':
      case 'corrigido':
        return {
          bg: colors.successLight,
          text: colors.success,
          border: 'rgba(0, 240, 255, 0.4)',
        };
      case 'entregue':
        return {
          bg: colors.infoLight,
          text: colors.info,
          border: 'rgba(96, 165, 250, 0.4)',
        };
      case 'corrigida_sem_validacao':
      case 'pendente':
        return {
          bg: colors.warningLight,
          text: colors.warning,
          border: 'rgba(251, 191, 36, 0.4)',
        };
      case 'disponivel':
        return {
          bg: colors.primaryLight,
          text: colors.primary,
          border: 'rgba(0, 240, 255, 0.4)',
        };
      case 'bloqueada':
        return {
          bg: colors.surfaceSubtle,
          text: colors.textMuted,
          border: colors.border,
        };
      case 'danger':
        return {
          bg: colors.dangerLight,
          text: colors.danger,
          border: 'rgba(255, 77, 121, 0.4)',
        };
      default:
        return {
          bg: colors.surfaceSubtle,
          text: colors.textSecondary,
          border: colors.border,
        };
    }
  };

  const badgeColors = getBadgeColors();

  const getLabelText = () => {
    if (label) return label;
    if (raridade) {
      switch (raridade) {
        case 'comum':
          return 'Comum';
        case 'raro':
          return 'Raro';
        case 'epico':
          return 'Épico';
        case 'lendario':
          return 'Lendário';
        default:
          return raridade;
      }
    }
    switch (status) {
      case 'concluida':
        return 'Concluída';
      case 'entregue':
        return 'Entregue';
      case 'corrigido':
        return 'Corrigido';
      case 'disponivel':
        return 'Disponível';
      case 'bloqueada':
        return 'Bloqueada';
      default:
        return status || '';
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeColors.bg,
          borderColor: badgeColors.border,
          borderWidth: 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: badgeColors.text },
          textStyle,
        ]}
      >
        {getLabelText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
