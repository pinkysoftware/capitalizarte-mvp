import React, { useTheme } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { api } from '../services/api';
import { getStoredProfilePhoto } from '../services/profileMedia';

const { colors } = useTheme();
const COLORS = colors || {
  background: '#0D0F14',
  surface: '#141820',
  surfaceSoft: '#1A1F2B',
  primary: '#D4A017',
  primaryBright: '#F0C040',
  text: '#E8E8E8',
  muted: '#9A9FAA',
  border: 'rgba(212, 160, 23, 0.22)',
  green: '#2ECC40',
  red: '#E53935',
};

const AVATARS = { '1': '🧑‍💼', '2': '🧑‍🎓', '3': '🧑‍🚀', '4': '🧑‍🔧', '5': '🧑‍💻' };

function StatCard({ label, value, hint, accent }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && { color: accent }]}>{value}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </View>
  );
}

function LifeBar({ label, value, max = 100, color = COLORS.primary }) {
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
  const [photoUri, setPhotoUri] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, dashboardRes] = await Promise.all([api.getProfile(), api.dashboard()]);
        const user = profileRes.user || null;
        setProfile(user);
        setDashboard(dashboardRes);
        const storedPhoto = await getStoredProfilePhoto(user?.email || '');
        setPhotoUri(storedPhoto || null);
      } catch (e) {
        Alert.alert('No pudimos cargar esta vista', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const metrics = useMemo(() => {
    const gastosFijosMensuales = Number(dashboard?.gastos_fijos || 0) || Number(profile?.gastos_fijos || 0);
    const saldo = Number(dashboard?.saldo || 0);
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const costoDelDia = daysInMonth > 0 ? gastosFijosMensuales / daysInMonth : 0;
    const diasDeVida = costoDelDia > 0 ? saldo / costoDelDia : 0;
    const diasCubiertos = Math.max(0, diasDeVida);
    const diasAdeudados = Math.max(0, Math.abs(diasDeVida < 0 ? diasDeVida : 0));
    const barMax = Math.max(daysInMonth, diasCubiertos, diasAdeudados, 1);
    return { gastosFijosMensuales, saldo, daysInMonth, costoDelDia, diasDeVida, diasCubiertos, diasAdeudados, barMax };
  }, [profile, dashboard]);

  if (loading) {
    return <View style={styles.loadingScreen}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  const displayName = profile?.apodo || profile?.nombre || 'Usuario';
  const emoji = AVATARS[String(profile?.avatar_id || '1')] || '🧑';
  const insightText = metrics.diasDeVida >= 0
    ? `Hoy tenés ${metrics.diasCubiertos.toFixed(1)} días de vida financiera cubiertos.`
    : `Hoy debés ${metrics.diasAdeudados.toFixed(1)} días de vida financiera.`;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.avatarWrap}>{photoUri ? <Image source={{ uri: photoUri }} style={styles.photoAvatar} /> : <Text style={styles.heroEmoji}>{emoji}</Text>}</View>
        <Text style={styles.eyebrow}>VIDA FINANCIERA</Text>
        <Text style={styles.title}>{displayName}</Text>
        <Text style={styles.subtitle}>Esta vista traduce tu saldo mensual en tiempo de vida financiera según tus gastos fijos del mes.</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Saldo y tiempo</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Saldo actual" value={`$${metrics.saldo.toFixed(2)}`} accent={metrics.saldo >= 0 ? COLORS.primaryBright : COLORS.red} />
          <StatCard label="Costo del día" value={`$${metrics.costoDelDia.toFixed(2)}`} hint={`Gastos fijos del mes / ${metrics.daysInMonth} días`} />
          <StatCard label="Gastos fijos del mes" value={`$${metrics.gastosFijosMensuales.toFixed(2)}`} />
        </View>
        <Text style={[styles.bigInsight, metrics.diasDeVida < 0 && { color: COLORS.red }]}>{insightText}</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Barras de vida</Text>
        <LifeBar label="Días cubiertos" value={metrics.diasCubiertos} max={metrics.barMax} color={COLORS.green} />
        <LifeBar label="Días adeudados" value={metrics.diasAdeudados} max={metrics.barMax} color={COLORS.red} />
        <LifeBar label="Salud financiera" value={Number(dashboard?.salud_financiera || 0)} max={100} color={metrics.diasDeVida < 0 ? COLORS.red : COLORS.primary} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  loadingScreen: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 36, gap: 16 },
  heroCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 24, padding: 22, alignItems: 'center' },
  avatarWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.surfaceSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14, overflow: 'hidden' },
  photoAvatar: { width: '100%', height: '100%' },
  heroEmoji: { fontSize: 44 },
  eyebrow: { color: COLORS.primaryBright, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginBottom: 10 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: COLORS.muted, textAlign: 'center', lineHeight: 21 },
  sectionCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 18, gap: 12 },
  sectionTitle: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  statsGrid: { gap: 10 },
  statCard: { backgroundColor: COLORS.surfaceSoft, borderRadius: 16, padding: 14 },
  statLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 6 },
  statValue: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  statHint: { color: COLORS.muted, marginTop: 4, fontSize: 12 },
  bigInsight: { color: COLORS.text, fontSize: 16, lineHeight: 24, fontWeight: '700' },
  barCard: { gap: 8 },
  barTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barLabel: { color: COLORS.text, fontWeight: '700' },
  barValue: { fontWeight: '800' },
  track: { height: 14, backgroundColor: COLORS.surfaceSoft, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
});
