// src/screens/aluno/QuizScreen.js
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
import { alunoApi } from '../../api/aluno';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';

export const QuizScreen = ({ route, navigation }) => {
  const { quizId, quizTitulo } = route.params;

  const [respostas, setRespostas] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [resultado, setResultado] = useState(null);

  // Simulação de questões carregadas ou passadas via parâmetro / Supabase
  // Caso o backend passe as perguntas, renderizamos dinamicamente
  const questoesExemplo = route.params?.perguntas || [
    {
      id: 'q1',
      pergunta: 'Qual o principal objetivo da fase de levantamento de requisitos?',
      opcoes: [
        'Escrever o código-fonte em tempo recorde',
        'Compreender as necessidades reais dos usuários e do negócio',
        'Desenhar as telas finais em alta fidelidade',
        'Configurar o servidor de banco de dados em produção',
      ],
    },
    {
      id: 'q2',
      pergunta: 'Em metodologias ágeis como o Scrum, o que representa uma Sprint?',
      opcoes: [
        'Um ciclo fixo de desenvolvimento iterativo e incremental',
        'A reunião de encerramento do contrato com o cliente',
        'Uma ferramenta de diagramação de classes UML',
        'O momento em que todos os testes são descartados',
      ],
    },
  ];

  const handleSelectOption = (questionId, optionLetter) => {
    setRespostas({
      ...respostas,
      [questionId]: optionLetter,
    });
  };

  const handleEnviarQuiz = async () => {
    try {
      setSubmitting(true);
      const res = await alunoApi.responderQuiz(quizId, respostas);
      setResultado(res.data);
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao enviar respostas do quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={quizTitulo || 'Quiz da Turma'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
        {resultado ? (
          /* Card de Resultado Final */
          <Card style={styles.resultCard}>
            <View style={styles.resultIconCircle}>
              <Ionicons name="trophy" size={40} color={colors.warning} />
            </View>
            <Text style={styles.resultTitle}>Quiz Concluído!</Text>
            <Text style={styles.resultMessage}>{resultado.message}</Text>

            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreNum}>{resultado.score}%</Text>
                <Text style={styles.scoreLabel}>Aproveitamento</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreNum}>
                  {resultado.correct_answers} / {resultado.total_questions}
                </Text>
                <Text style={styles.scoreLabel}>Acertos</Text>
              </View>
            </View>

            <Button
              title="Voltar ao Dashboard"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 20, width: '100%' }}
            />
          </Card>
        ) : (
          /* Lista de Questões para Responder */
          <View>
            <Text style={styles.instructionsText}>
              Selecione a alternativa correta para cada uma das perguntas abaixo:
            </Text>

            {questoesExemplo.map((q, qIdx) => (
              <Card key={q.id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Badge label={`Questão ${qIdx + 1}`} status="disponivel" />
                </View>
                <Text style={styles.questionTitle}>{q.pergunta}</Text>

                <View style={styles.optionsList}>
                  {q.opcoes.map((opt, optIdx) => {
                    const letra = String.fromCharCode(65 + optIdx);
                    const isSelected = respostas[q.id] === letra;
                    return (
                      <TouchableOpacity
                        key={optIdx}
                        style={[
                          styles.optionButton,
                          isSelected && styles.optionButtonSelected,
                        ]}
                        onPress={() => handleSelectOption(q.id, letra)}
                      >
                        <View
                          style={[
                            styles.letterBadge,
                            isSelected && styles.letterBadgeSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.letterText,
                              isSelected && styles.letterTextSelected,
                            ]}
                          >
                            {letra}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Card>
            ))}

            <Button
              title="Finalizar e Enviar Quiz"
              onPress={handleEnviarQuiz}
              loading={submitting}
              icon={<Ionicons name="send-outline" size={18} color="#FFFFFF" />}
              style={styles.submitBtn}
            />
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
  instructionsText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  questionCard: {
    padding: 16,
    marginVertical: 6,
  },
  questionHeader: {
    marginBottom: 8,
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 12,
  },
  optionsList: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  letterBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  letterBadgeSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  letterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  letterTextSelected: {
    color: '#FFFFFF',
  },
  optionText: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  submitBtn: {
    marginTop: 16,
  },
  resultCard: {
    alignItems: 'center',
    padding: 24,
    marginTop: 20,
  },
  resultIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  resultMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
    justifyContent: 'center',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreNum: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

