import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { C, S, R, SHADOW, CATEGORY_EMOJI } from '../theme';

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

  useFocusEffect(React.useCallback(() => {
    load();
  }, []));

  const load = async () => {
    setLoading(true);
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const res = await require('../services/api').api.listTx(200);
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
      console.log('Error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = Object.keys(budgets).reduce((s, cat) => s + (spending[cat] || 0), 0);
  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);
  const overallPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={C.primary} size="large" /></View>;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      
      {/* Overview */}
      <View style={styles.overview}>
        <Text style={styles.overviewLabel}>Total gastado</Text>
        <Text style={styles.overviewAmount}>${totalSpent.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${overallPct}%`, backgroundColor: overallPct > 90 ? C.red : C.primary }]} />
        </View>
        <Text style={styles.overviewHint}>de ${totalBudget.toLocaleString('es-AR', { minimumFractionDigits: 0 })} presupuesto</Text>
      </View>

      {/* Bars */}
      <Text style={styles.sectionTitle}>Por categoría</Text>
      {Object.keys(budgets).map(cat => (
        <BudgetBar key={cat} categoria={cat} gastado={spending[cat] || 0} limite={budgets[cat]} />
      ))}

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
  track: { height: 6, backgroundColor: C.border, borderRadius: 3 },
  fill: { height: '100%', borderRadius: 3 },
  
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
