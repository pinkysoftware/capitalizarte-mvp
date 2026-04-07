import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { C, S, R, CATEGORY_EMOJI } from '../theme';

const tipos = ['GASTO', 'INGRESO'];
const naturalezas = ['FIJO', 'VARIABLE'];
const expenseCategories = ['Alimentacion', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Deuda', 'Inversion', 'Otro'];
const incomeCategories = ['Salario', 'Ventas', 'Freelance', 'Comision', 'Interes', 'Otro'];

export default function AddTransactionScreen({ navigation, route }) {
  const rawTipo = route?.params?.tipo;
  const tipoInicial = (rawTipo && String(rawTipo).length > 0) ? String(rawTipo) : 'GASTO';
  const [tipo, setTipo] = useState(tipoInicial);
  const [naturaleza, setNaturaleza] = useState('VARIABLE');
  const [categoria, setCategoria] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = tipo === 'INGRESO' ? incomeCategories : expenseCategories;

  const handleSubmit = async () => {
    if (!monto || parseFloat(monto) <= 0) return Alert.alert('Monto inválido', 'Ingresá un monto mayor a 0');
    if (!categoria) return Alert.alert('Categoría requerida', 'Elegí una categoría');

    setLoading(true);
    try {
      await require('../services/api').api.addTx({
        tipo,
        naturaleza,
        categoria,
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

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Tipo */}
        <View style={styles.toggleRow}>
          {tipos.map(t => (
            <Pressable
              key={t}
              style={[styles.toggleBtn, tipo === t && (t === 'INGRESO' ? styles.toggleGreen : styles.toggleRed)]}
              onPress={() => { setTipo(t); setCategoria(''); }}
            >
              <Text style={[styles.toggleText, tipo === t && styles.toggleTextActive]}>
                {t === 'INGRESO' ? '💰 Ingreso' : '💸 Gasto'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Monto */}
        <View style={styles.montoWrap}>
          <Text style={styles.montoSymbol}>$</Text>
          <TextInput
            style={styles.montoInput}
            placeholder="0.00"
            placeholderTextColor={C.textTertiary}
            value={monto}
            onChangeText={setMonto}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        {/* Descripción */}
        <TextInput
          style={styles.input}
          placeholder="Descripción (opcional)"
          placeholderTextColor={C.textTertiary}
          value={descripcion}
          onChangeText={setDescripcion}
        />

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

        {/* Naturaleza */}
        <View style={styles.natRow}>
          {naturalezas.map(n => (
            <Pressable
              key={n}
              style={[styles.natBtn, naturaleza === n && styles.natBtnActive]}
              onPress={() => setNaturaleza(n)}
            >
              <Text style={[styles.natText, naturaleza === n && styles.natTextActive]}>{n}</Text>
            </Pressable>
          ))}
        </View>

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
  
  toggleRow: { flexDirection: 'row', gap: S.sm },
  toggleBtn: { flex: 1, paddingVertical: 14, borderRadius: R.md, alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  toggleGreen: { backgroundColor: C.green, borderColor: C.green },
  toggleRed: { backgroundColor: C.red, borderColor: C.red },
  toggleText: { fontWeight: '700', fontSize: 15, color: C.textSecondary },
  toggleTextActive: { color: '#fff' },
  
  montoWrap: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  montoSymbol: { fontSize: 36, fontWeight: '800', color: C.text },
  montoInput: { flex: 1, fontSize: 36, fontWeight: '800', color: C.text, padding: 0 },
  
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: 16,
    color: C.text,
    fontSize: 16,
  },
  
  categoriesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: S.md,
    paddingVertical: 10,
    borderRadius: R.full,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  catChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  catEmoji: { fontSize: 16 },
  catText: { fontSize: 14, fontWeight: '600', color: C.textSecondary },
  catTextActive: { color: '#000' },
  
  natRow: { flexDirection: 'row', gap: S.sm },
  natBtn: { flex: 1, paddingVertical: 12, borderRadius: R.md, alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  natBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  natText: { fontWeight: '700', fontSize: 14, color: C.textSecondary },
  natTextActive: { color: '#000' },
  
  submitBtn: { backgroundColor: C.primary, borderRadius: R.md, paddingVertical: 16, alignItems: 'center', marginTop: S.sm },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
});
