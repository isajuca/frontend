// src/screens/aluno/EntrarSalaScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { alunoApi } from '../../api/aluno';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { notifyAlert } from '../../utils/alert';

export const EntrarSalaScreen = ({ navigation }) => {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEntrar = async () => {
    const cleanCode = codigo.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Por favor, informe o código da sala fornecido pelo professor.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await alunoApi.entrarSala(cleanCode);
      notifyAlert('Sucesso!', res.data?.message || 'Você entrou na turma com sucesso!', () => {
        navigation.navigate('DashboardAluno');
      });
    } catch (error) {
      const msg = error.message || 'Código inválido ou você já está matriculado nesta turma.';
      setErrorMsg(msg);
      notifyAlert('Atenção', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Entrar em Turma" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="key" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Código de Acesso da Sala</Text>
            <Text style={styles.subtitle}>
              Digite o código de acesso fornecido pelo seu professor para embarcar na trilha de conhecimento.
            </Text>
          </View>

          <Card style={styles.formCard}>
            {errorMsg ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <Input
              label="Código da Sala"
              placeholder="Ex: A1B2C3"
              value={codigo}
              onChangeText={(text) => {
                setCodigo(text.toUpperCase());
                setErrorMsg('');
              }}
              autoCapitalize="characters"
              maxLength={12}
              inputStyle={styles.codeInput}
            />

            <Button
              title="Entrar na Turma"
              onPress={handleEntrar}
              loading={loading}
              icon={<Ionicons name="rocket-outline" size={18} color="#0B0E2A" />}
              style={styles.submitBtn}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  formCard: {
    padding: 20,
    borderColor: colors.border,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  codeInput: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 14,
  },
});

