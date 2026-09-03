// src/navigation/AppNavigator.js
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

import { AuthNavigator } from './AuthNavigator';
import { ProfessorNavigator } from './ProfessorNavigator';
import { AlunoNavigator } from './AlunoNavigator';

export const AppNavigator = () => {
  const { isAuthenticated, isProfessor, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : isProfessor ? (
        <ProfessorNavigator />
      ) : (
        <AlunoNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
