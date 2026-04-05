import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';

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

const CATEGORIES = ['Alimentacion', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Deuda', 'Inversion', 'Otro'];
const CATEGORY_ICONS = {
  Alimentacion: '🍔', Transporte: '🚗', Vivienda: '🏠',
  Salud: '💊', Entretenimiento: '🎬', Deuda: '💳',
  Inversion: '📈', Otro: '📦',
};

function BudgetBar({ categoria, gastado, limite, color }) {
  const pct = limite > 0 ? Math.min((gastado / limite) * 100, 100) : 0;
  const over = gastado > limite;
  return (
    <View style={styles.budgetItem}>
      <View style={styles.budgetHeader}>
        <View style={styles.budgetLabelRow}>
          <Text style={styles.budgetIcon}>{CATEGORY_ICONS[categoria] || '📦'}</Text>
          <Text style={styles.budgetLabel}>{categoria}</Text>
        </View>
        <Text style={[styles.budgetAmount, over && { color: COLORS.red }]}>
          ${gastado.toFixed(2)} <Text style={styles.budgetLimit}>/ ${limite.toFixed(2)}</Text>
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: over ? COLORS.red : color || COLORS.primary }]} />
      </View>
      <Text style={[styles.budgetPct, over && { color: COLORS.red }]}>
        {pct.toFixed(0)}% usado {over ? '⚠️' : ''}
      </Text>
    </View>
  );
}

function AddBudgetModal({ visible, onClose, onSave }) {
  const [cat, setCat] = useState('');
  const [limite, setLimite] = useState('');
  if (!visible) return null;
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>Agregar presupuesto</Text>
        <Text style={styles.modalSubtitle}>Categoría</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.filter(c => !Object.keys(onSave.budgets || {}).includes(c)).map(c => (
            <Pressable key={c} style={[styles.catChip, cat === c && styles.catChipActive]} onPress={() => setCat(c)}>
              <Text style={[styles.catChipText, cat === c && styles.catChipTextActive]}>{CATEGORY_ICONS[c]} {c}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={styles.modalSubtitle}>Límite mensual ($)</Text>
        <TextInput style={styles.modalInput} placeholder="Ej: 50000" placeholderTextColor={COLORS.textMuted} value={limite} onChangeText={setLimite} keyboardType="decimal-pad" />
        <View style={styles.modalBtns}>
          <Pressable style={styles.modalCancel} onPress={onClose}><Text style={styles.modalCancelText}>Cancelar</Text></Pressable>
          <Pressable style={[styles.modalSave, (!cat || !limite) && { opacity: 0.5 }]} onPress={() => { if (cat && limite) { onSave({ categoria: cat, limite: parseFloat(limite) }); setCat(''); setLimite(''); } }}><Text style={styles.modalSaveText}>Guardar</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

export default function BudgetScreen({ navigation }) {
  const [budgets, setBudgets] = useState({});
  const [spending, setSpending] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.listTx(200);
      const txs = res.transactions || [];
      const now = new Date();
      const thisMonth = txs.filter(t => {
        const d = new Date(t.fecha);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.tipo === 'GASTO';
      });

      // Gasto por categoría
      const spendMap = {};
      thisMonth.forEach(t => {
        const cat = t.categoria || 'Otro';
        spendMap[cat] = (spendMap[cat] || 0) + Number(t.monto);
      });
      setSpending(spendMap);

      // Budgets desde storage
      const stored = await require('@react-native-async-storage/async-storage').default.getItem('capitalizarte.budgets');
      if (stored) {
        setBudgets(JSON.parse(stored));
      } else {
        // Defaults
        const defaults = { Alimentacion: 50000, Transporte: 20000, Entretenimiento: 15000 };
        setBudgets(defaults);
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => { load(); }, [])
  );

  const saveBudget = async ({ categoria, limite }) => {
    const updated = { ...budgets, [categoria]: limite };
    setBudgets(updated);
    await require('@react-native-async-storage/async-storage').default.setItem('capitalizarte.budgets', JSON.stringify(updated));
    setShowModal(false);
  };

  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);
  const totalSpent = Object.keys(budgets).reduce((s, cat) => s + (spending[cat] || 0), 0);
  const overallPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  if (loading) {
    return <View style={styles.loadingScreen}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* OVERVIEW */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewLabel}>Presupuesto total del mes</Text>
          <Text style={[styles.overviewAmount, totalSpent > totalBudget && { color: COLORS.red }]}>
            ${totalSpent.toFixed(2)} <Text style={styles.overviewLimit}>/ ${totalBudget.toFixed(2)}</Text>
          </Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${overallPct}%`, backgroundColor: overallPct > 90 ? COLORS.red : COLORS.primary }]} />
          </View>
          <Text style={styles.overviewHint}>{overallPct.toFixed(0)}% del presupuesto usado</Text>
        </View>

        {/* CATEGORY BARS */}
        <Text style={styles.sectionTitle}>Por categoría</Text>
        {Object.keys(budgets).length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No hay presupuestos设置. Agregá uno para empezar.</Text>
          </View>
        )}
        {Object.entries(budgets).map(([cat, limite]) => (
          <BudgetBar key={cat} categoria={cat} gastado={spending[cat] || 0} limite={limite} />
        ))}

        {/* RESTO DE CATEGORÍAS SIN PRESUPUESTO */}
        {CATEGORIES.filter(c => !budgets[c] && (spending[c] || 0) > 0).map(cat => (
          <BudgetBar key={cat} categoria={cat} gastado={spending[cat] || 0} limite={0} />
        ))}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 80, gap: 16 },
  loadingScreen: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  overviewCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  overviewLabel: { color: COLORS.textMuted, fontSize: 13 },
  overviewAmount: { color: COLORS.text, fontSize: 28, fontWeight: '800' },
  overviewLimit: { color: COLORS.textMuted, fontSize: 16, fontWeight: '400' },
  overviewHint: { color: COLORS.textMuted, fontSize: 12 },
  barTrack: { height: 8, backgroundColor: COLORS.surfaceSoft, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginTop: 4 },
  budgetItem: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  budgetIcon: { fontSize: 16 },
  budgetLabel: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  budgetAmount: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  budgetLimit: { color: COLORS.textMuted, fontWeight: '400' },
  budgetPct: { color: COLORS.textMuted, fontSize: 12 },
  emptyCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  emptyText: { color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: COLORS.primary, width: 52, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabText: { color: '#111', fontSize: 24, fontWeight: '800', marginTop: -2 },
  modalOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalCard: { backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, width: '85%', gap: 12, borderWidth: 1, borderColor: COLORS.border },
  modalTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  modalSubtitle: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  catScroll: { flexGrow: 0 },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: COLORS.surfaceSoft, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  catChipText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipTextActive: { color: '#111' },
  modalInput: { backgroundColor: COLORS.surfaceSoft, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.text, fontSize: 16, borderWidth: 1, borderColor: COLORS.border },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancel: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  modalCancelText: { color: COLORS.text, fontWeight: '700' },
  modalSave: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, backgroundColor: COLORS.primary },
  modalSaveText: { color: '#111', fontWeight: '800' },
});
