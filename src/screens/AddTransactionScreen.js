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
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';

const tipos = ['GASTO', 'INGRESO'];
const naturalezas = ['FIJO', 'VARIABLE'];

// Mapeo de categorías a iconos
const CATEGORY_ICONS = {
  'Alimentacion': 'shopping-cart',
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

const expenseCategories = ['Alimentacion', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Deuda', 'Inversion', 'Otro'];
const incomeCategories = ['Salario', 'Ventas', 'Freelance', 'Comision', 'Interes', 'Otro'];

export default function AddTransactionScreen({ navigation, route }) {
  const { colors } = useTheme();
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
      await api.addTx({
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === 'ios' ? 300 : 150 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ height: Platform.OS === 'ios' ? 60 : 20 }} />

          {/* Tipo toggle */}
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleBtn, tipo === 'GASTO' && { backgroundColor: '#EF4444', borderColor: '#EF4444' }]}
              onPress={() => { setTipo('GASTO'); setCategoria(''); }}
            >
              <Feather name="minus-circle" size={18} color={tipo === 'GASTO' ? '#FFF' : colors.textSecondary} />
              <Text style={[styles.toggleText, { color: tipo === 'GASTO' ? '#FFF' : colors.textSecondary }]}>
                Gasto
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, tipo === 'INGRESO' && { backgroundColor: '#22C55E', borderColor: '#22C55E' }]}
              onPress={() => { setTipo('INGRESO'); setCategoria(''); }}
            >
              <Feather name="plus-circle" size={18} color={tipo === 'INGRESO' ? '#FFF' : colors.textSecondary} />
              <Text style={[styles.toggleText, { color: tipo === 'INGRESO' ? '#FFF' : colors.textSecondary }]}>
                Ingreso
              </Text>
            </Pressable>
          </View>

          {/* Monto */}
          <View style={styles.montoWrap}>
            <Text style={[styles.montoSymbol, { color: colors.text }]}>$</Text>
            <TextInput
              style={[styles.montoInput, { color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              value={monto}
              onChangeText={setMonto}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>

          {/* Descripción */}
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Descripción (opcional)"
            placeholderTextColor={colors.textTertiary}
            value={descripcion}
            onChangeText={setDescripcion}
          />

          {/* Categorías con iconos vectoriales */}
          <View style={styles.categoriesWrap}>
            {categories.map(cat => {
              const iconName = CATEGORY_ICONS[cat] || 'circle';
              const isActive = categoria === cat;
              return (
                <Pressable
                  key={cat}
                  style={[
                    styles.catChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isActive && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setCategoria(cat)}
                >
                  <Feather name={iconName} size={16} color={isActive ? '#000' : colors.textSecondary} />
                  <Text style={[styles.catText, { color: isActive ? '#000' : colors.textSecondary }]}>{cat}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Naturaleza */}
          <View style={styles.natRow}>
            {naturalezas.map(n => (
              <Pressable
                key={n}
                style={[
                  styles.natBtn,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  naturaleza === n && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setNaturaleza(n)}
              >
                <Text style={[styles.natText, { color: naturaleza === n ? '#000' : colors.textSecondary }]}>
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Submit */}
          <Pressable
            style={[
              styles.submitBtn,
              { backgroundColor: colors.primary },
              (!monto || !categoria || loading) && { opacity: 0.4 }
            ]}
            onPress={handleSubmit}
            disabled={!monto || !categoria || loading}
          >
            <Feather name="check" size={20} color="#000" />
            <Text style={styles.submitBtnText}>Confirmar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },

  // Toggle
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  toggleText: { fontWeight: '700', fontSize: 15 },

  // Monto
  montoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  montoSymbol: { fontSize: 32, fontWeight: '800' },
  montoInput: { flex: 1, fontSize: 32, fontWeight: '800', padding: 0 },

  // Input
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },

  // Categorías
  categoriesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  catText: { fontSize: 12, fontWeight: '600' },

  // Naturaleza
  natRow: { flexDirection: 'row', gap: 10 },
  natBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  natText: { fontWeight: '700', fontSize: 13 },

  // Submit
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 14 },
  submitBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
});

// ============================================================================
// COLORES EXACTOS - WHITEPAPER COMPLIANT
// Verde: #22C55E | Rojo: #EF4444 | Azul: #3B82F6 | Amarillo: #FBBF24 | Morado: #8B5CF6
// ============================================================================
