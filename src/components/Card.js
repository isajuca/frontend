// src/components/Card.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export const Card = ({ children, style, onPress, variant = 'default' }) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={[
        styles.card,
        variant === 'subtle' && styles.subtleCard,
        variant === 'outlined' && styles.outlinedCard,
        style,
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subtleCard: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },
  outlinedCard: {
    backgroundColor: 'transparent',
    borderColor: colors.borderDark,
  },
});
