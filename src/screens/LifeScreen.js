import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { api } from '../services/api';
import { getUserProfile } from '../services/userStorage';
import { useTheme } from '../contexts/ThemeContext';

const AVATARS = { '1': '🧑💼', '2': '🧑🎓', '3': '🧑🚀', '4': '🧑🔧', '5': '🧑💻' };

const CATEGORY_ICONS = {
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

export default function LifeScreen() {
  const { colors } = useTheme();
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
        console.log('Error loading life screen:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const metrics = useMemo(() => {
    const gastosFijos = Number(dashboard?.gastos_fijos || 0);
    const ingresosFijos = Number(dashboard?.ingresos_fijos || 0);
    const ingresoReferencia = ingresosFijos > 0
      ? ingresosFijos
      : Number(profile?.ingreso_mensual || 0);
    const saldo = Number(dashboard?.saldo || 0);
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const costoDelDia = daysInMonth > 0 ? gastosFijos / daysInMonth : 0;
    const diasDeVida = costoDelDia > 0 ? saldo / costoDelDia : 0;
    const diasCubiertos = Math.max(0, diasDeVida);
    const diasAdeudados = Math.max(0, Math.abs(diasDeVida < 0 ? diasDeVida : 0));
    const saludFinanciera = Math.min(100, (diasCubiertos / daysInMonth) * 100);
    const barMax = Math.max(daysInMonth, diasCubiertos, diasAdeudados, 1);
    return { gastosFijos, ingresoReferencia, saldo, daysInMonth, costoDelDia, diasDeVida, diasCubiertos, diasAdeudados, saludFinanciera, barMax };
  }, [profile, dashboard]);

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const name = profile?.apodo || profile?.nombre || 'Usuario';
  const insightText = metrics.diasDeVida >= 0
    ? `Hoy tenés ${metrics.diasCubiertos.toFixed(1)} días de vida financiera cubiertos.`
    : `Hoy debés ${metrics.diasAdeudados.toFixed(1)} días de vida financiera.`;

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.bg }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>{AVATARS[String(profile?.avatar_id || '1')] || '🧑'}</Text>
        <Text style={[styles.heroTitle, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.heroSub, { color: colors.textSecondary }]}>Tu saldo en tiempo de vida financiera</Text>
      </View>

      {/* Balance Card */}
      <View style={[styles.balanceCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Balance actual</Text>
        <Text style={[styles.balanceAmount, { color: metrics.saldo >= 0 ? colors.green : colors.red }]}>
          ${metrics.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={[styles.insight, { color: metrics.diasDeVida < 0 ? colors.red : colors.green }]}>{insightText}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(52, 199, 89, 0.15)' }]}>
            <Feather name="calendar" size={18} color={colors.green} />
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Costo por día</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>${metrics.costoDelDia.toFixed(2)}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 69, 58, 0.15)' }]}>
            <Feather name="clock" size={18} color={colors.red} />
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Gastos fijos / mes</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>${metrics.gastosFijos.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</Text>
        </View>
      </View>

      {/* Life Bars */}
      <View style={styles.barsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Barras de vida</Text>
        <LifeBar label="Días cubiertos" value={metrics.diasCubiertos} max={metrics.barMax} color={colors.green} />
        <LifeBar label="Días adeudados" value={metrics.diasAdeudados} max={metrics.barMax} color={colors.red} />
        <LifeBar label="Salud financiera" value={metrics.saludFinanciera} max={100} color={metrics.diasDeVida < 0 ? colors.red : colors.green} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 16 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', gap: 6 },
  heroEmoji: { fontSize: 52 },
  heroTitle: { fontSize: 26, fontWeight: '800' },
  heroSub: { fontSize: 13 },
  balanceCard: { borderRadius: 16, padding: 16, gap: 8 },
  balanceLabel: { fontSize: 13 },
  balanceAmount: { fontSize: 34, fontWeight: '800' },
  insight: { fontSize: 15, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, gap: 6 },
  statIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statLabel: { fontSize: 11 },
  statValue: { fontSize: 17, fontWeight: '700' },
  barsSection: { gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  barCard: { borderRadius: 14, padding: 14, gap: 8 },
  barTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barLabel: { fontSize: 14, fontWeight: '600' },
  barValue: { fontSize: 14, fontWeight: '700' },
  track: { height: 8, borderRadius: 4 },
  fill: { height: '100%', borderRadius: 4 },
});
