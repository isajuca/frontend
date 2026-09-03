// src/screens/professor/GerarQuizScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { professorApi } from '../../api/professor';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';

export const GerarQuizScreen = ({ route, navigation }) => {
  const { salaId, salaNome } = route.params || {};

  const [tema, setTema] = useState('');
  const [quantidade, setQuantidade] = useState('5');
  const [dificuldade, setDificuldade] = useState('medio'); // 'facil' | 'medio' | 'dificil'
  const [generating, setGenerating] = useState(false);
  const [quizResultado, setQuizResultado] = useState(null);

  const handleGerar = async () => {
    if (!tema.trim()) {
      Alert.alert('Atenção', 'Informe o tema pedagógico para o quiz.');
      return;
    }

    try {
      setGenerating(true);
      const res = await professorApi.gerarQuizGemini({
        tema: tema.trim(),
        quantidade: parseInt(quantidade, 10) || 5,
        dificuldade,
      });
      setQuizResultado(res.data?.perguntas || []);
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao gerar perguntas com o Gemini.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Gerador de Quiz com IA"
        subtitle={salaNome ? `Sala: ${salaNome}` : 'Google Gemini'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Formulário de Geração */}
        <Card style={styles.formCard}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={22} color="#7C3AED" />
            <Text style={styles.aiTitle}>Inteligência Artificial Pedagógica</Text>
          </View>
          <Text style={styles.aiDesc}>
            Gere questionários de múltipla escolha alinhados aos tópicos das aulas.
          </Text>

          <Input
            label="Tema do Quiz"
            placeholder="Ex: Engenharia de Requisitos e Casos de Uso"
            value={tema}
            onChangeText={setTema}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Quantidade"
                placeholder="5"
                value={quantidade}
                onChangeText={setQuantidade}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.fieldLabel}>Dificuldade</Text>
              <View style={styles.diffRow}>
                {['facil', 'medio', 'dificil'].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.diffChip, dificuldade === d && styles.diffChipActive]}
                    onPress={() => setDificuldade(d)}
                  >
                    <Text
                      style={[
                        styles.diffChipText,
                        dificuldade === d && styles.diffChipTextActive,
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Button
            title="Gerar Perguntas com Gemini"
            onPress={handleGerar}
            loading={generating}
            icon={<Ionicons name="sparkles" size={16} color="#FFFFFF" />}
            style={styles.generateBtn}
          />
        </Card>

        {/* Perguntas Geradas */}
        {quizResultado && quizResultado.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              Perguntas Geradas ({quizResultado.length})
            </Text>

            {quizResultado.map((item, index) => (
              <Card key={index} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Badge label={`Questão ${index + 1}`} status="disponivel" />
                  <Badge
                    label={`Correta: ${item.resposta_correta}`}
                    status="concluida"
                  />
                </View>

                <Text style={styles.questionText}>{item.pergunta}</Text>

                <View style={styles.optionsList}>
                  {item.opcoes?.map((opcao, optIdx) => {
                    const letra = String.fromCharCode(65 + optIdx);
                    const isCorreta = item.resposta_correta === letra;
                    return (
                      <View
                        key={optIdx}
                        style={[
                          styles.optionItem,
                          isCorreta && styles.optionItemCorrect,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionLetter,
                            isCorreta && styles.optionLetterCorrect,
                          ]}
                        >
                          {letra})
                        </Text>
                        <Text
                          style={[
                            styles.optionText,
                            isCorreta && styles.optionTextCorrect,
                          ]}
                        >
                          {opcao}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Card>
            ))}
          </View>
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
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 30,
  },
  formCard: {
    padding: 18,
    marginBottom: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  aiDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  diffRow: {
    flexDirection: 'row',
    gap: 4,
  },
  diffChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
  },
  diffChipActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3E8FF',
  },
  diffChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  diffChipTextActive: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  generateBtn: {
    marginTop: 14,
    backgroundColor: '#7C3AED',
  },
  resultsSection: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  questionCard: {
    marginVertical: 6,
    padding: 14,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 10,
  },
  optionsList: {
    gap: 6,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    borderRadius: 6,
  },
  optionItemCorrect: {
    backgroundColor: colors.successLight,
    borderColor: '#A7F3D0',
  },
  optionLetter: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 6,
  },
  optionLetterCorrect: {
    color: colors.success,
  },
  optionText: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  optionTextCorrect: {
    fontWeight: '600',
    color: colors.success,
  },
});
