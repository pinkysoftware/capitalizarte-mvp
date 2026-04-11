import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { C, S, R, CATEGORY_EMOJI } from '../theme';
import { api } from '../services/api';
import { parseNaturalTransaction, formatTransactionPreview } from '../services/naturalLanguageParser';

const tipos = ['GASTO', 'INGRESO'];
const naturalezas = ['FIJO', 'VARIABLE'];
const expenseCategories = ['Alimentacion', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Deuda', 'Inversion', 'Otro'];
const incomeCategories = ['Salario', 'Ventas', 'Freelance', 'Comision', 'Interes', 'Otro'];

export default function AddTransactionVoice({ navigation, route }) {
  const rawTipo = route?.params?.tipo;
  const tipoInicial = (rawTipo && String(rawTipo).length > 0) ? String(rawTipo) : 'GASTO';
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState(tipoInicial);
  const [naturaleza, setNaturaleza] = useState('VARIABLE');
  const [categoria, setCategoria] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleChange = (text) => {
    setInput(text);
    const result = parseNaturalTransaction(text);
    if (result) {
      setParsed(result);
      setTipo(result.tipo);
      setCategoria(result.categoria);
      setMonto(result.monto.toString());
      setDescripcion(result.descripcion);
    } else {
      setParsed(null);
    }
  };

  const handleSubmit = async () => {
    if (!monto || parseFloat(monto) <= 0) return;
    if (!categoria) return;

    setLoading(true);
    try {
      await api.addTx({
        tipo, naturaleza, categoria,
        monto: parseFloat(monto),
        descripcion: descripcion || '',
        fecha: new Date().toISOString().split('T')[0],
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = tipo === 'INGRESO' ? incomeCategories : expenseCategories;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Input principal */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Escribí o dictá tu movimiento</Text>
            <TextInput
              style={styles.mainInput}
              placeholder='"cafe $4.50" o "comida 500"'
              placeholderTextColor={C.textTertiary}
              value={input}
              onChangeText={handleChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {parsed && (
              <View style={styles.preview}>
                <Text style={styles.previewText}>{formatTransactionPreview(parsed)}</Text>
              </View>
            )}
          </View>

          {/* Tipo */}
          <View style={styles.toggleRow}>
            {tipos.map(t => (
              <Pressable
                key={t}
                style={[styles.toggleBtn, tipo === t && (t === 'INGRESO' ? styles.toggleGreen : styles.toggleRed)]}
                onPress={() => { setTipo(t); setCategoria(''); }}
              >
                <Text style={[styles.toggleText, tipo === t && styles.toggleTextActive]}>
                  {t === 'INGRESO' ? '↑ Ingreso' : '↓ Gasto'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Monto */}
          <View style={styles.montoRow}>
            <Text style={styles.montoSymbol}>$</Text>
            <TextInput
              style={styles.montoInput}
              placeholder="0"
              placeholderTextColor={C.textTertiary}
              value={monto}
              onChangeText={setMonto}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Categorías */}
          <View style={styles.categoriesWrap}>
            {categories.map(cat => (
              <Pressable
                key={cat}
                style={[styles.catChip, categoria === cat && styles.catChipActive]}
                onPress={() => setCategoria(cat)}
              >
                <Text style={styles.catEmoji}>{CATEGORY_EMOJI[cat] || '📦'}</Text>
                <Text style={[styles.catText, categoria === cat && styles.catTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </View>

          {/* Descripción */}
          <TextInput
            style={styles.input}
            placeholder="Descripción (opcional)"
            placeholderTextColor={C.textTertiary}
            value={descripcion}
            onChangeText={setDescripcion}
          />

          {/* Submit */}
          <Pressable
            style={[styles.submitBtn, (!monto || !categoria || loading) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!monto || !categoria || loading}
          >
            <Text style={styles.submitBtnText}>Confirmar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    padding: S.md,
    gap: S.md,
  },

  inputCard: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: S.md,
    gap: S.sm,
  },
  inputLabel: { fontSize: 14, fontWeight: '700', color: C.text },
  mainInput: {
    backgroundColor: C.bg,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: 12,
    color: C.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  preview: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    borderRadius: R.md,
    padding: S.sm,
    borderLeftWidth: 3,
    borderLeftColor: C.green,
  },
  previewText: { color: C.text, fontSize: 14, fontWeight: '600' },

  toggleRow: { flexDirection: 'row', gap: S.sm },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: R.md,
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  toggleGreen: { backgroundColor: C.green, borderColor: C.green },
  toggleRed: { backgroundColor: C.red, borderColor: C.red },
  toggleText: { fontWeight: '700', fontSize: 14, color: C.textSecondary },
  toggleTextActive: { color: '#fff' },

  montoRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  montoSymbol: { fontSize: 28, fontWeight: '800', color: C.text },
  montoInput: { flex: 1, fontSize: 28, fontWeight: '800', color: C.text, padding: 0 },

  categoriesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: S.xs },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: S.sm,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  catChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  catEmoji: { fontSize: 14 },
  catText: { fontSize: 12, fontWeight: '600', color: C.textSecondary },
  catTextActive: { color: '#000' },

  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: 12,
    color: C.text,
    fontSize: 15,
  },

  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
});
