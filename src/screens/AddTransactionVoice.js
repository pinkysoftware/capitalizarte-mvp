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
} from 'react-native';
import { C, S, R, CATEGORY_EMOJI } from '../theme';
import { parseNaturalTransaction, formatTransactionPreview } from '../services/naturalLanguageParser';

const tipos = ['GASTO', 'INGRESO'];
const naturalezas = ['FIJO', 'VARIABLE'];
const expenseCategories = ['Alimentacion', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Deuda', 'Inversion', 'Otro'];
const incomeCategories = ['Salario', 'Ventas', 'Freelance', 'Comision', 'Interes', 'Otro'];

export default function AddTransactionVoice({ navigation, route }) {
  const tipoInicial = route?.params?.tipo || 'GASTO';
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
      await require('../services/api').api.addTx({
        tipo, naturaleza, categoria,
        monto: parseFloat(monto),
        descripcion: descripcion || '',
        fecha: new Date().toISOString().split('T')[0],
      });
      navigation.goBack();
    } catch (e) {
      require('react-native').Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = tipo === 'INGRESO' ? incomeCategories : expenseCategories;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Input principal */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>✍️ Escribí o dictá tu gasto</Text>
          <TextInput
            style={styles.mainInput}
            placeholder='Ej: "cafe $4.50" o "comida 500"'
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
                {t === 'INGRESO' ? '💰' : '💸'} {t}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Monto */}
        <View style={styles.montoRow}>
          <Text style={styles.montoSymbol}>$</Text>
          <TextInput
            style={styles.montoInput}
            placeholder="0.00"
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
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: S.lg, gap: S.lg },
  inputCard: { backgroundColor: C.surface, borderRadius: R.lg, padding: S.lg, gap: S.sm },
  inputLabel: { fontSize: 16, fontWeight: '700', color: C.text },
  mainInput: {
    backgroundColor: C.bg,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: 16,
    color: C.text,
    fontSize: 18,
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
  previewText: { color: C.text, fontSize: 15, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', gap: S.sm },
  toggleBtn: { flex: 1, paddingVertical: 14, borderRadius: R.md, alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  toggleGreen: { backgroundColor: C.green, borderColor: C.green },
  toggleRed: { backgroundColor: C.red, borderColor: C.red },
  toggleText: { fontWeight: '700', fontSize: 14, color: C.textSecondary },
  toggleTextActive: { color: '#fff' },
  montoRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  montoSymbol: { fontSize: 32, fontWeight: '800', color: C.text },
  montoInput: { flex: 1, fontSize: 32, fontWeight: '800', color: C.text, padding: 0 },
  categoriesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: S.md, paddingVertical: 10, borderRadius: R.full, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  catChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  catEmoji: { fontSize: 16 },
  catText: { fontSize: 14, fontWeight: '600', color: C.textSecondary },
  catTextActive: { color: '#000' },
  input: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: 16, color: C.text, fontSize: 16 },
  submitBtn: { backgroundColor: C.primary, borderRadius: R.md, paddingVertical: 16, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
});
