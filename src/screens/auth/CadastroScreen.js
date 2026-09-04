// src/screens/auth/CadastroScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export const CadastroScreen = ({ navigation }) => {
  const { cadastro } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('aluno'); // 'aluno' | 'professor'
  const [chaveMestra, setChaveMestra] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCadastro = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }

    if (role === 'professor' && !chaveMestra.trim()) {
      setErrorMsg('Informe a chave mestra do professor fornecida para o projeto.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      await cadastro({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        role,
        chave_mestra: role === 'professor' ? chaveMestra.trim() : undefined,
      });

      setSuccessMsg('Cadastro realizado com sucesso! Você já pode fazer login.');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1800);
    } catch (error) {
      setErrorMsg(error.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo e Cabeçalho */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Junte-se à Tripulação</Text>
            <Text style={styles.subtitle}>
              Crie sua conta e comece sua jornada de aprendizado estelar
            </Text>
          </View>

          <Card style={styles.formCard}>
            {errorMsg ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            {/* Seletor de Tipo de Conta */}
            <Text style={styles.sectionLabel}>Função na Galáxia</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === 'aluno' && styles.roleOptionSelected,
                ]}
                onPress={() => {
                  setRole('aluno');
                  setErrorMsg('');
                }}
              >
                <Ionicons
                  name="rocket-outline"
                  size={18}
                  color={role === 'aluno' ? '#0B0E2A' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.roleText,
                    role === 'aluno' && styles.roleTextSelected,
                  ]}
                >
                  Estudante
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === 'professor' && styles.roleOptionSelected,
                ]}
                onPress={() => {
                  setRole('professor');
                  setErrorMsg('');
                }}
              >
                <Ionicons
                  name="planet-outline"
                  size={18}
                  color={role === 'professor' ? '#0B0E2A' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.roleText,
                    role === 'professor' && styles.roleTextSelected,
                  ]}
                >
                  Professor
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Nome Completo"
              placeholder="Ex: Isadora Lima"
              value={nome}
              onChangeText={(text) => {
                setNome(text);
                setErrorMsg('');
              }}
              autoCapitalize="words"
            />

            <Input
              label="E-mail"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMsg('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Senha da Conta"
              placeholder="Crie uma senha de acesso"
              value={senha}
              onChangeText={(text) => {
                setSenha(text);
                setErrorMsg('');
              }}
              secureTextEntry
            />

            {role === 'professor' && (
              <Input
                label="Chave Mestra do Professor"
                placeholder="Digite a chave mestra"
                value={chaveMestra}
                onChangeText={(text) => {
                  setChaveMestra(text);
                  setErrorMsg('');
                }}
                secureTextEntry
                helperText="Código de autorização fornecido pelo orientador/coordenação."
              />
            )}

            <Button
              title="Cadastrar"
              onPress={handleCadastro}
              loading={loading}
              style={styles.submitBtn}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Fazer login</Text>
              </TouchableOpacity>
            </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 220,
    height: 75,
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 320,
  },
  formCard: {
    padding: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  successText: {
    color: colors.primary,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  roleOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  roleTextSelected: {
    color: '#0B0E2A',
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 14,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});

