import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { api } from '../services/api';
import { getUserProfile } from '../services/userStorage';
import { useTheme } from '../contexts/ThemeContext';

function ReportCard({ title, value, subtitle, icon, color, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable style={[styles.reportCard, { backgroundColor: colors.surface }]} onPress={onPress}>
      <View style={[styles.reportIcon, { backgroundColor: color + '20' }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <View style={styles.reportInfo}>
        <Text style={[styles.reportTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.reportValue, { color }]}>{value}</Text>
        {subtitle && <Text style={[styles.reportSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      <Feather name="chevron-right" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

function CashFlowCard({ ingresos, gastos }) {
  const { colors } = useTheme();
  const saldo = ingresos - gastos;
  const pctIngresos = ingresos > 0 ? (ingresos / (ingresos + gastos || 1)) * 100 : 50;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>Flujo de caja del mes</Text>
      <View style={styles.cashFlowBars}>
        <View style={[styles.cashFlowBarBg, { backgroundColor: colors.green + '20' }]}>
          <View style={[styles.cashFlowBarFill, { width: `${pctIngresos}%`, backgroundColor: colors.green }]} />
        </View>
        <View style={[styles.cashFlowBarBg, { backgroundColor: colors.red + '20' }]}>
          <View style={[styles.cashFlowBarFill, { width: `${100 - pctIngresos}%`, backgroundColor: colors.red }]} />
        </View>
      </View>
      <View style={styles.cashFlowLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.green }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Ingresos</Text>
          <Text style={[styles.legendValue, { color: colors.green }]}>${Number(ingresos).toLocaleString('es-AR')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.red }]} />
          <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Gastos</Text>
          <Text style={[styles.legendValue, { color: colors.red }]}>${Number(gastos).toLocaleString('es-AR')}</Text>
        </View>
      </View>
      <View style={[styles.saldoRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.saldoLabel, { color: colors.textSecondary }]}>Balance</Text>
        <Text style={[styles.saldoValue, { color: saldo >= 0 ? colors.green : colors.red }]}>
          {saldo >= 0 ? '+' : '-'}${Math.abs(saldo).toLocaleString('es-AR')}
        </Text>
      </View>
    </View>
  );
}

function CategoryBreakdownCard({ data }) {
  const { colors } = useTheme();
  const categories = data || [];
  const total = categories.reduce((sum, c) => sum + Number(c.monto || 0), 0);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>Gastos por categoría</Text>
      {categories.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sin datos</Text>
      ) : (
        categories.slice(0, 6).map((cat, i) => {
          const monto = Number(cat.monto || 0);
          const pct = total > 0 ? (monto / total) * 100 : 0;
          return (
            <View key={i} style={[styles.categoryRow, i < categories.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryDot, { backgroundColor: colors.red + '40' }]} />
                <Text style={[styles.categoryName, { color: colors.text }]}>{cat.categoria}</Text>
              </View>
              <View style={styles.categoryRight}>
                <Text style={[styles.categoryPct, { color: colors.textSecondary }]}>{pct.toFixed(1)}%</Text>
                <Text style={[styles.categoryMonto, { color: colors.red }]}>-${monto.toLocaleString('es-AR')}</Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

function TrendsCard({ dashboard }) {
  const { colors } = useTheme();
  const tendencia = useMemo(() => {
    const gastos = Number(dashboard?.gastos || 0);
    const ingresos = Number(dashboard?.ingresos || 0);
    if (gastos === 0) return { text: 'Sin datos aún', color: colors.textSecondary };
    const ratio = ingresos / gastos;
    if (ratio > 1.5) return { text: 'Excelente - Gastás menos de lo que ganás', color: colors.green };
    if (ratio > 1) return { text: 'Bueno - Estás ahorrando', color: colors.green };
    if (ratio > 0.5) return { text: 'Cuidado - Gastás más del 50% de ingresos', color: colors.yellow };
    return { text: 'Crítico - Gastás más de lo que ganás', color: colors.red };
  }, [dashboard]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>Tendencia</Text>
      <View style={[styles.trendBadge, { backgroundColor: tendencia.color + '20' }]}>
        <Feather name="trending-up" size={16} color={tendencia.color} />
        <Text style={[styles.trendText, { color: tendencia.color }]}>{tendencia.text}</Text>
      </View>
      <View style={styles.trendDetails}>
        <View style={styles.trendItem}>
          <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>Relación ingreso/gasto</Text>
          <Text style={[styles.trendValue, { color: colors.text }]}>
            {dashboard?.gastos > 0 ? ((dashboard?.ingresos || 0) / dashboard?.gastos).toFixed(2) : '—'}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ProjectionCard({ dashboard, profile }) {
  const { colors } = useTheme();
  const projection = useMemo(() => {
    const saldo = Number(dashboard?.saldo || 0);
    const gastosFijos = Number(dashboard?.gastos_fijos || 0);
    if (gastosFijos === 0) return null;
    const costoDiario = gastosFijos / 30;
    const diasRestantes = costoDiario > 0 ? saldo / costoDiario : 0;
    return {
      dias: diasRestantes,
      texto: diasRestantes > 15 ? 'Tu balance te alcanza para más de 15 días' : `Conclusión en ${diasRestantes.toFixed(0)} días`,
    };
  }, [dashboard]);

  if (!projection) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>Proyección</Text>
      <Text style={[styles.projectionMain, { color: projection.dias > 0 ? colors.green : colors.red }]}>
        {projection.dias > 0 ? `+${projection.dias.toFixed(0)} días` : `${Math.abs(projection.dias).toFixed(0)} días`}
      </Text>
      <Text style={[styles.projectionSub, { color: colors.textSecondary }]}>{projection.texto}</Text>
    </View>
  );
}

export default function ReportsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [dashRes, localProfile] = await Promise.all([
          api.getDashboard().catch(() => null),
          getUserProfile()
        ]);
        setDashboard(dashRes);
        setProfile(localProfile);
      } catch (e) {
        console.log('Error loading reports:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
          <View style={{ height: 20, width: 140, backgroundColor: colors.surfaceHover, borderRadius: 8 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.screenHeader}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Reportes</Text>
          <Text style={[styles.screenSub, { color: colors.textSecondary }]}>Tu análisis financiero</Text>
        </View>

        {/* Cash Flow */}
        <CashFlowCard
          ingresos={dashboard?.ingresos || 0}
          gastos={dashboard?.gastos || 0}
        />

        {/* Trends */}
        <TrendsCard dashboard={dashboard} />

        {/* Projection */}
        <ProjectionCard dashboard={dashboard} profile={profile} />

        {/* Category Breakdown */}
        <CategoryBreakdownCard data={[]} />

        {/* Quick Reports */}
        <View style={styles.quickReports}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Reportes rápidos</Text>
          <View style={styles.quickReportsGrid}>
            <ReportCard title="Balance" value={dashboard?.saldo >= 0 ? `+$${Number(dashboard?.saldo || 0).toLocaleString('es-AR')}` : `-$${Math.abs(dashboard?.saldo || 0).toLocaleString('es-AR')}`} icon="activity" color={colors.green} onPress={() => navigation.navigate('Life')} />
            <ReportCard title="Salud" value={`${dashboard?.salud_financiera || 0}%`} icon="heart" color={colors.red} onPress={() => navigation.navigate('Life')} />
            <ReportCard title="Gastos Fijos" value={`$${Number(dashboard?.gastos_fijos || 0).toLocaleString('es-AR')}`} icon="home" color={colors.blue} onPress={() => navigation.navigate('Life')} />
            <ReportCard title="Transacciones" value={`${dashboard?.ultimas_transacciones?.length || 0}`} icon="list" color={colors.purple} onPress={() => navigation.navigate('History')} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },
  screenHeader: { marginBottom: 8 },
  screenTitle: { fontSize: 28, fontWeight: '800' },
  screenSub: { fontSize: 13, marginTop: 2 },

  card: { borderRadius: 16, padding: 16, gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700' },

  // Cash Flow
  cashFlowBars: { gap: 6 },
  cashFlowBarBg: { height: 12, borderRadius: 6, overflow: 'hidden' },
  cashFlowBarFill: { height: '100%', borderRadius: 6 },
  cashFlowLegend: { flexDirection: 'row', justifyContent: 'space-between' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11 },
  legendValue: { fontSize: 12, fontWeight: '700' },
  saldoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, marginTop: 4 },
  saldoLabel: { fontSize: 13, fontWeight: '600' },
  saldoValue: { fontSize: 18, fontWeight: '800' },

  // Category
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  categoryLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryDot: { width: 10, height: 10, borderRadius: 5 },
  categoryName: { fontSize: 13, fontWeight: '500' },
  categoryRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryPct: { fontSize: 11, width: 40, textAlign: 'right' },
  categoryMonto: { fontSize: 13, fontWeight: '700', width: 80, textAlign: 'right' },

  // Trends
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10 },
  trendText: { fontSize: 13, fontWeight: '600', flex: 1 },
  trendDetails: { gap: 6 },
  trendItem: { flexDirection: 'row', justifyContent: 'space-between' },
  trendLabel: { fontSize: 12 },
  trendValue: { fontSize: 13, fontWeight: '700' },

  // Projection
  projectionMain: { fontSize: 36, fontWeight: '800' },
  projectionSub: { fontSize: 13 },

  // Quick Reports
  quickReports: { gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  quickReportsGrid: { gap: 10 },
  reportCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, gap: 12 },
  reportIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  reportInfo: { flex: 1 },
  reportTitle: { fontSize: 13, fontWeight: '600' },
  reportValue: { fontSize: 17, fontWeight: '700' },
  reportSubtitle: { fontSize: 11, marginTop: 2 },
  emptyText: { fontSize: 13, textAlign: 'center', padding: 20 },
});
