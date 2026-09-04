// src/screens/professor/EquipesGerenciarScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { professorApi } from '../../api/professor';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { confirmDialog } from '../../utils/alert';

export const EquipesGerenciarScreen = ({ route, navigation }) => {
  const { salaId, equipeId, equipeNome } = route.params;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const carregarDetalhes = useCallback(async () => {
    try {
      const res = await professorApi.detalhesEquipe(salaId, equipeId);
      setData(res.data);
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao carregar equipe.');
    } finally {
      setLoading(false);
    }
  }, [salaId, equipeId]);

  useEffect(() => {
    carregarDetalhes();
  }, [carregarDetalhes]);

  const handleAdicionarMembro = async (aluno) => {
    try {
      await professorApi.adicionarMembroEquipe(salaId, equipeId, aluno.id);
      carregarDetalhes();
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao adicionar aluno à equipe.');
    }
  };

  const handleRemoverMembro = (membro) => {
    confirmDialog(
      'Remover Membro',
      `Remover "${membro.nome}" desta equipe?`,
      async () => {
        try {
          await professorApi.removerMembroEquipe(salaId, equipeId, membro.id);
          carregarDetalhes();
        } catch (error) {
          Alert.alert('Erro', error.message || 'Falha ao remover membro.');
        }
      },
      'Remover'
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={equipeNome || 'Equipe'} onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const equipe = data?.equipe;
  const membros = data?.membros || [];
  const disponiveis = data?.alunos_disponiveis || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={equipe?.nome || equipeNome}
        subtitle={equipe?.periodos?.nome ? `Quadrimestre: ${equipe.periodos.nome}` : ''}
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Integrantes Atuais */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Membros da Equipe ({membros.length})</Text>
        </View>

        {membros.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhum membro adicionado a esta equipe.</Text>
          </Card>
        ) : (
          membros.map((m) => (
            <Card key={m.id} style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.memberName}>{m.nome}</Text>
                  <Text style={styles.memberEmail}>{m.email}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoverMembro(m)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </Card>
          ))
        )}

        {/* Alunos Disponíveis na Turma */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>
            Alunos Disponíveis no Período ({disponiveis.length})
          </Text>
        </View>

        {disponiveis.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Todos os alunos matriculados já pertencem a uma equipe neste quadrimestre.
            </Text>
          </Card>
        ) : (
          disponiveis.map((a) => (
            <Card key={a.id} style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
                <Text style={[styles.memberName, { marginLeft: 10, flex: 1 }]}>{a.nome}</Text>
              </View>
              <Button
                title="Adicionar"
                size="sm"
                variant="outline"
                onPress={() => handleAdicionarMembro(a)}
                icon={<Ionicons name="add" size={14} color={colors.primary} />}
              />
            </Card>
          ))
        )}
      </ScrollView>
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
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginVertical: 4,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  memberEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyCard: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

