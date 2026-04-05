import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import TransactionItem from '../components/TransactionItem';

const COLORS = {
  background: '#0D0F14',
  surface: '#141820',
  text: '#E8E8E8',
  muted: '#9A9FAA',
  border: 'rgba(212, 160, 23, 0.22)',
};

export default function HistoryScreen() {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const res = await api.listTx(200);
      setItems(res.transactions || []);
    } catch (e) {
      Alert.alert('No pudimos cargar el historial', e.message);
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

  const confirmDelete = (item) => {
    Alert.alert('Eliminar movimiento', '¿Seguro quiere eliminar este movimiento?', [
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
    ]);
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(item, index) => String(item.id ?? index)}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor="#D4A017" />}
        ListHeaderComponent={
          <View style={styles.headerCard}>
            <Text style={styles.eyebrow}>CAPITALIZARTE</Text>
            <Text style={styles.title}>Historial de movimientos</Text>
            <Text style={styles.subtitle}>Acá podés revisar todos tus ingresos y gastos, y eliminar los que ya no correspondan.</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Todavía no hay movimientos</Text>
            <Text style={styles.emptyText}>Cuando registres ingresos o gastos, los vas a ver acá.</Text>
          </View>
        }
        renderItem={({ item }) => <TransactionItem item={item} onDelete={() => confirmDelete(item)} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18, paddingBottom: 32 },
  headerCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  eyebrow: { color: '#F0C040', fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginBottom: 8 },
  title: { color: COLORS.text, fontSize: 26, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: COLORS.muted, lineHeight: 20 },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 18,
  },
  emptyTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  emptyText: { color: COLORS.muted, lineHeight: 20 },
});
