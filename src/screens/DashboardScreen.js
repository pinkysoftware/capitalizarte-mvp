import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, clearToken } from '../services/api';
import FinancialBar from '../components/FinancialBar';
import Avatar from '../components/Avatar';
import TransactionItem from '../components/TransactionItem';
import { getStoredProfilePhoto } from '../services/profileMedia';

const COLORS = {
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

function MoneyCard({ label, value, accent, onPress, hint }) {
  const content = (
    <View style={styles.moneyCard}>
      <Text style={styles.moneyLabel}>{label}</Text>
      <Text style={[styles.moneyValue, accent && { color: accent }]}>${Number(value || 0).toFixed(2)}</Text>
      {hint ? <Text style={styles.moneyHint}>{hint}</Text> : null}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

function BottomMenu({ onIncome, onExpense, onProfile, onLogout, onVoice, onChat, onBudget }) {
  return (
    <View style={styles.bottomMenu}>
      <Pressable style={styles.menuItem} onPress={onVoice}>
        <Text style={styles.menuIcon}>🎤</Text>
        <Text style={styles.menuText}>Voz</Text>
      </Pressable>
      <Pressable style={styles.menuItem} onPress={onChat}>
        <Text style={styles.menuIcon}>🤖</Text>
        <Text style={styles.menuText}>AI</Text>
      </Pressable>
      <Pressable style={styles.menuItem} onPress={onBudget}>
        <Text style={styles.menuIcon}>📊</Text>
        <Text style={styles.menuText}>Presup.</Text>
      </Pressable>
      <Pressable style={styles.menuItem} onPress={onProfile}>
        <Text style={styles.menuIcon}>◉</Text>
        <Text style={styles.menuText}>Perfil</Text>
      </Pressable>
      <Pressable style={styles.menuItem} onPress={onLogout}>
        <Text style={styles.menuIcon}>↩</Text>
        <Text style={styles.menuText}>Salir</Text>
      </Pressable>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const [dashboardRes, profileRes] = await Promise.all([api.dashboard(), api.getProfile()]);
      setData(dashboardRes);
      const user = profileRes.user || null;
      setProfile(user);
      setPhotoUri(await getStoredProfilePhoto(user?.email || ''));
    } catch (e) {
      Alert.alert('No pudimos cargar el dashboard', e.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const logout = async () => {
    await clearToken();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const confirmDeleteTx = (item) => {
    Alert.alert(
      'Eliminar movimiento',
      '¿Seguro quiere eliminar este movimiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteTx(item.id);
              await load();
            } catch (e) {
              Alert.alert('No pudimos eliminar el movimiento', e.message);
            }
          },
        },
      ]
    );
  };

  const txs = data?.ultimas_transacciones || [];
  const displayName = profile?.apodo || profile?.nombre || 'Capitalizador';
  const investorLevel = profile?.nivel_inversor || 'Principiante';
  const avatarId = profile?.avatar_id || '1';
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const fixedBase = Number(data?.gastos_fijos || 0) || Number(profile?.gastos_fijos || 0);
  const dailyCost = daysInMonth > 0 ? fixedBase / daysInMonth : 0;
  const daysCovered = dailyCost > 0 ? Number(data?.saldo || 0) / dailyCost : 0;
  const insightText = daysCovered >= 0
    ? `Con tu saldo actual cubrís aproximadamente ${daysCovered.toFixed(1)} días según tu costo fijo diario.`
    : `Hoy estás por debajo de tu costo fijo diario por ${Math.abs(daysCovered).toFixed(1)} días.`;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={COLORS.primary} />}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>CAPITALIZARTE</Text>
            <Text style={styles.heading}>Hola, {displayName}</Text>
            <Text style={styles.subheading}>Nivel actual: {investorLevel}</Text>
          </View>
          <Pressable style={styles.logoutPill} onPress={logout}>
            <Text style={styles.logoutPillText}>Cerrar sesión</Text>
          </Pressable>
        </View>

        <Avatar avatarId={avatarId} apodo={displayName} photoUri={photoUri} onPress={() => navigation.navigate('Profile')} />

        <FinancialBar value={data?.salud_financiera || 0} />

        <View style={styles.moneyGrid}>
          <MoneyCard label="Ingresos del mes" value={data?.ingresos} accent={COLORS.green} onPress={() => navigation.navigate('AddTransaction', { tipo: 'INGRESO' })} />
          <MoneyCard label="Gastos del mes" value={data?.gastos} accent={COLORS.red} onPress={() => navigation.navigate('AddTransaction', { tipo: 'GASTO' })} />
          <MoneyCard label="Saldo actual" value={data?.saldo} accent={COLORS.primaryBright} onPress={() => navigation.navigate('Life')} hint="Vida financiera" />
        </View>

        <View style={styles.monthSplitCard}>
          <View style={styles.monthSplitHeader}>
            <Text style={styles.monthSplitTitle}>Estructura del mes</Text>
            <Pressable onPress={() => navigation.navigate('Savings')}>
              <Text style={styles.sectionLink}>Ahorros</Text>
            </Pressable>
          </View>
          <View style={styles.splitRow}>
            <View style={styles.splitBox}>
              <Text style={styles.splitLabel}>Ingresos fijos</Text>
              <Text style={[styles.splitValue, { color: COLORS.green }]}>${Number(data?.ingresos_fijos || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.splitBox}>
              <Text style={styles.splitLabel}>Ingresos variables</Text>
              <Text style={[styles.splitValue, { color: COLORS.green }]}>${Number(data?.ingresos_variables || 0).toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.splitRow}>
            <View style={styles.splitBox}>
              <Text style={styles.splitLabel}>Gastos fijos</Text>
              <Text style={[styles.splitValue, { color: COLORS.red }]}>${Number(data?.gastos_fijos || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.splitBox}>
              <Text style={styles.splitLabel}>Gastos variables</Text>
              <Text style={[styles.splitValue, { color: COLORS.red }]}>${Number(data?.gastos_variables || 0).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightEyebrow}>INSIGHT DEL MES</Text>
          <Text style={styles.insightText}>{insightText}</Text>
          <Text style={styles.insightHint}>Costo fijo diario estimado: ${dailyCost.toFixed(2)}</Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.primaryAction} onPress={() => navigation.navigate('AddTransaction', { tipo: 'INGRESO' })}>
            <Text style={styles.primaryActionText}>+ Nuevo ingreso</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={() => navigation.navigate('AddTransaction', { tipo: 'GASTO' })}>
            <Text style={styles.secondaryActionText}>+ Nuevo gasto</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Últimas transacciones</Text>
            <Text style={styles.sectionHint}>{txs.length ? `${txs.length} movimientos recientes` : 'Todavía sin movimientos'}</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('History')}>
            <Text style={styles.sectionLink}>Ver todo</Text>
          </Pressable>
        </View>

        {txs.length ? (
          <FlatList
            data={txs}
            keyExtractor={(item, index) => String(item.id ?? index)}
            renderItem={({ item }) => <TransactionItem item={item} onDelete={() => confirmDeleteTx(item)} />}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Todavía no hay movimientos</Text>
            <Text style={styles.emptyText}>Registrá tu primer ingreso o gasto para empezar a ver tu actividad financiera.</Text>
          </View>
        )}
      </ScrollView>

      <BottomMenu
        onIncome={() => navigation.navigate('AddTransaction', { tipo: 'INGRESO' })}
        onExpense={() => navigation.navigate('AddTransaction', { tipo: 'GASTO' })}
        onProfile={() => navigation.navigate('Profile')}
        onLogout={logout}
        onVoice={() => navigation.navigate('AddTransactionVoice')}
        onChat={() => navigation.navigate('Chat')}
        onBudget={() => navigation.navigate('Budget')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18, paddingBottom: 120, gap: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 12 },
  brand: { color: COLORS.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 },
  heading: { color: COLORS.text, fontSize: 28, fontWeight: '800' },
  subheading: { marginTop: 4, color: COLORS.muted, fontSize: 13 },
  logoutPill: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14 },
  logoutPillText: { color: COLORS.text, fontWeight: '700', fontSize: 12 },
  moneyGrid: { gap: 10 },
  moneyCard: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  moneyLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 6 },
  moneyValue: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  moneyHint: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  monthSplitCard: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  monthSplitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monthSplitTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  splitRow: { flexDirection: 'row', gap: 10 },
  splitBox: { flex: 1, backgroundColor: COLORS.surfaceSoft, borderRadius: 14, padding: 12 },
  splitLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 4 },
  splitValue: { fontSize: 16, fontWeight: '800' },
  insightCard: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 6 },
  insightEyebrow: { color: COLORS.primaryBright, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  insightText: { color: COLORS.text, fontSize: 16, lineHeight: 23, fontWeight: '700' },
  insightHint: { color: COLORS.muted, fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 10 },
  primaryAction: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  primaryActionText: { color: '#111111', fontWeight: '800', fontSize: 15 },
  secondaryAction: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  secondaryActionText: { color: COLORS.text, fontWeight: '800', fontSize: 15 },
  sectionHeaderRow: { marginTop: 6, marginBottom: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 },
  sectionTitle: { color: COLORS.text, fontSize: 19, fontWeight: '800', marginBottom: 4 },
  sectionHint: { color: COLORS.muted, fontSize: 13 },
  sectionLink: { color: COLORS.primaryBright, fontSize: 13, fontWeight: '800' },
  emptyCard: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  emptyTitle: { color: COLORS.text, fontWeight: '800', fontSize: 16, marginBottom: 6 },
  emptyText: { color: COLORS.muted, lineHeight: 20 },
  bottomMenu: { position: 'absolute', left: 12, right: 12, bottom: 12, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#10141C', borderRadius: 22, paddingVertical: 12, paddingHorizontal: 8, borderWidth: 1, borderColor: COLORS.border },
  menuItem: { flex: 1, alignItems: 'center', gap: 4 },
  menuIcon: { color: COLORS.primary, fontSize: 18, fontWeight: '800' },
  menuText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
});
