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
  Vibration,
} from 'react-native';
import { C, S, R, CATEGORY_EMOJI } from '../theme';
import { api } from '../services/api';
import { parseNaturalTransaction, formatTransactionPreview } from '../services/naturalLanguageParser';

const tipos = ['GASTO', 'INGRESO'];
const naturalezas = ['FIJO', 'VARIABLE'];
const expenseCategories = ['Alimentacion', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Deuda', 'Inversion', 'Otro'];
const incomeCategories = ['Salario', 'Ventas', 'Freelance', 'Comision', 'Interes', 'Otro'];

// Quick suggestions for fast input
const QUICK_GASTOS = [
  { label: 'Café', emoji: '☕', monto: '4.50' },
  { label: 'Comida', emoji: '🍔', monto: '15' },
  { label: 'Transporte', emoji: '🚗', monto: '12' },
  { label: 'Verdulería', emoji: '🥗', monto: '8' },
];
const QUICK_INGRESOS = [
  { label: 'Salario', emoji: '💼', monto: '100' },
  { label: 'Freelance', emoji: '💻', monto: '50' },
  { label: 'Venta', emoji: '🛒', monto: '25' },
];

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
  const [confirmado, setConfirmado] = useState(false);

  const handleChange = (text) => {
    setInput(text);
    const result = parseNaturalTransaction(text);
    if (result && result.monto > 0) {
      setParsed(result);
      setTipo(result.tipo);
      setCategoria(result.categoria);
      setMonto(result.monto.toString());
      setDescripcion(result.descripcion || '');
      Vibration.vibrate(30);
    } else {
      setParsed(null);
    }
  };

  const handleQuickAmount = (item) => {
    setInput(`${item.label} $${item.monto}`);
    setParsed({ tipo, categoria: item.label, monto: parseFloat(item.monto), descripcion: item.label });
    setMonto(item.monto);
    setCategoria(item.label);
    Vibration.vibrate(30);
  };

  const handleSubmit = async () => {
    if (!monto || parseFloat(monto) <= 0) return;
    if (!categoria) return Alert.alert('Categoría', 'Elegí una categoría antes de confirmar.');

    setLoading(true);
    try {
      await api.addTx({
        tipo,
        naturaleza,
        categoria,
        monto: parseFloat(monto),
        descripcion: descripcion || '',
        fecha: new Date().toISOString().split('T')[0],
      });
      setConfirmado(true);
      Vibration.vibrate([0, 50, 50, 50]);
      setTimeout(() => {
        navigation.goBack();
      }, 800);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = tipo === 'INGRESO' ? incomeCategories : expenseCategories;
  const quickItems = tipo === 'INGRESO' ? QUICK_INGRESOS : QUICK_GASTOS;

  if (confirmado) {
    return (
      <SafeAreaView style={styles.confirmScreen}>
        <View style={styles.confirmCard}>
          <Text style={styles.confirmEmoji}>✅</Text>
          <Text style={styles.confirmTitle}>¡Registrado!</Text>
          <Text style={styles.confirmAmount}>
            {tipo === 'INGRESO' ? '+' : '-'}${parseFloat(monto).toLocaleString('es-AR')}
          </Text>
          <Text style={styles.confirmCat}>{categoria}</Text>
        </View>
      </SafeAreaView>
    );
  }

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

          {/* Tipo toggle */}
          <View style={styles.toggleRow}>
            {tipos.map(t => (
              <Pressable
                key={t}
                style={[styles.toggleBtn, tipo === t && (t === 'INGRESO' ? styles.toggleGreen : styles.toggleRed)]}
                onPress={() => { setTipo(t); setCategoria(''); setParsed(null); }}
              >
                <Text style={[styles.toggleText, tipo === t && styles.toggleTextActive]}>
                  {t === 'INGRESO' ? '↑ Ingreso' : '↓ Gasto'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Monto grande */}
          <View style={styles.montoCard}>
            <Text style={styles.montoSymbol}>$</Text>
            <TextInput
              style={styles.montoInput}
              placeholder="0"
              placeholderTextColor={C.textTertiary}
              value={monto}
              onChangeText={setMonto}
              keyboardType="decimal-pad"
              autoFocus={!monto}
            />
          </View>

          {/* Input natural */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Descripción</Text>
            <TextInput
              style={styles.mainInput}
              placeholder='"Café $4.50" o "Comida 500"'
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

          {/* Quick amounts */}
          <View style={styles.quickSection}>
            <Text style={styles.quickLabel}>快速 rápido</Text>
            <View style={styles.quickRow}>
              {quickItems.map((item, i) => (
                <Pressable key={i} style={styles.quickChip} onPress={() => handleQuickAmount(item)}>
                  <Text style={styles.quickEmoji}>{item.emoji}</Text>
                  <Text style={styles.quickText}>{item.label}</Text>
                  <Text style={styles.quickMonto}>${item.monto}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Categorías */}
          <Text style={styles.catLabel}>Categoría</Text>
          <View style={styles.categoriesWrap}>
            {categories.map(cat => (
              <Pressable
                key={cat}
                style={[styles.catChip, categoria === cat && styles.catChipActive]}
                onPress={() => { setCategoria(cat); Vibration.vibrate(20); }}
              >
                <Text style={styles.catEmoji}>{CATEGORY_EMOJI[cat] || '📦'}</Text>
                <Text style={[styles.catText, categoria === cat && styles.catTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </View>

          {/* Descripción opcional */}
          <TextInput
            style={styles.input}
            placeholder="Descripción adicional (opcional)"
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
            <Text style={styles.submitBtnText}>{loading ? 'Guardando...' : '✅ Confirmar'}</Text>
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
  content: { padding: S.lg, gap: S.lg },

  toggleRow: { flexDirection: 'row', gap: S.sm },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: R.lg,
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  toggleGreen: { backgroundColor: '#2C9B3D', borderColor: '#2C9B3D' },
  toggleRed: { backgroundColor: '#C9362A', borderColor: '#C9362A' },
  toggleText: { fontWeight: '700', fontSize: 15, color: C.textSecondary },
  toggleTextActive: { color: '#fff' },

  montoCard: {
    backgroundColor: C.surface,
    borderRadius: R.xl,
    padding: S.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  montoSymbol: { fontSize: 40, fontWeight: '800', color: C.primary },
  montoInput: {
    flex: 1,
    fontSize: 40,
    fontWeight: '800',
    color: C.text,
    padding: 0,
    marginLeft: S.sm,
  },

  inputCard: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: S.md,
    gap: S.xs,
    borderWidth: 1,
    borderColor: C.border,
  },
  inputLabel: { fontSize: 12, fontWeight: '700', color: C.textSecondary, letterSpacing: 0.5 },
  mainInput: {
    backgroundColor: C.bg,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: 14,
    color: C.text,
    fontSize: 17,
    borderWidth: 1,
    borderColor: C.border,
  },
  preview: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: R.md,
    padding: S.sm,
    borderLeftWidth: 3,
    borderLeftColor: C.green,
    marginTop: S.xs,
  },
  previewText: { color: C.green, fontSize: 14, fontWeight: '600' },

  quickSection: { gap: S.sm },
  quickLabel: { fontSize: 12, fontWeight: '700', color: C.textSecondary, letterSpacing: 0.5 },
  quickRow: { flexDirection: 'row', gap: S.sm },
  quickChip: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: R.md,
    padding: S.sm,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: C.border,
  },
  quickEmoji: { fontSize: 20 },
  quickText: { fontSize: 11, fontWeight: '600', color: C.text },
  quickMonto: { fontSize: 10, color: C.textSecondary },

  catLabel: { fontSize: 12, fontWeight: '700', color: C.textSecondary, letterSpacing: 0.5 },
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
  catEmoji: { fontSize: 15 },
  catText: { fontSize: 12, fontWeight: '600', color: C.textSecondary },
  catTextActive: { color: '#000' },

  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: 13,
    color: C.text,
    fontSize: 15,
  },

  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: R.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },

  // Confirm screen
  confirmScreen: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  confirmCard: { alignItems: 'center', gap: S.md },
  confirmEmoji: { fontSize: 64 },
  confirmTitle: { fontSize: 28, fontWeight: '800', color: C.text },
  confirmAmount: { fontSize: 36, fontWeight: '800', color: C.green },
  confirmCat: { fontSize: 16, color: C.textSecondary },
});