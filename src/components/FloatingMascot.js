// src/components/FloatingMascot.js
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export const FloatingMascot = () => {
  return (
    <View style={styles.floatingMascotContainer} pointerEvents="none">
      <Image
        source={require('../../assets/mascote.png')}
        style={styles.floatingMascotImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
});
