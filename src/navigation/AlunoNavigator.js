// src/navigation/AlunoNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Telas do Aluno
import { DashboardAlunoScreen } from '../screens/aluno/DashboardAlunoScreen';
import { EntrarSalaScreen } from '../screens/aluno/EntrarSalaScreen';
import { MissaoDetalhesScreen } from '../screens/aluno/MissaoDetalhesScreen';
import { QuizScreen } from '../screens/aluno/QuizScreen';
import { AlbumAlunoScreen } from '../screens/aluno/AlbumAlunoScreen';
import { LojaStickersScreen } from '../screens/aluno/LojaStickersScreen';
import { EquipeAlunoScreen } from '../screens/aluno/EquipeAlunoScreen';
import { BibliotecaAlunoScreen } from '../screens/aluno/BibliotecaAlunoScreen';
import { PerfilScreen } from '../screens/common/PerfilScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AlunoStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardAluno" component={DashboardAlunoScreen} />
      <Stack.Screen name="EntrarSala" component={EntrarSalaScreen} />
      <Stack.Screen name="MissaoDetalhes" component={MissaoDetalhesScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
    </Stack.Navigator>
  );
};

export const AlunoNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'TrilhaTab') {
            iconName = focused ? 'planet' : 'planet-outline';
          } else if (route.name === 'AlbumTab') {
            iconName = focused ? 'images' : 'images-outline';
          } else if (route.name === 'LojaTab') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'EquipeTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'BibliotecaTab') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'PerfilTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="TrilhaTab"
        component={AlunoStackNavigator}
        options={{ tabBarLabel: 'Trilha' }}
      />
      <Tab.Screen
        name="AlbumTab"
        component={AlbumAlunoScreen}
        options={{ tabBarLabel: 'Álbum' }}
      />
      <Tab.Screen
        name="LojaTab"
        component={LojaStickersScreen}
        options={{ tabBarLabel: 'Loja' }}
      />
      <Tab.Screen
        name="EquipeTab"
        component={EquipeAlunoScreen}
        options={{ tabBarLabel: 'Equipe' }}
      />
      <Tab.Screen
        name="BibliotecaTab"
        component={BibliotecaAlunoScreen}
        options={{ tabBarLabel: 'Biblioteca' }}
      />
      <Tab.Screen
        name="PerfilTab"
        component={PerfilScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};
