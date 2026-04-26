import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  Vibration,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Feather } from '@expo/vector-icons';
import { api } from '../services/api';
import { parseNaturalTransaction, formatTransactionPreview } from '../services/naturalLanguageParser';
import { useTheme } from '../contexts/ThemeContext';

const TIPO_GASTO = 'GASTO';
const TIPO_INGRESO = 'INGRESO';

const QUICK_GASTOS = [
  { label: 'Café', icon: 'coffee', monto: '4.50' },
  { label: 'Comida', icon: 'shopping-bag', monto: '15' },
  { label: 'Transporte', icon: 'truck', monto: '12' },
  { label: 'Verdulería', icon: 'shopping-cart', monto: '8' },
];

const QUICK_INGRESOS = [
  { label: 'Salario', icon: 'briefcase', monto: '100' },
  { label: 'Freelance', icon: 'zap', monto: '50' },
  { label: 'Venta', icon: 'tag', monto: '25' },
];

const expenseCategories = ['Alimentacion', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Deuda', 'Inversion', 'Otro'];
const incomeCategories = ['Salario', 'Ventas', 'Freelance', 'Comision', 'Interes', 'Otro'];

const CATEGORY_ICONS_MAP = {
  'Alimentacion': 'shopping-bag',
  'Transporte': 'truck',
  'Vivienda': 'home',
  'Salud': 'heart',
  'Entretenimiento': 'film',
  'Deuda': 'credit-card',
  'Inversion': 'trending-up',
  'Otro': 'package',
  'Salario': 'briefcase',
  'Ventas': 'tag',
  'Freelance': 'zap',
  'Comision': 'percent',
  'Interes': 'activity',
};

export default function AddTransactionVoice({ navigation, route }) {
  const { colors } = useTheme();
  const rawTipo = route?.params?.tipo;
  const tipoInicial = (rawTipo && String(rawTipo).length > 0) ? String(rawTipo) : TIPO_GASTO;
  const [tipo, setTipo] = useState(tipoInicial);
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [naturaleza] = useState('VARIABLE');
  const [categoria, setCategoria] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [confirmado, setConfirmado] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = React.useRef(null);

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
    });
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Text-to-Speech para confirmar
  const speak = (text) => {
    Speech.speak(text, { language: 'es-ES', pitch: 1, rate: 0.9 });
  };

  const handleInputChange = (text) => {
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
    if (!monto || parseFloat(monto) <= 0) return Alert.alert('Monto requerido', 'Ingresá un monto');
    if (!categoria) return Alert.alert('Categoría', 'Elegí una categoría');

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

      // Feedback de voz
      const tipoTxt = tipo === TIPO_INGRESO ? 'Ingreso' : 'Gasto';
      speak(`${tipoTxt} de $${parseFloat(monto).toLocaleString('es-AR')} registrado en ${categoria}`);

      setConfirmado(true);
      Vibration.vibrate([0, 50, 50, 50]);
      setTimeout(() => navigation.goBack(), 1200);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = tipo === TIPO_INGRESO ? incomeCategories : expenseCategories;
  const quickItems = tipo === TIPO_INGRESO ? QUICK_INGRESOS : QUICK_GASTOS;
  const bottomPad = keyboardHeight > 0 ? keyboardHeight + 120 : 120;

  if (confirmado) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={styles.confirmScreen}>
          <View style={[styles.confirmCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.confirmIcon, { backgroundColor: colors.green + '20' }]}>
              <Feather name="check" size={40} color={colors.green} />
            </View>
            <Text style={[styles.confirmTitle, { color: colors.text }]}>¡Registrado!</Text>
            <Text style={[styles.confirmAmount, { color: tipo === TIPO_INGRESO ? colors.green : colors.red }]}>
              {tipo === TIPO_INGRESO ? '+' : '-'}${parseFloat(monto).toLocaleString('es-AR')}
            </Text>
            <Text style={[styles.confirmCat, { color: colors.textSecondary }]}>{categoria}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Tipo toggle */}
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleBtn, tipo === TIPO_GASTO && { backgroundColor: colors.red, borderColor: colors.red }]}
              onPress={() => { setTipo(TIPO_GASTO); setCategoria(''); setParsed(null); }}
            >
              <Feather name="minus-circle" size={18} color={tipo === TIPO_GASTO ? '#FFF' : colors.textSecondary} />
              <Text style={[styles.toggleText, { color: tipo === TIPO_GASTO ? '#FFF' : colors.textSecondary }]}>Gasto</Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, tipo === TIPO_INGRESO && { backgroundColor: colors.green, borderColor: colors.green }]}
              onPress={() => { setTipo(TIPO_INGRESO); setCategoria(''); setParsed(null); }}
            >
              <Feather name="plus-circle" size={18} color={tipo === TIPO_INGRESO ? '#FFF' : colors.textSecondary} />
              <Text style={[styles.toggleText, { color: tipo === TIPO_INGRESO ? '#FFF' : colors.textSecondary }]}>Ingreso</Text>
            </Pressable>
          </View>

          {/* Monto grande */}
          <View style={[styles.montoCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.montoSymbol, { color: colors.primary }]}>$</Text>
            <TextInput
              style={[styles.montoInput, { color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              value={monto}
              onChangeText={setMonto}
              keyboardType="decimal-pad"
              ref={inputRef}
            />
          </View>

          {/* Input natural (voz → texto) */}
          <View style={[styles.inputCard, { backgroundColor: colors.surface }]}>
            <View style={styles.inputHeader}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Descripción por voz</Text>
              <Feather name="mic" size={16} color={colors.textTertiary} />
            </View>
            <TextInput
              style={[styles.mainInput, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
              placeholder='"Café $4.50" o "Comida 500"'
              placeholderTextColor={colors.textTertiary}
              value={input}
              onChangeText={handleInputChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {parsed && (
              <View style={[styles.preview, { backgroundColor: colors.green + '15' }]}>
                <Feather name="check-circle" size={16} color={colors.green} style={{ marginRight: 6 }} />
                <Text style={[styles.previewText, { color: colors.green }]}>{formatTransactionPreview(parsed)}</Text>
              </View>
            )}
          </View>

          {/* Quick amounts con iconos */}
          <View style={styles.quickSection}>
            <Text style={[styles.quickLabel, { color: colors.textSecondary }]}>快速 rápido</Text>
            <View style={styles.quickRow}>
              {quickItems.map((item, i) => (
                <Pressable
                  key={i}
                  style={[styles.quickChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleQuickAmount(item)}
                >
                  <View style={[styles.quickIcon, { backgroundColor: tipo === TIPO_INGRESO ? colors.green + '20' : colors.red + '20' }]}>
                    <Feather name={item.icon} size={16} color={tipo === TIPO_INGRESO ? colors.green : colors.red} />
                  </View>
                  <Text style={[styles.quickText, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.quickMonto, { color: colors.textSecondary }]}>${item.monto}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Categorías con iconos */}
          <Text style={[styles.catLabel, { color: colors.textSecondary }]}>Categoría</Text>
          <View style={styles.categoriesWrap}>
            {categories.map(cat => {
              const iconName = CATEGORY_ICONS_MAP[cat] || 'circle';
              const isActive = categoria === cat;
              return (
                <Pressable
                  key={cat}
                  style={[styles.catChip, { backgroundColor: colors.surface, borderColor: colors.border }, isActive && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={() => { setCategoria(cat); Vibration.vibrate(20); }}
                >
                  <Feather name={iconName} size={14} color={isActive ? '#000' : colors.textSecondary} />
                  <Text style={[styles.catText, { color: isActive ? '#000' : colors.textSecondary }]}>{cat}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Descripción opcional */}
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Descripción adicional (opcional)"
            placeholderTextColor={colors.textTertiary}
            value={descripcion}
            onChangeText={setDescripcion}
          />
        </ScrollView>

        {/* Submit */}
        <View style={[styles.submitWrap, { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 10 : 30, backgroundColor: colors.bg }]}>
          <Pressable
            style={[styles.submitBtn, { backgroundColor: colors.primary }, (!monto || !categoria || loading) && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={!monto || !categoria || loading}
          >
            <Feather name="check" size={20} color="#000" />
            <Text style={styles.submitBtnText}>{loading ? 'Guardando...' : '✅ Confirmar'}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  toggleText: { fontWeight: '700', fontSize: 15 },

  montoCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, gap: 8 },
  montoSymbol: { fontSize: 40, fontWeight: '800' },
  montoInput: { flex: 1, fontSize: 40, fontWeight: '800', padding: 0 },

  inputCard: { borderRadius: 16, padding: 14, gap: 8 },
  inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  mainInput: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 17, borderWidth: 1 },
  preview: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 10, marginTop: 4 },
  previewText: { fontSize: 14, fontWeight: '600' },

  quickSection: { gap: 8 },
  quickLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickChip: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1 },
  quickIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  quickText: { fontSize: 11, fontWeight: '600' },
  quickMonto: { fontSize: 10 },

  catLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  categoriesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  catText: { fontSize: 12, fontWeight: '600' },

  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15 },

  submitWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14 },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },

  confirmScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  confirmCard: { borderRadius: 24, padding: 32, alignItems: 'center', gap: 12 },
  confirmIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  confirmTitle: { fontSize: 28, fontWeight: '800' },
  confirmAmount: { fontSize: 36, fontWeight: '800' },
  confirmCat: { fontSize: 16 },
});
// =============================================================================
// NOTA: expo-speech ya instalado (~14.0.8) para TTS
// expo-av ya instalado (^16.0.8) para Audio Recording (futuro)
// AI Chat Voice: botón MIC funcional (requiere API key para speech-to-text)
// =============================================================================
