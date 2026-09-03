// src/screens/professor/MissoesGerenciarScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
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
import { PRESET_STICKERS, getStickerSource } from '../../constants/stickers';
import { FloatingMascot } from '../../components/FloatingMascot';

export const MissoesGerenciarScreen = ({ route, navigation }) => {
  const { salaId, periodos = [], missao } = route.params;
  const isEditing = !!missao;

  const [titulo, setTitulo] = useState(missao?.titulo || '');
  const [descricao, setDescricao] = useState(missao?.descricao || '');
  const [ordem, setOrdem] = useState(missao?.ordem ? String(missao.ordem) : '1');
  const [xpReward, setXpReward] = useState(missao?.xp_reward ? String(missao.xp_reward) : '100');
  const [pesoNota, setPesoNota] = useState(missao?.peso_nota ? String(missao.peso_nota) : '1');
  const [periodoId, setPeriodoId] = useState(missao?.periodo_id || (periodos[0]?.id || ''));
  const [dataLimite, setDataLimite] = useState(missao?.data_limite || '');
  const [stickerId, setStickerId] = useState(missao?.sticker_recompensa_id || '');

  const [stickers, setStickers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    carregarStickers();
  }, []);

  const carregarStickers = async () => {
    try {
      const res = await professorApi.listarStickers();
      const serverStickers = res.data || [];
      if (serverStickers.length > 0) {
        setStickers(serverStickers);
      } else {
        setStickers(PRESET_STICKERS);
      }
    } catch (e) {
      setStickers(PRESET_STICKERS);
    }
  };

  const handleSalvar = async () => {
    if (!titulo.trim()) {
      setErrorMsg('Informe o título da missão.');
      return;
    }

    if (periodos.length > 0 && !periodoId) {
      setErrorMsg('Selecione o quadrimestre da missão.');
      return;
    }

    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      ordem: parseInt(ordem, 10) || 1,
      xp_reward: parseInt(xpReward, 10) || 0,
      peso_nota: parseFloat(pesoNota) || 1,
      periodo_id: periodoId || null,
      data_limite: dataLimite.trim() || null,
      sticker_recompensa_id: stickerId || null,
    };

    try {
      setSubmitting(true);
      setErrorMsg('');

      if (isEditing) {
        await professorApi.editarMissao(salaId, missao.id, payload);
        notifyAlert('Sucesso!', 'Missão atualizada com sucesso!', () => {
          navigation.goBack();
        });
      } else {
        await professorApi.cadastrarMissao(salaId, payload);
        notifyAlert('Sucesso!', 'Missão cadastrada na trilha!', () => {
          navigation.goBack();
        });
      }
    } catch (error) {
      setErrorMsg(error.message || 'Falha ao salvar missão.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={isEditing ? 'Editar Missão' : 'Cadastrar Missão'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Card style={styles.formCard}>
          {errorMsg ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <Input
            label="Título da Missão"
            placeholder="Ex: Entrega do Protótipo de Média Fidelidade"
            value={titulo}
            onChangeText={(t) => {
              setTitulo(t);
              setErrorMsg('');
            }}
          />

          <Input
            label="Instruções / Descrição"
            placeholder="Descreva detalhadamente o objetivo desta missão..."
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={4}
          />

          {/* Quadrimestre / Período */}
          <View style={styles.fieldSection}>
            <Text style={styles.label}>Quadrimestre / Período</Text>
            {periodos.length === 0 ? (
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={18} color={colors.warning} />
                <Text style={styles.warningBoxText}>
                  Aviso: Crie um quadrimestre antes para que a missão fique organizada na trilha.
                </Text>
              </View>
            ) : (
              <View style={styles.chipRow}>
                {periodos.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.chip, periodoId === p.id && styles.chipActive]}
                    onPress={() => {
                      setPeriodoId(p.id);
                      setErrorMsg('');
                    }}
                  >
                    <Text style={[styles.chipText, periodoId === p.id && styles.chipTextActive]}>
                      {p.nome}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Ordem na Trilha (1 a 5)"
                placeholder="1"
                value={ordem}
                onChangeText={setOrdem}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Peso da Nota"
                placeholder="1.0"
                value={pesoNota}
                onChangeText={setPesoNota}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Recompensa de XP"
                placeholder="100"
                value={xpReward}
                onChangeText={setXpReward}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Data Limite (AAAA-MM-DD)"
                placeholder="Ex: 2026-11-30"
                value={dataLimite}
                onChangeText={setDataLimite}
              />
            </View>
          </View>

          {/* Seleção de Sticker de Recompensa */}
          <View style={styles.fieldSection}>
            <Text style={styles.label}>Sticker / Badge de Recompensa (Opcional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stickerScroll}>
              <TouchableOpacity
                style={[styles.stickerCard, !stickerId && styles.stickerCardActive]}
                onPress={() => setStickerId('')}
              >
                <Ionicons name="close-circle-outline" size={32} color={colors.textMuted} />
                <Text style={styles.stickerName}>Nenhum</Text>
              </TouchableOpacity>

              {stickers.map((s) => {
                const imageSource = s.source || getStickerSource(s.imagem_url || s.nome);
                const isSelected = stickerId === s.id;
                return (
                  <TouchableOpacity
                    key={s.id || s.nome}
                    style={[styles.stickerCard, isSelected && styles.stickerCardActive]}
                    onPress={() => setStickerId(s.id)}
                  >
                    <Image source={imageSource} style={styles.stickerImg} resizeMode="contain" />
                    <Text style={styles.stickerName} numberOfLines={1}>
                      {s.nome}
                    </Text>
                    <Badge raridade={s.raridade} style={{ marginTop: 2 }} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <Button
            title={isEditing ? 'Atualizar Missão' : 'Salvar Missão'}
            onPress={handleSalvar}
            loading={submitting}
            style={styles.saveBtn}
          />
        </Card>
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
  },
  container: {
    padding: 16,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 30,
  },
  formCard: {
    padding: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderColor: '#FECACA',
    borderWidth: 1,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldSection: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  helper: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 10,
    borderRadius: 6,
    gap: 8,
  },
  warningBoxText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  stickerScroll: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  stickerCard: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    marginRight: 10,
    width: 90,
  },
  stickerCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  stickerImg: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginBottom: 4,
  },
  stickerName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  saveBtn: {
    marginTop: 16,
  },
});
