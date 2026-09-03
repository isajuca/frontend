// src/screens/professor/GerarQuizScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { notifyAlert } from '../../utils/alert';
import { FloatingMascot } from '../../components/FloatingMascot';

export const GerarQuizScreen = ({ route, navigation }) => {
  const { salaId, salaNome } = route.params || {};

  const [tema, setTema] = useState('');
  const [quantidade, setQuantidade] = useState('5');
  const [dificuldade, setDificuldade] = useState('medio'); // 'facil' | 'medio' | 'dificil'
  const [generating, setGenerating] = useState(false);
  const [quizResultado, setQuizResultado] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGerar = async () => {
    const cleanTema = tema.trim();
    if (!cleanTema) {
      setErrorMsg('Por favor, informe o tema pedagógico para o quiz.');
      notifyAlert('Atenção', 'Informe o tema pedagógico para o quiz.');
      return;
    }

    try {
      setGenerating(true);
      setErrorMsg('');
      const res = await professorApi.gerarQuizGemini({
        tema: cleanTema,
        quantidade: parseInt(quantidade, 10) || 5,
        dificuldade,
      });

      const perguntas =
        res.data?.perguntas ||
        res.perguntas ||
        (Array.isArray(res.data) ? res.data : []) ||
        [];

      if (perguntas.length === 0) {
        throw new Error('Nenhuma pergunta foi gerada pelo modelo. Tente refinar o tema.');
      }

      setQuizResultado(perguntas);
      notifyAlert('Sucesso! 🚀', `${perguntas.length} perguntas foram geradas com a IA do Gemini!`);
    } catch (error) {
      const msg =
        error.message ||
        'Falha ao gerar perguntas com o Gemini. Verifique se a chave GEMINI_API_KEY está configurada no servidor backend.';
      setErrorMsg(msg);
      notifyAlert('Aviso da IA', msg);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Gerador de Quiz com IA"
        subtitle={salaNome ? `Sala: ${salaNome}` : 'Google Gemini 2.0'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Formulário de Geração */}
        <Card style={styles.formCard}>
          <View style={styles.aiHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles" size={20} color={colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>Inteligência Artificial Pedagógica</Text>
              <Text style={styles.aiDesc}>
                Gere questionários de múltipla escolha alinhados aos tópicos das aulas em instantes.
              </Text>
            </View>
          </View>

          {errorMsg ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <Input
            label="Tema do Quiz"
            placeholder="Ex: Engenharia de Requisitos, Astronomia, Algoritmos..."
            value={tema}
            onChangeText={(t) => {
              setTema(t);
              setErrorMsg('');
            }}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Quantidade de Perguntas"
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
            variant="pink"
            icon={<Ionicons name="sparkles" size={16} color="#FFFFFF" />}
            style={styles.generateBtn}
          />
        </Card>

        {/* Perguntas Geradas */}
        {quizResultado && quizResultado.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
              <Text style={styles.resultsTitle}>
                Perguntas Geradas pela IA ({quizResultado.length})
              </Text>
            </View>

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

      {/* Mascote Flutuante no Canto Inferior Direito */}
      <FloatingMascot />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
  },
  container: {
    padding: 16,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 48,
  },
  formCard: {
    padding: 20,
    marginBottom: 16,
    borderColor: colors.border,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 229, 0.3)',
  },
  aiTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  aiDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  diffRow: {
    flexDirection: 'row',
    gap: 6,
  },
  diffChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
  },
  diffChipActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryLight,
  },
  diffChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  diffChipTextActive: {
    color: colors.secondary,
    fontWeight: '800',
  },
  generateBtn: {
    marginTop: 14,
  },
  resultsSection: {
    marginTop: 10,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  questionCard: {
    padding: 16,
    marginBottom: 12,
    borderColor: colors.border,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 12,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionItemCorrect: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  optionLetter: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 10,
  },
  optionLetterCorrect: {
    color: colors.primary,
  },
  optionText: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  optionTextCorrect: {
    color: colors.primary,
    fontWeight: '700',
  },
});
