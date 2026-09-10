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

// Utilitários para Formatação e Validação de Datas (Brasil DD/MM/AAAA <-> ISO)
const formatDateToBR = (dateStr) => {
  if (!dateStr) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;

  try {
    const clean = dateStr.split('T')[0]; // pega YYYY-MM-DD
    const parts = clean.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
  } catch (e) {}
  return dateStr;
};

const maskDateInput = (text) => {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const parseDateToISO = (dateStr) => {
  if (!dateStr || !dateStr.trim()) return null;
  const trimmed = dateStr.trim();

  // Formato brasileiro DD/MM/AAAA
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('/');
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 2000 || y > 2100) {
      throw new Error('Data limite inválida. Informe uma data real (Ex: 30/11/2026).');
    }
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T23:59:59`;
  }

  // Se já for formato ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.includes('T') ? trimmed : `${trimmed}T23:59:59`;
  }

  throw new Error('Formato de data inválido. Use o formato brasileiro DD/MM/AAAA (ex: 30/11/2026).');
};

const isUUID = (str) => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str).trim());
};

export const MissoesGerenciarScreen = ({ route, navigation }) => {
  const { salaId, periodos = [], missao } = route.params;
  const isEditing = !!missao;

  const [titulo, setTitulo] = useState(missao?.titulo || '');
  const [descricao, setDescricao] = useState(missao?.descricao || '');
  const [ordem, setOrdem] = useState(missao?.ordem ? String(missao.ordem) : '1');
  const [xpReward, setXpReward] = useState(missao?.xp_reward ? String(missao.xp_reward) : '100');
  const [pesoNota, setPesoNota] = useState(missao?.peso_nota ? String(missao.peso_nota) : '1');
  const [periodoId, setPeriodoId] = useState(missao?.periodo_id || (periodos[0]?.id || ''));
  const [dataLimite, setDataLimite] = useState(missao?.data_limite ? formatDateToBR(missao.data_limite) : '');
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

      // Mapeia os 20 stickers pré-definidos vinculando o UUID real do Supabase caso exista no banco
      const merged = PRESET_STICKERS.map((preset) => {
        const found = serverStickers.find(
          (s) =>
            s.nome?.trim().toLowerCase() === preset.nome.trim().toLowerCase() ||
            s.id === preset.id
        );
        return {
          ...preset,
          dbId: found ? found.id : null,
          hasDbRecord: !!found,
        };
      });

      // Adiciona também quaisquer stickers extras personalizados enviados pelo professor
      serverStickers.forEach((s) => {
        if (!merged.some((m) => m.dbId === s.id || m.nome?.trim().toLowerCase() === s.nome?.trim().toLowerCase())) {
          merged.push({
            ...s,
            source: getStickerSource(s.imagem_url || s.nome),
            dbId: s.id,
            hasDbRecord: true,
          });
        }
      });

      setStickers(merged);
    } catch (e) {
      setStickers(PRESET_STICKERS.map((p) => ({ ...p, dbId: null, hasDbRecord: false })));
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

    let isoDataLimite = null;
    if (dataLimite.trim()) {
      try {
        isoDataLimite = parseDateToISO(dataLimite);
      } catch (err) {
        setErrorMsg(err.message);
        notifyAlert('Data Inválida', err.message);
        return;
      }
    }

    let finalStickerId = null;
    if (stickerId) {
      if (isUUID(stickerId)) {
        finalStickerId = stickerId;
      } else {
        // Busca o sticker selecionado na lista para extrair o UUID do banco
        const matchingSticker = stickers.find((s) => s.id === stickerId || s.dbId === stickerId || s.nome === stickerId);
        if (matchingSticker && isUUID(matchingSticker.dbId)) {
          finalStickerId = matchingSticker.dbId;
        } else {
          setErrorMsg(
            'Este sticker ainda não está cadastrado na tabela do Supabase. Para salvar com sticker, certifique-se de cadastrá-lo no Catálogo de Stickers primeiro ou selecione "Nenhum".'
          );
          notifyAlert(
            'Aviso sobre o Sticker',
            'O sticker selecionado ainda não possui registro no banco de dados do Supabase. Selecione "Nenhum" ou cadastre o sticker no Catálogo de Stickers primeiro.'
          );
          return;
        }
      }
    }

    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      ordem: parseInt(ordem, 10) || 1,
      xp_reward: parseInt(xpReward, 10) || 0,
      peso_nota: parseFloat(pesoNota) || 1,
      periodo_id: periodoId || null,
      data_limite: isoDataLimite,
      sticker_recompensa_id: finalStickerId,
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
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
                label="Data Limite (DD/MM/AAAA)"
                placeholder="Ex: 30/11/2026"
                value={dataLimite}
                onChangeText={(text) => {
                  setDataLimite(maskDateInput(text));
                  setErrorMsg('');
                }}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          {/* Seleção de Sticker de Recompensa */}
          <View style={styles.fieldSection}>
            <Text style={styles.label}>Sticker / Badge de Recompensa (Opcional)</Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              horizontal
              style={styles.stickerScroll}
            >
              <TouchableOpacity
                style={[styles.stickerCard, !stickerId && styles.stickerCardActive]}
                onPress={() => setStickerId('')}
              >
                <Ionicons name="close-circle-outline" size={32} color={colors.textMuted} />
                <Text style={styles.stickerName}>Nenhum</Text>
              </TouchableOpacity>

              {stickers.map((s) => {
                const imageSource = s.source || getStickerSource(s.imagem_url || s.nome);
                const currentId = s.dbId || s.id;
                const isSelected = stickerId === currentId || (s.dbId && stickerId === s.dbId) || stickerId === s.id;
                return (
                  <TouchableOpacity
                    key={s.id || s.nome}
                    style={[styles.stickerCard, isSelected && styles.stickerCardActive]}
                    onPress={() => setStickerId(currentId)}
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
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 48,
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
    gap: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    flex: 1,
  },
  fieldSection: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  warningBoxText: {
    fontSize: 12,
    color: colors.warning,
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickerScroll: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  stickerCard: {
    width: 80,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
  },
  stickerCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
  },
  stickerImg: {
    width: 44,
    height: 44,
    marginBottom: 4,
  },
  stickerName: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  saveBtn: {
    marginTop: 18,
  },
});
