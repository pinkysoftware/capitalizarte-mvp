import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, S, R, SHADOW, CATEGORY_EMOJI } from '../theme';
import { api } from '../services/api';

const CATEGORIES = ['Alimentacion', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Deuda', 'Inversion', 'Otro'];

function BudgetBar({ categoria, gastado, limite }) {
  const pct = limite > 0 ? Math.min((gastado / limite) * 100, 100) : 0;
  const over = gastado > limite;
  const emoji = CATEGORY_EMOJI[categoria] || '📦';
  
  return (
    <View style={styles.barItem}>
      <View style={styles.barHeader}>
        <View style={styles.barLeft}>
          <Text style={styles.barEmoji}>{emoji}</Text>
          <Text style={styles.barCat}>{categoria}</Text>
        </View>
        <Text style={[styles.barAmount, over && { color: C.red }]}>
          ${gastado.toFixed(0)} <Text style={styles.barLimit}>/ ${limite.toFixed(0)}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: over ? C.red : C.green }]} />
      </View>
    </View>
  );
}

export default function BudgetScreen({ navigation }) {
  const [budgets, setBudgets] = useState({});
  const [spending, setSpending] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useFocusEffect(React.useCallback(() => {
    load();
  }, []));

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

      const spendMap = {};
      thisMonth.forEach(t => {
        const cat = t.categoria || 'Otro';
        spendMap[cat] = (spendMap[cat] || 0) + Number(t.monto);
      });
      setSpending(spendMap);

      const stored = await AsyncStorage.getItem('capitalizarte.budgets');
      if (stored) {
        setBudgets(JSON.parse(stored));
      } else {
        setBudgets({ Alimentacion: 50000, Transporte: 20000, Entretenimiento: 15000 });
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los presupuestos.');
    } finally {
      setLoading(false);
    }
  };

  // Filter budgets based on selected tab
  const filteredBudgets = Object.keys(budgets).filter(cat => {
    if (filter === 'all') return true;
    // For simplicity, filter based on category default nature
    // Alimentacion, Transporte, Entretenimiento = VARIABLE
    // Vivienda, Salud = FIJO
    if (filter === 'FIJO') return ['Vivienda', 'Salud', 'Deuda'].includes(cat);
    if (filter === 'VARIABLE') return ['Alimentacion', 'Transporte', 'Entretenimiento', 'Inversion', 'Otro'].includes(cat);
    return true;
  });

  // Calculate total spent for filtered view
  const filteredSpent = filteredBudgets.reduce((s, cat) => s + (spending[cat] || 0), 0);
  const filteredBudget = filteredBudgets.reduce((s, cat) => s + (budgets[cat] || 0), 0);
  const overallPct = filteredBudget > 0 ? Math.min((filteredSpent / filteredBudget) * 100, 100) : 0;

  const totalSpent = filteredSpent;
  const totalBudget = filteredBudget;

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={C.primary} size="large" /></View>;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      
      {/* Overview */}
      <View style={styles.overview}>
        <Text style={styles.overviewLabel}>Total gastado</Text>
        <Text style={[styles.overviewAmount, totalSpent > totalBudget && { color: C.red }]}>
          ${totalSpent.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${overallPct}%`, backgroundColor: overallPct > 90 ? C.red : C.primary }]} />
        </View>
        <Text style={styles.overviewHint}>de ${totalBudget.toLocaleString('es-AR', { minimumFractionDigits: 0 })} presupuesto</Text>
        {overallPct > 100 && <Text style={[styles.overviewAlert, { color: C.red }]}>⚠️ Excediste tu presupuesto en ${(totalSpent - totalBudget).toLocaleString('es-AR')}</Text>}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        <Pressable style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]} onPress={() => setFilter('all')}>
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todos</Text>
        </Pressable>
        <Pressable style={[styles.filterBtn, filter === 'FIJO' && styles.filterBtnActive]} onPress={() => setFilter('FIJO')}>
          <Text style={[styles.filterText, filter === 'FIJO' && styles.filterTextActive]}>Fijos</Text>
        </Pressable>
        <Pressable style={[styles.filterBtn, filter === 'VARIABLE' && styles.filterBtnActive]} onPress={() => setFilter('VARIABLE')}>
          <Text style={[styles.filterText, filter === 'VARIABLE' && styles.filterTextActive]}>Variables</Text>
        </Pressable>
      </View>

      {/* Bars */}
      <Text style={styles.sectionTitle}>Por categoría</Text>
      {filteredBudgets.map(cat => (
        <BudgetBar key={cat} categoria={cat} gastado={spending[cat] || 0} limite={budgets[cat]} />
      ))}

      {/* Unbudgeted spending - what you spent but didn't set a budget */}
      {Object.keys(spending).filter(cat => !budgets[cat] && spending[cat] > 0).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sin presupuesto</Text>
          {Object.keys(spending).filter(cat => !budgets[cat] && spending[cat] > 0).map(cat => (
            <BudgetBar key={cat} categoria={cat} gastado={spending[cat] || 0} limite={0} />
          ))}
        </View>
      )}

      {/* Sin presupuesto */}
      {CATEGORIES.filter(c => !budgets[c] && (spending[c] || 0) > 0).map(cat => (
        <BudgetBar key={cat} categoria={cat} gastado={spending[cat] || 0} limite={0} />
      ))}

      {Object.keys(budgets).length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No hay presupuestos configurados</Text>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { padding: S.lg, paddingBottom: 100, gap: S.lg },
  loading: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  
  overview: { backgroundColor: C.surface, borderRadius: R.lg, padding: S.lg, gap: S.sm },
  overviewLabel: { color: C.textSecondary, fontSize: 13 },
  overviewAmount: { fontSize: 32, fontWeight: '800', color: C.text },
  overviewHint: { color: C.textSecondary, fontSize: 13 },
  overviewAlert: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  track: { height: 6, backgroundColor: C.border, borderRadius: 3 },
  fill: { height: '100%', borderRadius: 3 },
  
  filterRow: { flexDirection: 'row', gap: S.sm },
  filterBtn: { flex: 1, paddingVertical: 10, borderRadius: R.md, backgroundColor: C.surface, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  filterBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterText: { fontSize: 14, fontWeight: '600', color: C.textSecondary },
  filterTextActive: { color: '#000' },
  
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  
  barItem: { backgroundColor: C.surface, borderRadius: R.md, padding: S.md, gap: S.sm },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barLeft: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  barEmoji: { fontSize: 18 },
  barCat: { fontSize: 15, fontWeight: '600', color: C.text },
  barAmount: { fontSize: 14, fontWeight: '700', color: C.text },
  barLimit: { color: C.textSecondary, fontWeight: '400' },
  
  empty: { alignItems: 'center', paddingVertical: S.xl },
  emptyText: { color: C.textSecondary },
});
