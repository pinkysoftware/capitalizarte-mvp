import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { api } from '../services/api';
import { getUserProfile } from '../services/userStorage';
import { useTheme } from '../contexts/ThemeContext';

const CATEGORY_ICONS_MAP = {
  'HOGAR': 'home',
  'TRANSPORTE': 'truck',
  'COMIDA': 'coffee',
  'SERVICIOS': 'zap',
  'SALUD': 'heart',
  'ENTRETENIMIENTO': 'film',
  'EDUCACIÓN': 'book-open',
  'DEUDA': 'credit-card',
  'OTRO': 'package',
};

// ============================================================================
// HEALTH HEART - Icono corazón con %
// ============================================================================
function HealthHeart({ pct }) {
  const { colors } = useTheme();
  const color = pct > 50 ? colors.green : pct > 20 ? colors.yellow : colors.red;
  return (
    <View style={styles.heartContainer}>
      <Feather name="heart" size={28} color={color} style={styles.heartIcon} />
      <Text style={[styles.heartPct, { color }]}>{pct.toFixed(0)}%</Text>
    </View>
  );
}

// ============================================================================
// STAT BOX - Costo por día / Gastos fijos
// ============================================================================
function StatBox({ icon, iconColor, label, value }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
      <View style={[styles.statIconBox, { backgroundColor: iconColor + '20' }]}>
        <Feather name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

// ============================================================================
// LIFE BAR - Barra de vida
// ============================================================================
function LifeBar({ label, value, max = 100, color }) {
  const { colors } = useTheme();
  const safeValue = Number(value || 0);
  const pct = Math.max(0, Math.min(100, max > 0 ? (safeValue / max) * 100 : 0));
  return (
    <View style={[styles.barCard, { backgroundColor: colors.surface }]}>
      <View style={styles.barTop}>
        <Text style={[styles.barLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.barValue, { color }]}>{safeValue.toFixed(1)}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// ============================================================================
// MONTH CHART - Gráfico de barras 30 días
// ============================================================================
function MonthChart({ days }) {
  const { colors } = useTheme();
  return (
    <View style={styles.chartContainer}>
      {days.map((d, i) => (
        <View key={i} style={styles.chartBarWrapper}>
          <View style={[styles.chartBarBg, { backgroundColor: colors.border }]}>
            <View style={[styles.barIncome, { height: `${(d.income / 80000) * 100}%`, backgroundColor: colors.green }]} />
            <View style={[styles.barExpense, { height: `${(d.expense / 80000) * 100}%`, backgroundColor: colors.red }]} />
          </View>
          <Text style={[styles.chartDay, { color: colors.textTertiary }]}>{d.day}</Text>
        </View>
      ))}
    </View>
  );
}

// ============================================================================
// RECOMMENDATION CARD - Recomendación inteligente
// ============================================================================
function RecommendationCard({ tipo, mensaje }) {
  const { colors } = useTheme();
  const iconColor = tipo === 'warning' ? colors.yellow : tipo === 'danger' ? colors.red : colors.green;
  return (
    <View style={[styles.recCard, { backgroundColor: iconColor + '15' }]}>
      <View style={styles.recHeader}>
        <Feather name="lightbulb" size={18} color={iconColor} />
        <Text style={[styles.recTitle, { color: colors.text }]}>Recomendación</Text>
      </View>
      <Text style={[styles.recText, { color: colors.textSecondary }]}>{mensaje}</Text>
    </View>
  );
}

// ============================================================================
// EXPENSE BREAKDOWN - Desglose gastos fijos
// ============================================================================
function ExpenseBreakdownRow({ category, amount, pct }) {
  const { colors } = useTheme();
  const iconName = CATEGORY_ICONS_MAP[category?.toUpperCase()] || 'circle';
  return (
    <View style={[styles.breakdownRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.breakdownIcon, { backgroundColor: colors.red + '15' }]}>
        <Feather name={iconName} size={14} color={colors.red} />
      </View>
      <Text style={[styles.breakdownCat, { color: colors.text }]}>{category}</Text>
      <Text style={[styles.breakdownAmount, { color: colors.text }]}>${Number(amount || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })}</Text>
      <Text style={[styles.breakdownPct, { color: colors.textSecondary }]}>{pct}%</Text>
    </View>
  );
}

// ============================================================================
// WALLET CARD - Card principal del balance
// ============================================================================
function WalletCard({ saldo, name, isCritical }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.walletCard, { backgroundColor: colors.surface }]}>
      <View style={styles.walletHeader}>
        <View style={styles.walletLeft}>
          <Text style={[styles.walletName, { color: colors.text }]}>{name}</Text>
          <View style={styles.diamondBadge}>
            <Text style={styles.diamond}>💎</Text>
            <Text style={[styles.diamondText, { color: colors.primary }]}>Usuario</Text>
          </View>
        </View>
        <View style={[styles.walletIcon, { opacity: 0.3 }]}>
          <Feather name="wallet" size={44} color={isCritical ? colors.red : colors.green} />
        </View>
      </View>

      <Text style={[
        styles.walletBalance,
        { color: saldo >= 0 ? colors.green : colors.red }
      ]}>
        {saldo >= 0 ? '+' : '-'}${Math.abs(saldo).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
      </Text>

      {/* Status Tag */}
      <View style={[styles.statusTag, { backgroundColor: isCritical ? colors.red + '20' : colors.green + '20' }]}>
        <Text style={[styles.statusText, { color: isCritical ? colors.red : colors.green }]}>
          {isCritical ? 'Crítico' : 'Estable'}
        </Text>
      </View>

      {/* Días de vida financiera */}
      <Text style={[styles.insightText, { color: colors.textSecondary }]}>
        {isCritical
          ? 'Vos debés X días de vida financiera'
          : 'Hoy debés X días de vida financiera'}
      </Text>
    </View>
  );
}

// ============================================================================
// SCREEN: BalanceWalletScreen
// ============================================================================
export default function BalanceWalletScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [localProfile, dashRes] = await Promise.all([
          getUserProfile(),
          api.getDashboard().catch(() => null)
        ]);
        setProfile(localProfile);
        setDashboard(dashRes);
      } catch (e) {
        console.log('Error loading balance:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const metrics = useMemo(() => {
    const gastosFijos = Number(dashboard?.gastos_fijos || 0);
    const ingresosFijos = Number(dashboard?.ingresos_fijos || 0);
    const saldo = Number(dashboard?.saldo || 0);
    const daysInMonth = 30;
    const costoDelDia = daysInMonth > 0 ? gastosFijos / daysInMonth : 0;
    const diasDeVida = costoDelDia > 0 ? saldo / costoDelDia : 0;
    const diasCubiertos = Math.max(0, diasDeVida);
    const diasAdeudados = Math.max(0, Math.abs(diasDeVida < 0 ? diasDeVida : 0));
    const saludFinanciera = Math.min(100, (diasCubiertos / daysInMonth) * 100);
    return { gastosFijos, saldo, daysInMonth, costoDelDia, diasDeVida, diasCubiertos, diasAdeudados, saludFinanciera };
  }, [dashboard]);

  // Mock chart data - 30 days
  const chartDays = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      day: i + 1,
      income: Math.random() > 0.7 ? Math.random() * 60000 : 0,
      expense: Math.random() * 40000,
    }));
  }, []);

  // Expense breakdown mock data
  const breakdownItems = [
    { category: 'Vivienda', amount: metrics.gastosFijos * 0.426, pct: 42.6 },
    { category: 'Transporte', amount: metrics.gastosFijos * 0.20, pct: 20.0 },
    { category: 'Servicios', amount: metrics.gastosFijos * 0.18, pct: 18.0 },
    { category: 'Alimentación', amount: metrics.gastosFijos * 0.12, pct: 12.0 },
    { category: 'Otros', amount: metrics.gastosFijos * 0.064, pct: 6.4 },
  ];

  // Smart recommendation
  const recommendation = useMemo(() => {
    if (metrics.saludFinanciera < 30) {
      return { tipo: 'danger', mensaje: 'Tu salud financiera está crítica. Reducí gastos fijos para recuperar estabilidad.' };
    }
    if (metrics.gastosFijos > (profile?.ingreso_mensual || 0) * 0.8) {
      return { tipo: 'warning', mensaje: 'Gastos fijos superan el 80% de tus ingresos. Considerá reducir entretenimiento.' };
    }
    return { tipo: 'success', mensaje: 'Vas bien! Continuad así y tu salud financiera mejorará.' };
  }, [metrics, profile]);

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const name = profile?.apodo || profile?.nombre || 'Toche';
  const isCritical = metrics.saludFinanciera < 30;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Balance</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Tu saldo en tiempo de vida financiera</Text>
        </View>

        {/* Wallet Card */}
        <WalletCard saldo={metrics.saldo} name={name} isCritical={isCritical} />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatBox
            icon="calendar"
            iconColor={colors.green}
            label="Costo por día"
            value={`$${metrics.costoDelDia.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
          />
          <StatBox
            icon="clock"
            iconColor={colors.red}
            label="Gastos fijos / mes"
            value={`$${metrics.gastosFijos.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`}
          />
        </View>

        {/* Month Summary + Chart */}
        <View style={[styles.monthSummary, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Resumen del mes</Text>
          <View style={styles.monthStatsRow}>
            <View style={styles.monthStat}>
              <Text style={[styles.monthLabel, { color: colors.textSecondary }]}>Ingresos</Text>
              <Text style={[styles.monthValue, { color: colors.green }]}>
                +${Number(dashboard?.ingresos || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
              </Text>
            </View>
            <View style={styles.monthStat}>
              <Text style={[styles.monthLabel, { color: colors.textSecondary }]}>Gastos</Text>
              <Text style={[styles.monthValue, { color: colors.red }]}>
                -${Number(dashboard?.gastos || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
              </Text>
            </View>
          </View>
          <MonthChart days={chartDays} />
        </View>

        {/* Life Bars */}
        <View style={styles.barsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Barras de vida</Text>
          <LifeBar label="Días cubiertos" value={metrics.diasCubiertos} max={metrics.daysInMonth} color={colors.green} />
          <LifeBar label="Días adeudados" value={metrics.diasAdeudados} max={metrics.daysInMonth} color={colors.red} />
          <View style={[styles.healthCard, { backgroundColor: colors.surface }]}>
            <View style={styles.healthLeft}>
              <Feather name="heart" size={22} color={metrics.saludFinanciera > 50 ? colors.green : colors.red} />
              <Text style={[styles.healthLabel, { color: colors.text }]}>Salud financiera</Text>
            </View>
            <Text style={[styles.healthValue, { color: metrics.saludFinanciera > 50 ? colors.green : colors.red }]}>
              {metrics.saludFinanciera.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Recommendation */}
        <RecommendationCard tipo={recommendation.tipo} mensaje={recommendation.mensaje} />

        {/* Expense Breakdown */}
        <View style={[styles.breakdownCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Desglose de gastos fijos</Text>
          {breakdownItems.map((item, i) => (
            <ExpenseBreakdownRow key={i} category={item.category} amount={item.amount} pct={item.pct} />
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <View style={[styles.actionBtn, { backgroundColor: colors.green }]}>
            <Feather name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Registrar ingreso</Text>
          </View>
          <View style={[styles.actionBtn, { backgroundColor: colors.red }]}>
            <Feather name="minus" size={20} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Registrar gasto</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header: { marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 2 },

  // Wallet Card
  walletCard: { borderRadius: 20, padding: 20, gap: 12 },
  walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  walletLeft: { gap: 4 },
  walletName: { fontSize: 20, fontWeight: '700' },
  diamondBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  diamond: { fontSize: 12 },
  diamondText: { fontSize: 12, fontWeight: '600' },
  walletIcon: {},
  walletBalance: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  statusTag: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  insightText: { fontSize: 14 },
  heartContainer: { alignItems: 'center', gap: 2 },
  heartIcon: {},
  heartPct: { fontSize: 28, fontWeight: '800' },

  // Stats Row
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, borderRadius: 14, padding: 14, gap: 4 },
  statIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statLabel: { fontSize: 11 },
  statValue: { fontSize: 17, fontWeight: '700' },

  // Month Summary
  monthSummary: { borderRadius: 16, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  monthStatsRow: { flexDirection: 'row', gap: 16 },
  monthStat: { flex: 1 },
  monthLabel: { fontSize: 12 },
  monthValue: { fontSize: 20, fontWeight: '700' },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 70, gap: 3 },
  chartBarWrapper: { flex: 1, alignItems: 'center', gap: 2 },
  chartBarBg: { width: '100%', height: 50, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end', flexDirection: 'row', gap: 1 },
  barIncome: { width: '50%', borderRadius: 2 },
  barExpense: { width: '50%', borderRadius: 2 },
  chartDay: { fontSize: 8 },

  // Life Bars
  barsSection: { gap: 10 },
  barCard: { borderRadius: 14, padding: 14, gap: 8 },
  barTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barLabel: { fontSize: 14, fontWeight: '600' },
  barValue: { fontSize: 14, fontWeight: '700' },
  track: { height: 8, borderRadius: 4 },
  fill: { height: '100%', borderRadius: 4 },
  healthCard: { borderRadius: 14, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  healthLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  healthLabel: { fontSize: 14, fontWeight: '600' },
  healthValue: { fontSize: 20, fontWeight: '700' },

  // Recommendation
  recCard: { borderRadius: 14, padding: 14, gap: 8 },
  recHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recTitle: { fontSize: 14, fontWeight: '700' },
  recText: { fontSize: 13, lineHeight: 18 },

  // Breakdown
  breakdownCard: { borderRadius: 16, padding: 16, gap: 12 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  breakdownIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  breakdownCat: { flex: 1, fontSize: 13, fontWeight: '500', marginLeft: 8 },
  breakdownAmount: { fontSize: 13, fontWeight: '700' },
  breakdownPct: { fontSize: 12, width: 40, textAlign: 'right' },

  // Action Buttons
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 14, gap: 8 },
  actionBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
