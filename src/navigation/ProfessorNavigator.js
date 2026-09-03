// src/navigation/ProfessorNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Telas do Professor
import { SalasScreen } from '../screens/professor/SalasScreen';
import { SalaDetalhesScreen } from '../screens/professor/SalaDetalhesScreen';
import { MissoesGerenciarScreen } from '../screens/professor/MissoesGerenciarScreen';
import { EquipesGerenciarScreen } from '../screens/professor/EquipesGerenciarScreen';
import { EntregasScreen } from '../screens/professor/EntregasScreen';
import { CorrecaoScreen } from '../screens/professor/CorrecaoScreen';
import { PautaScreen } from '../screens/professor/PautaScreen';
import { BibliotecaScreen } from '../screens/professor/BibliotecaScreen';
import { GerarQuizScreen } from '../screens/professor/GerarQuizScreen';
import { StickersScreen } from '../screens/professor/StickersScreen';
import { PerfilScreen } from '../screens/common/PerfilScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const SalasStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SalasList" component={SalasScreen} />
      <Stack.Screen name="SalaDetalhes" component={SalaDetalhesScreen} />
      <Stack.Screen name="MissoesGerenciar" component={MissoesGerenciarScreen} />
      <Stack.Screen name="EquipesGerenciar" component={EquipesGerenciarScreen} />
      <Stack.Screen name="Entregas" component={EntregasScreen} />
      <Stack.Screen name="Correcao" component={CorrecaoScreen} />
      <Stack.Screen name="Pauta" component={PautaScreen} />
      <Stack.Screen name="Biblioteca" component={BibliotecaScreen} />
      <Stack.Screen name="GerarQuiz" component={GerarQuizScreen} />
    </Stack.Navigator>
  );
};

export const ProfessorNavigator = () => {
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

          if (route.name === 'SalasTab') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'StickersTab') {
            iconName = focused ? 'images' : 'images-outline';
          } else if (route.name === 'PerfilTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="SalasTab"
        component={SalasStackNavigator}
        options={{ tabBarLabel: 'Minhas Turmas' }}
      />
      <Tab.Screen
        name="StickersTab"
        component={StickersScreen}
        options={{ tabBarLabel: 'Stickers' }}
      />
      <Tab.Screen
        name="PerfilTab"
        component={PerfilScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};
