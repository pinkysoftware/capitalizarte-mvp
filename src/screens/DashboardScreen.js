import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { api } from '../services/api';
import { getUserProfile } from '../services/userStorage';
import { useTheme } from '../contexts/ThemeContext';

// ============================================================================
// ICONOS POR CATEGORÍA
// ============================================================================
const CATEGORY_ICONS = {
  'SUPERMERCADO': 'shopping-cart',
  'TRANSPORTE': 'truck',
  'ENTRETENIMIENTO': 'film',
  'SERVICIOS': 'zap',
  'SALUD': 'heart',
  'EDUCACIÓN': 'book-open',
  'HOGAR': 'home',
  'COMIDA': 'coffee',
  'DEUDA': 'credit-card',
  'OTRO': 'package',
  'INGRESO': 'trending-up',
  'SALARIO': 'briefcase',
  'FREELANCE': 'zap',
  'REGALO': 'gift',
  'VENTA': 'tag',
};

// ============================================================================
// HEALTH INDICATOR
// ============================================================================
function HealthBadge({ health }) {
  const { colors } = useTheme();
  const getColor = () => {
    if (health >= 70) return colors.green;
    if (health >= 40) return colors.yellow;
    return colors.red;
  };
  const color = getColor();
  return (
    <View style={[styles.healthBadge, { backgroundColor: color + '20' }]}>
      <Feather name="heart" size={12} color={color} />
      <Text style={[styles.healthBadgeText, { color }]}>{health}%</Text>
    </View>
  );
}

// ============================================================================
// HEADER
// ============================================================================
function Header({ name, profile, health, onProfilePress, isDark }) {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={[styles.greeting, { color: colors.text }]}>Hola, {name}</Text>
        <HealthBadge health={health} />
      </View>
      <View style={styles.headerRight}>
        <Pressable style={styles.iconBtn}>
          <Feather name="search" size={20} color={colors.textSecondary} />
        </Pressable>
        <Pressable style={styles.iconBtn}>
          <Feather name="bell" size={20} color={colors.textSecondary} />
        </Pressable>
        <Pressable onPress={onProfilePress}>
          <View style={[styles.headerAvatar, { backgroundColor: colors.surface }]}>
            {profile?.foto ? (
              <Image source={{ uri: profile.foto }} style={styles.headerAvatarImg} />
            ) : (
              <Text style={[styles.headerAvatarInitial, { color: colors.primary }]}>
                {(name || 'U')[0].toUpperCase()}
              </Text>
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// ============================================================================
// CARD: BALANCE PRINCIPAL
// ============================================================================
function BalanceCard({ saldo, isDark }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.balanceCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Balance actual</Text>
      <Text style={[styles.balanceAmount, { color: saldo >= 0 ? colors.green : colors.red }]}>
        {saldo >= 0 ? '+' : '-'}${Math.abs(saldo).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
      </Text>
    </View>
  );
}

// ============================================================================
// CARD: STATS (INGRESOS / GASTOS)
// ============================================================================
function StatsRow({ ingresos, gastos, isDark }) {
  const { colors } = useTheme();
  return (
    <View style={styles.statsRow}>
      <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.statIcon, { backgroundColor: colors.green + '20' }]}>
          <Feather name="trending-up" size={16} color={colors.green} />
        </View>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ingresos del mes</Text>
        <Text style={[styles.statValue, { color: colors.green }]}>
          +${Number(ingresos || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
        </Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.statIcon, { backgroundColor: colors.red + '20' }]}>
          <Feather name="trending-down" size={16} color={colors.red} />
        </View>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Gastos del mes</Text>
        <Text style={[styles.statValue, { color: colors.red }]}>
          -${Number(gastos || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// QUICK ACTIONS
// ============================================================================
function QuickActions({ navigation, isDark }) {
  const { colors } = useTheme();
  const actions = [
    { icon: 'plus-circle', label: 'Nuevo ingreso', color: colors.green, tipo: 'INGRESO' },
    { icon: 'minus-circle', label: 'Nuevo gasto', color: colors.red, tipo: 'GASTO' },
    { icon: 'bar-chart-2', label: 'Ver reportes', color: colors.blue },
    { icon: 'pie-chart', label: 'Presupuesto', color: colors.purple },
  ];
  return (
    <View style={styles.quickActionsSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Acciones rápidas</Text>
      <View style={styles.quickActionsGrid}>
        {actions.map((a, i) => (
          <Pressable
            key={i}
            style={[styles.quickActionBtn, { backgroundColor: colors.surface }]}
            onPress={() => a.tipo ? navigation.navigate('AddTransaction', { tipo: a.tipo }) : navigation.navigate(a.label === 'Ver reportes' ? 'Reports' : 'Budget')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: a.color + '20' }]}>
              <Feather name={a.icon} size={18} color={a.color} />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.text }]}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// PANEL: TAREAS INTELIGENTES
// ============================================================================
function SmartTasksPanel({ dashboard, profile, isDark }) {
  const { colors } = useTheme();
  const tasks = useMemo(() => {
    const result = [];
    const gastosFijos = Number(dashboard?.gastos_fijos || 0);
    const saldo = Number(dashboard?.saldo || 0);
    const salud = dashboard?.salud_financiera || 0;

    if (salud < 30) {
      result.push({ icon: 'alert-circle', color: colors.red, text: 'Tu salud financiera está en estado crítico', urgent: true });
    }
    if (gastosFijos > Number(profile?.ingreso_mensual || 0) * 0.8) {
      result.push({ icon: 'trending-up', color: colors.yellow, text: 'Gastos fijos superan el 80% de tus ingresos', urgent: true });
    }
    if (saldo < 0) {
      result.push({ icon: 'alert-triangle', color: colors.red, text: 'Balance negativo. Revisá tus gastos.', urgent: true });
    }
    result.push({ icon: 'plus-circle', color: colors.blue, text: 'Registrá ingresos pendientes' });
    result.push({ icon: 'refresh-cw', color: colors.purple, text: 'Revisá proyecciones mensuales' });
    return result;
  }, [dashboard, profile]);

  if (tasks.length === 0) return null;

  return (
    <View style={styles.smartTasksSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Tareas inteligentes</Text>
      <View style={[styles.smartTasksCard, { backgroundColor: colors.surface }]}>
        {tasks.map((task, i) => (
          <Pressable key={i} style={[styles.smartTaskItem, i < tasks.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <View style={[styles.smartTaskIcon, { backgroundColor: task.color + '20' }]}>
              <Feather name={task.icon} size={16} color={task.color} />
            </View>
            <Text style={[styles.smartTaskText, { color: colors.text }]}>{task.text}</Text>
            <Feather name="chevron-right" size={16} color={colors.textTertiary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// CHART: INGRESOS VS GASTOS (barras)
// ============================================================================
function IncomeExpenseChart({ dashboard, isDark }) {
  const { colors } = useTheme();
  const chartData = useMemo(() => {
    // Fake 15-day data
    return Array.from({ length: 15 }, (_, i) => {
      return { day: i + 1, income: Math.random() * 80000, expense: Math.random() * 60000 };
    });
  }, []);

  return (
    <View style={styles.chartSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingresos vs Gastos</Text>
      <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
        <View style={styles.chartBars}>
          {chartData.slice(-10).map((d, i) => {
            const maxVal = Math.max(d.income, d.expense, 1);
            return (
              <View key={i} style={styles.chartBarWrapper}>
                <View style={styles.chartBarContainer}>
                  <View style={[styles.barIncome, { height: `${(d.income / 100000) * 100}%`, backgroundColor: colors.green }]} />
                  <View style={[styles.barExpense, { height: `${(d.expense / 100000) * 100}%`, backgroundColor: colors.red }]} />
                </View>
                <Text style={[styles.chartDay, { color: colors.textTertiary }]}>{d.day}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.green }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Ingresos</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.red }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Gastos</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// MOVIMIENTOS RECIENTES
// ============================================================================
function TransactionRow({ item, onDelete }) {
  const { colors } = useTheme();
  const iconName = CATEGORY_ICONS[item.categoria?.toUpperCase()] || 'circle';
  const isIncome = item.tipo === 'INGRESO';

  return (
    <Pressable style={[styles.txRow, { backgroundColor: colors.surface }]} onLongPress={onDelete}>
      <View style={[styles.txIcon, { backgroundColor: isIncome ? colors.green + '20' : colors.red + '20' }]}>
        <Feather name={iconName} size={16} color={isIncome ? colors.green : colors.red} />
      </View>
      <View style={styles.txInfo}>
        <Text style={[styles.txCategory, { color: colors.text }]}>{item.categoria}</Text>
        {item.descripcion ? (
          <Text style={[styles.txDesc, { color: colors.textSecondary }]} numberOfLines={1}>{item.descripcion}</Text>
        ) : null}
      </View>
      <Text style={[styles.txAmount, { color: isIncome ? colors.green : colors.red }]}>
        {isIncome ? '+' : '-'}${Number(item.monto).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
      </Text>
    </Pressable>
  );
}

// ============================================================================
// SCREEN: DashboardScreen
// ============================================================================
export default function DashboardScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    try {
      const [dashRes, localProfile] = await Promise.all([
        api.getDashboard().catch(e => ({ saldo: 0, ingresos: 0, gastos: 0, salud_financiera: 0, ultimas_transacciones: [] })),
        getUserProfile()
      ]);
      setData(dashRes);
      setProfile(localProfile);
    } catch (e) {
      console.log('Error loading dashboard:', e);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const confirmDelete = (item) => {
    Alert.alert('Eliminar', `¿Eliminar ${item.categoria}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await api.deleteTx(item.id); load(); } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const name = profile?.apodo || profile?.nombre || 'Capitalizador';
  const txs = Array.isArray(data?.ultimas_transacciones) ? data.ultimas_transacciones : [];
  const health = data?.salud_financiera || 0;

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
          <View style={styles.header}>
            <View style={{ gap: 8 }}>
              <View style={{ width: 140, height: 28, backgroundColor: colors.surfaceHover, borderRadius: 8 }} />
              <View style={{ width: 100, height: 14, backgroundColor: colors.surfaceHover, borderRadius: 6 }} />
            </View>
            <View style={{ width: 40, height: 40, backgroundColor: colors.surfaceHover, borderRadius: 20 }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 90 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Header
          name={name}
          profile={profile}
          health={health}
          onProfilePress={() => navigation.navigate('Profile')}
          isDark={isDark}
        />

        {/* Balance Card */}
        <BalanceCard saldo={data?.saldo || 0} isDark={isDark} />

        {/* Stats */}
        <StatsRow ingresos={data?.ingresos} gastos={data?.gastos} isDark={isDark} />

        {/* Quick Actions */}
        <QuickActions navigation={navigation} isDark={isDark} />

        {/* Smart Tasks */}
        <SmartTasksPanel dashboard={data} profile={profile} isDark={isDark} />

        {/* Chart */}
        <IncomeExpenseChart dashboard={data} isDark={isDark} />

        {/* Recent Movements */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Movimientos recientes</Text>
            <Pressable onPress={() => navigation.navigate('History')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todo</Text>
            </Pressable>
          </View>
          {txs.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Feather name="inbox" size={36} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sin movimientos aún</Text>
            </View>
          ) : (
            <View style={styles.txList}>
              {txs.slice(0, 6).map((item) => (
                <TransactionRow key={item.id} item={item} onDelete={() => confirmDelete(item)} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Tab */}
      <View style={[styles.bottomTab, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 8, borderTopColor: colors.border }]}>
        <Pressable style={styles.tabItem}>
          <Feather name="home" size={22} color={colors.primary} />
          <Text style={[styles.tabLabel, { color: colors.primary }]}>Inicio</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => navigation.navigate('Life')}>
          <Feather name="activity" size={22} color={colors.textSecondary} />
          <Text style={[styles.tabLabel, { color: colors.textSecondary }]}>Balance</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => navigation.navigate('Chat')}>
          <View style={[styles.aiTab, { backgroundColor: colors.purple }]}>
            <Feather name="zap" size={18} color="#FFF" />
          </View>
          <Text style={[styles.tabLabel, { color: colors.textSecondary }]}>AI</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => navigation.navigate('Reports')}>
          <Feather name="file-text" size={22} color={colors.textSecondary} />
          <Text style={[styles.tabLabel, { color: colors.textSecondary }]}>Reportes</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
          <Feather name="user" size={22} color={colors.textSecondary} />
          <Text style={[styles.tabLabel, { color: colors.textSecondary }]}>Perfil</Text>
        </Pressable>
      </View>
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

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greeting: { fontSize: 26, fontWeight: '800' },
  healthBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  healthBadgeText: { fontSize: 11, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 6 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerAvatarImg: { width: 40, height: 40, borderRadius: 20 },
  headerAvatarInitial: { fontSize: 16, fontWeight: '700' },

  // Balance Card
  balanceCard: { borderRadius: 20, padding: 20, gap: 6 },
  balanceLabel: { fontSize: 13 },
  balanceAmount: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, gap: 6 },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statLabel: { fontSize: 11 },
  statValue: { fontSize: 17, fontWeight: '700' },

  // Quick Actions
  quickActionsSection: { gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickActionBtn: { width: '47%', flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, gap: 10 },
  quickActionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: 13, fontWeight: '600', flex: 1 },

  // Smart Tasks
  smartTasksSection: { gap: 10 },
  smartTasksCard: { borderRadius: 16, overflow: 'hidden' },
  smartTaskItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  smartTaskIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  smartTaskText: { flex: 1, fontSize: 13, fontWeight: '500' },

  // Chart
  chartSection: { gap: 10 },
  chartCard: { borderRadius: 16, padding: 16, gap: 12 },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 4 },
  chartBarWrapper: { flex: 1, alignItems: 'center', gap: 4 },
  chartBarContainer: { width: '100%', height: 60, justifyContent: 'flex-end', gap: 2 },
  barIncome: { width: '100%', borderRadius: 2 },
  barExpense: { width: '100%', borderRadius: 2 },
  chartDay: { fontSize: 9 },
  chartLegend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11 },

  // Recent
  recentSection: { gap: 10 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { fontSize: 13, fontWeight: '600' },
  emptyState: { alignItems: 'center', padding: 32, borderRadius: 16, gap: 8 },
  emptyText: { fontSize: 14, marginTop: 4 },
  txList: { gap: 8 },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, gap: 12 },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txCategory: { fontSize: 14, fontWeight: '600' },
  txDesc: { fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },

  // Bottom Tab
  bottomTab: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 10, borderTopWidth: 1 },
  tabItem: { alignItems: 'center', gap: 3 },
  tabLabel: { fontSize: 10, fontWeight: '500' },
  aiTab: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
