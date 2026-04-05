import React, { useCallback, useEffect, useState } from 'react';
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
import { C, S, R, SHADOW, h1, h2, muted, CATEGORY_EMOJI } from '../theme';

function Avatar({ uri, name, onPress }) {
  const initial = (name || 'U')[0].toUpperCase();
  return (
    <Pressable style={styles.avatar} onPress={onPress}>
      {uri ? (
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
      ) : (
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
      )}
    </Pressable>
  );
}

function MoneyDisplay({ label, amount, color }) {
  return (
    <View style={styles.moneyBlock}>
      <Text style={styles.moneyLabel}>{label}</Text>
      <Text style={[styles.moneyAmount, color && { color }]}>
        ${Number(amount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
      </Text>
    </View>
  );
}

function TransactionRow({ item, onDelete }) {
  const emoji = CATEGORY_EMOJI[item.categoria] || '📦';
  const isIncome = item.tipo === 'INGRESO';
  return (
    <Pressable style={styles.txRow} onLongPress={onDelete}>
      <View style={[styles.txIcon, isIncome ? styles.txIconGreen : styles.txIconRed]}>
        <Text style={styles.txEmoji}>{emoji}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txCategory}>{item.categoria}</Text>
        {item.descripcion ? (
          <Text style={styles.txDesc} numberOfLines={1}>{item.descripcion}</Text>
        ) : null}
      </View>
      <Text style={[styles.txAmount, isIncome ? styles.txAmountGreen : styles.txAmountRed]}>
        {isIncome ? '+' : '-'}${Number(item.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
      </Text>
    </Pressable>
  );
}

export default function DashboardScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [dashRes, profileRes] = await Promise.all([api.getDashboard(), api.getProfile()]);
      setData(dashRes);
      setProfile(profileRes.user || profileRes);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const logout = async () => {
    await clearToken();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const confirmDelete = (item) => {
    Alert.alert('Eliminar', `¿Eliminar ${item.categoria} $${Number(item.monto).toFixed(2)}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await api.deleteTx(item.id); load(); } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const name = profile?.apodo || profile?.nombre || 'Capitalizador';
  const txs = data?.ultimas_transacciones || [];
  const health = data?.salud_financiera || 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={C.primary} />}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {name}</Text>
            <Text style={styles.tagline}>Tu salud financiera</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Profile')}>
            <Avatar name={name} />
          </Pressable>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance actual</Text>
          <Text style={styles.balanceAmount}>
            ${Number(data?.saldo || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.healthBar}>
            <View style={[styles.healthFill, { width: `${Math.min(health, 100)}%` }]} />
          </View>
          <Text style={styles.healthLabel}>Salud financiera: {health}%</Text>
        </View>

        {/* Ingresos / Gastos */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
            <Text style={styles.summaryLabel}>Ingresos</Text>
            <Text style={[styles.summaryAmount, { color: C.green }]}>
              +${Number(data?.ingresos || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: 'rgba(255, 69, 58, 0.1)' }]}>
            <Text style={styles.summaryLabel}>Gastos</Text>
            <Text style={[styles.summaryAmount, { color: C.red }]}>
              -${Number(data?.gastos || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('AddTransaction', { tipo: 'INGRESO' })}>
            <Text style={styles.actionBtnText}>+ Ingreso</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, styles.actionBtnOutline]} onPress={() => navigation.navigate('AddTransaction', { tipo: 'GASTO' })}>
            <Text style={[styles.actionBtnText, styles.actionBtnTextOutline]}>+ Gasto</Text>
          </Pressable>
        </View>

        {/* Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Movimientos</Text>
          <Pressable onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAll}>Ver todo</Text>
          </Pressable>
        </View>

        {txs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sin movimientos</Text>
            <Text style={styles.emptySub}>Agregá tu primer ingreso o gasto</Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {txs.slice(0, 8).map((item) => (
              <TransactionRow key={item.id} item={item} onDelete={() => confirmDelete(item)} />
            ))}
          </View>
        )}

        {/* Bottom hint */}
        <View style={styles.hintRow}>
          <Pressable style={styles.hintBtn} onPress={() => navigation.navigate('AddTransactionVoice')}>
            <Text style={styles.hintIcon}>🎤</Text>
            <Text style={styles.hintText}>Registro por voz</Text>
          </Pressable>
          <Pressable style={styles.hintBtn} onPress={() => navigation.navigate('Chat')}>
            <Text style={styles.hintIcon}>🤖</Text>
            <Text style={styles.hintText}>Asistente AI</Text>
          </Pressable>
          <Pressable style={styles.hintBtn} onPress={() => navigation.navigate('Budget')}>
            <Text style={styles.hintIcon}>📊</Text>
            <Text style={styles.hintText}>Presupuestos</Text>
          </Pressable>
        </View>

      </ScrollView>

      {/* Bottom Tab */}
      <View style={styles.bottomTab}>
        <Pressable style={styles.tabItem} onPress={() => navigation.navigate('Life')}>
          <Text style={styles.tabIcon}>⚖️</Text>
          <Text style={styles.tabLabel}>Balance</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => navigation.navigate('Savings')}>
          <Text style={styles.tabIcon}>💰</Text>
          <Text style={styles.tabLabel}>Ahorros</Text>
        </Pressable>
        <Pressable style={styles.tabItemPrimary} onPress={() => navigation.navigate('AddTransactionVoice')}>
          <Text style={styles.tabIconPrimary}>+</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => navigation.navigate('Chat')}>
          <Text style={styles.tabIcon}>🤖</Text>
          <Text style={styles.tabLabel}>AI</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Perfil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: S.lg, paddingBottom: 120, gap: S.lg },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 28, fontWeight: '800', color: C.text },
  tagline: { ...muted(), marginTop: 2 },
  
  // Avatar
  avatar: { width: 44, height: 44 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  avatarInitial: { color: C.primary, fontSize: 18, fontWeight: '700' },
  
  // Balance Card
  balanceCard: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: S.lg,
    gap: S.sm,
  },
  balanceLabel: { ...muted(), fontSize: 13 },
  balanceAmount: { fontSize: 36, fontWeight: '800', color: C.text, letterSpacing: -1 },
  healthBar: { height: 4, backgroundColor: C.border, borderRadius: 2, marginTop: S.xs },
  healthFill: { height: '100%', backgroundColor: C.green, borderRadius: 2 },
  healthLabel: { ...muted(), fontSize: 12, marginTop: 2 },
  
  // Summary Row
  summaryRow: { flexDirection: 'row', gap: S.sm },
  summaryCard: { flex: 1, borderRadius: R.md, padding: S.md },
  summaryLabel: { ...muted(), fontSize: 12, marginBottom: 4 },
  summaryAmount: { fontSize: 18, fontWeight: '700' },
  
  // Actions
  actionsRow: { flexDirection: 'row', gap: S.sm },
  actionBtn: { flex: 1, backgroundColor: C.primary, borderRadius: R.md, paddingVertical: 14, alignItems: 'center' },
  actionBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
  actionBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.border },
  actionBtnTextOutline: { color: C.text },
  
  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  seeAll: { color: C.primary, fontSize: 14, fontWeight: '600' },
  
  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: S.xl, gap: S.xs },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.textSecondary },
  emptySub: { ...muted() },
  
  // Tx List
  txList: { gap: S.xs },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: S.sm, gap: S.sm },
  txIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txIconGreen: { backgroundColor: 'rgba(52, 199, 89, 0.12)' },
  txIconRed: { backgroundColor: 'rgba(255, 69, 58, 0.12)' },
  txEmoji: { fontSize: 20 },
  txInfo: { flex: 1 },
  txCategory: { fontSize: 15, fontWeight: '600', color: C.text },
  txDesc: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  txAmountGreen: { color: C.green },
  txAmountRed: { color: C.red },
  
  // Hint Row
  hintRow: { flexDirection: 'row', gap: S.sm },
  hintBtn: { flex: 1, backgroundColor: C.surface, borderRadius: R.md, paddingVertical: S.sm, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: C.border },
  hintIcon: { fontSize: 18 },
  hintText: { fontSize: 11, color: C.textSecondary, fontWeight: '600' },
  
  // Bottom Tab
  bottomTab: {
    position: 'absolute',
    bottom: S.lg,
    left: S.lg,
    right: S.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    borderRadius: R.lg,
    paddingVertical: S.sm,
    paddingHorizontal: S.md,
    ...SHADOW(0.3),
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, color: C.textSecondary, fontWeight: '600' },
  tabItemPrimary: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
  },
  tabIconPrimary: { fontSize: 28, fontWeight: '300', color: '#000' },
});
