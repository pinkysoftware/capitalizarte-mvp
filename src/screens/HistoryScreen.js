import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Alert,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { C, S, R, CATEGORY_EMOJI } from '../theme';

export default function HistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await api.listTx(200);
      setItems(res.transactions || []);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  useFocusEffect(React.useCallback(() => { load(); }, []));

  const confirmDelete = (item) => {
    Alert.alert('Eliminar', `¿Eliminar ${item.categoria} $${Number(item.monto).toFixed(2)}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await api.deleteTx(item.id); load(); } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const renderItem = ({ item }) => {
    const emoji = CATEGORY_EMOJI[item.categoria] || '📦';
    const isIncome = item.tipo === 'INGRESO';
    return (
      <Pressable style={styles.row} onLongPress={() => confirmDelete(item)}>
        <View style={[styles.icon, isIncome ? styles.iconGreen : styles.iconRed]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.category}>{item.categoria}</Text>
          {item.descripcion ? <Text style={styles.desc} numberOfLines={1}>{item.descripcion}</Text> : null}
          <Text style={styles.date}>{item.fecha}</Text>
        </View>
        <Text style={[styles.amount, isIncome ? styles.amountGreen : styles.amountRed]}>
          {isIncome ? '+' : '-'}${Number(item.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(item, i) => String(item.id ?? i)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Sin transacciones</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  list: { padding: S.lg, paddingBottom: 100, gap: S.xs },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: S.sm, gap: S.sm },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconGreen: { backgroundColor: 'rgba(52, 199, 89, 0.12)' },
  iconRed: { backgroundColor: 'rgba(255, 69, 58, 0.12)' },
  emoji: { fontSize: 22 },
  info: { flex: 1 },
  category: { fontSize: 15, fontWeight: '600', color: C.text },
  desc: { fontSize: 13, color: C.textSecondary, marginTop: 2 },
  date: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '700' },
  amountGreen: { color: C.green },
  amountRed: { color: C.red },
  empty: { alignItems: 'center', paddingVertical: S.xxl },
  emptyText: { color: C.textSecondary, fontSize: 16 },
});
