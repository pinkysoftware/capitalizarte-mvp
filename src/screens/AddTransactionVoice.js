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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../services/api';
import { parseNaturalTransaction, formatTransactionPreview } from '../services/naturalLanguageParser';

const COLORS = {
  background: '#0D0F14',
  surface: '#141820',
  surfaceSoft: '#1A1F2B',
  primary: '#D4A017',
  primaryBright: '#F0C040',
  text: '#E8E8E8',
  textMuted: '#9A9FAA',
  border: 'rgba(212, 160, 23, 0.22)',
  green: '#2ECC40',
  red: '#E53935',
};

const tipos = ['INGRESO', 'GASTO'];
const naturalezas = ['FIJO', 'VARIABLE'];
const incomeCategories = ['Salario', 'Ventas', 'Freelance', 'Comision', 'Interes', 'Otro'];
const expenseCategories = ['Vivienda', 'Alimentacion', 'Transporte', 'Salud', 'Entretenimiento', 'Deuda', 'Inversion', 'Otro'];

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

  // Procesar texto cada vez que cambia
  const handleInputChange = (text) => {
    setInput(text);
    const result = parseNaturalTransaction(text);
    if (result) {
      setParsed(result);
      setTipo(result.tipo);
      setCategoria(result.categoria);
      setMonto(result.monto.toString());
      setDescripcion(result.descripcion);
    }
  };

  const handleSubmit = async () => {
    const finalMonto = parseFloat(monto);
    if (!finalMonto || finalMonto <= 0) {
      return Alert.alert('Monto inválido', 'Ingresá un monto mayor a 0');
    }
    if (!categoria) {
      return Alert.alert('Categoría requerida', 'Elegí una categoría');
    }

    setLoading(true);
    try {
      await api.addTx({
        tipo,
        naturaleza,
        categoria,
        monto: finalMonto,
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
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* INPUT NATURAL */}
        <View style={styles.voiceCard}>
          <Text style={styles.voiceTitle}>✍️ Escribí o usá el micrófono del teclado</Text>
          <Text style={styles.voiceSubtitle}>
            📱 Tocá el campo de abajo y usá el botón del micrófono en tu teclado Android{'\n'}
            Ejemplo: "cafe $4.50" o "comida 500"
          </Text>
          <TextInput
            style={styles.voiceInput}
            placeholder="cafe $4.50, comida 500, taxi 200..."
            placeholderTextColor={COLORS.textMuted}
            value={input}
            onChangeText={handleInputChange}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {parsed && (
            <View style={styles.parsedPreview}>
              <Text style={styles.parsedTitle}>✓ Detectado automáticamente:</Text>
              <Text style={styles.parsedText}>{formatTransactionPreview(parsed)}</Text>
              <Text style={styles.parsedHint}>Editá los campos abajo si querés cambiar algo</Text>
            </View>
          )}
        </View>

        {/* TIPO */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tipo</Text>
          <View style={styles.toggleRow}>
            {tipos.map(t => (
              <Pressable
                key={t}
                style={[styles.toggleBtn, tipo === t && (t === 'INGRESO' ? styles.toggleIngreso : styles.toggleGasto)]}
                onPress={() => { setTipo(t); setCategoria(''); }}
              >
                <Text style={[styles.toggleBtnText, tipo === t && styles.toggleBtnTextActive]}>
                  {t === 'INGRESO' ? '💰 Ingreso' : '💸 Gasto'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* NATURALEZA */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Naturaleza</Text>
          <View style={styles.toggleRow}>
            {naturalezas.map(n => (
              <Pressable
                key={n}
                style={[styles.toggleBtn, naturaleza === n && styles.toggleActive]}
                onPress={() => setNaturaleza(n)}
              >
                <Text style={[styles.toggleBtnText, naturaleza === n && styles.toggleBtnTextActive]}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* CATEGORÍA */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Categoría</Text>
          <View style={styles.categoryGrid}>
            {categories.map(cat => (
              <Pressable
                key={cat}
                style={[styles.categoryChip, categoria === cat && styles.categoryChipActive]}
                onPress={() => setCategoria(cat)}
              >
                <Text style={[styles.categoryChipText, categoria === cat && styles.categoryChipTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* MONTO */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Monto</Text>
          <View style={styles.montoRow}>
            <Text style={styles.montoSymbol}>$</Text>
            <TextInput
              style={styles.montoInput}
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
              value={monto}
              onChangeText={setMonto}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* DESCRIPCIÓN */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Descripción (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Café en Starbucks"
            placeholderTextColor={COLORS.textMuted}
            value={descripcion}
            onChangeText={setDescripcion}
          />
        </View>

        {/* CONFIRMAR */}
        <Pressable
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#111" /> : <Text style={styles.submitBtnText}>Confirmar</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18, paddingBottom: 48, gap: 14 },
  voiceCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  voiceTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  voiceSubtitle: { color: COLORS.textMuted, fontSize: 13, lineHeight: 19 },
  voiceInput: { backgroundColor: COLORS.surfaceSoft, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, color: COLORS.text, fontSize: 17, borderWidth: 1, borderColor: COLORS.border },
  parsedPreview: { backgroundColor: 'rgba(46, 204, 64, 0.12)', borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: COLORS.green },
  parsedTitle: { color: COLORS.green, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  parsedText: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  parsedHint: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  sectionCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  sectionTitle: { color: COLORS.primary, fontSize: 14, fontWeight: '800' },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.surfaceSoft, borderWidth: 1, borderColor: COLORS.border },
  toggleBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 14 },
  toggleBtnTextActive: { color: '#111' },
  toggleActive: { backgroundColor: COLORS.primary },
  toggleIngreso: { backgroundColor: COLORS.green },
  toggleGasto: { backgroundColor: COLORS.red },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: COLORS.surfaceSoft, borderWidth: 1, borderColor: COLORS.border },
  categoryChipText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  categoryChipTextActive: { color: '#111' },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  montoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  montoSymbol: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  montoInput: { flex: 1, backgroundColor: COLORS.surfaceSoft, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.text, fontSize: 20, fontWeight: '700', borderWidth: 1, borderColor: COLORS.border },
  input: { backgroundColor: COLORS.surfaceSoft, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.text, fontSize: 15, borderWidth: 1, borderColor: COLORS.border },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  submitBtnText: { color: '#111', fontSize: 16, fontWeight: '800' },
});
