import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { api } from '../services/api';
import { C, S, R, SHADOW } from '../theme';

const AVATARS = { '1': '🧑💼', '2': '🧑🎓', '3': '🧑🚀', '4': '🧑🔧', '5': '🧑💻' };

function StatCard({ label, value, hint, accent }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && { color: accent }]}>{value}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </View>
  );
}

function LifeBar({ label, value, max = 100, color = C.primary }) {
  const safeValue = Number(value || 0);
  const pct = Math.max(0, Math.min(100, max > 0 ? (safeValue / max) * 100 : 0));
  return (
    <View style={styles.barCard}>
      <View style={styles.barTop}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={[styles.barValue, { color }]}>{safeValue.toFixed(1)}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function LifeScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, dashRes] = await Promise.all([api.getProfile(), api.getDashboard()]);
        setProfile(profileRes.user || profileRes);
        setDashboard(dashRes);
      } catch (e) {
        console.log('Error:', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const metrics = useMemo(() => {
    const gastosFijos = Number(dashboard?.gastos || 0) || Number(profile?.gastos_fijos || 0);
    const saldo = Number(dashboard?.saldo || 0);
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const costoDelDia = daysInMonth > 0 ? gastosFijos / daysInMonth : 0;
    const diasDeVida = costoDelDia > 0 ? saldo / costoDelDia : 0;
    const diasCubiertos = Math.max(0, diasDeVida);
    const diasAdeudados = Math.max(0, Math.abs(diasDeVida < 0 ? diasDeVida : 0));
    const barMax = Math.max(daysInMonth, diasCubiertos, diasAdeudados, 1);
    return { gastosFijos, saldo, daysInMonth, costoDelDia, diasDeVida, diasCubiertos, diasAdeudados, barMax };
  }, [profile, dashboard]);

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={C.primary} size="large" /></View>;
  }

  const name = profile?.apodo || profile?.nombre || 'Usuario';
  const emoji = AVATARS[String(profile?.avatar_id || '1')] || '🧑';
  const insightText = metrics.diasDeVida >= 0
    ? `Hoy tenés ${metrics.diasCubiertos.toFixed(1)} días de vida financiera cubiertos.`
    : `Hoy debés ${metrics.diasAdeudados.toFixed(1)} días de vida financiera.`;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>{emoji}</Text>
        <Text style={styles.heroTitle}>{name}</Text>
        <Text style={styles.heroSub}>Tu saldo en tiempo de vida financiera</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Balance actual</Text>
        <Text style={styles.balanceAmount}>${metrics.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
        <Text style={[styles.insight, metrics.diasDeVida < 0 && { color: C.red }]}>{insightText}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Costo por día</Text>
          <Text style={styles.statValue}>${metrics.costoDelDia.toFixed(2)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Gastos fijos / mes</Text>
          <Text style={styles.statValue}>${metrics.gastosFijos.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</Text>
        </View>
      </View>

      <View style={styles.barsSection}>
        <Text style={styles.sectionTitle}>Barras de vida</Text>
        <LifeBar label="Días cubiertos" value={metrics.diasCubiertos} max={metrics.barMax} color={C.green} />
        <LifeBar label="Días adeudados" value={metrics.diasAdeudados} max={metrics.barMax} color={C.red} />
        <LifeBar label="Salud financiera" value={Number(dashboard?.salud_financiera || 0)} max={100} color={metrics.diasDeVida < 0 ? C.red : C.primary} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { padding: S.lg, paddingBottom: 100, gap: S.lg },
  loading: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', gap: S.xs },
  heroEmoji: { fontSize: 56 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: C.text },
  heroSub: { color: C.textSecondary, fontSize: 14 },
  balanceCard: { backgroundColor: C.surface, borderRadius: R.lg, padding: S.lg, gap: S.sm },
  balanceLabel: { color: C.textSecondary, fontSize: 13 },
  balanceAmount: { fontSize: 36, fontWeight: '800', color: C.text },
  insight: { color: C.green, fontSize: 15, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: S.sm },
  statCard: { flex: 1, backgroundColor: C.surface, borderRadius: R.md, padding: S.md },
  statLabel: { color: C.textSecondary, fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '700', color: C.text },
  barsSection: { gap: S.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  barCard: { backgroundColor: C.surface, borderRadius: R.md, padding: S.md, gap: S.sm },
  barTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barLabel: { fontSize: 14, fontWeight: '600', color: C.text },
  barValue: { fontSize: 14, fontWeight: '700' },
  track: { height: 8, backgroundColor: C.border, borderRadius: 4 },
  fill: { height: '100%', borderRadius: 4 },
});
