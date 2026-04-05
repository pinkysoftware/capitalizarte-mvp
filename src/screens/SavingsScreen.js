import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { api } from '../services/api';
import { loadSavings, saveSavings } from '../services/savingsStorage';

const COLORS = {
  background: '#0D0F14',
  surface: '#141820',
  surfaceSoft: '#1A1F2B',
  text: '#E8E8E8',
  muted: '#9A9FAA',
  border: 'rgba(212, 160, 23, 0.22)',
  primary: '#D4A017',
  green: '#2ECC40',
  red: '#E53935',
};

const TYPES = ['efectivo', 'caja_ahorro', 'usd', 'fondo_emergencia', 'otro'];

export default function SavingsScreen() {
  const [email, setEmail] = useState('');
  const [items, setItems] = useState([]);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('efectivo');
  const [moneda, setMoneda] = useState('ARS');
  const [monto, setMonto] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getProfile();
        const userEmail = res.user?.email || '';
        setEmail(userEmail);
        setItems(await loadSavings(userEmail));
      } catch (e) {
        Alert.alert('No pudimos cargar ahorros', e.message);
      }
    })();
  }, []);

  const total = useMemo(() => items.reduce((acc, item) => acc + Number(item.monto || 0), 0), [items]);

  const addSaving = async () => {
    if (!nombre.trim()) return Alert.alert('Falta nombre', 'Poné un nombre para este ahorro.');
    if (Number(monto || 0) <= 0) return Alert.alert('Monto inválido', 'Ingresá un monto mayor a cero.');
    if (!moneda.trim()) return Alert.alert('Falta moneda', 'Ingresá una moneda válida.');

    setSaving(true);
    try {
      const next = [
        {
          id: String(Date.now()),
          nombre: nombre.trim(),
          tipo,
          moneda: moneda.trim().toUpperCase() || 'ARS',
          monto: Number(monto),
        },
        ...items,
      ];
      setItems(next);
      await saveSavings(email, next);
      setNombre('');
      setTipo('efectivo');
      setMoneda('ARS');
      setMonto('');
    } finally {
      setSaving(false);
    }
  };

  const removeSaving = async (id) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    await saveSavings(email, next);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>CAPITALIZARTE</Text>
        <Text style={styles.title}>Ahorros</Text>
        <Text style={styles.subtitle}>Acá empezamos a construir tu patrimonio acumulado con reservas manuales por tipo y moneda.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total acumulado</Text>
        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        <Text style={styles.cardText}>Más adelante esto se va a combinar con inversiones y alimentar tu vida acumulada.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nuevo ahorro</Text>
        <TextInput value={nombre} onChangeText={setNombre} placeholder="Nombre" placeholderTextColor={COLORS.muted} style={styles.input} />
        <View style={styles.chipsRow}>
          {TYPES.map((item) => {
            const active = tipo === item;
            return (
              <Pressable key={item} onPress={() => setTipo(item)} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput value={moneda} onChangeText={setMoneda} placeholder="Moneda" placeholderTextColor={COLORS.muted} style={styles.input} />
        <TextInput value={monto} onChangeText={setMonto} placeholder="Monto" placeholderTextColor={COLORS.muted} keyboardType="numeric" style={styles.input} />
        <Pressable style={[styles.primaryButton, saving && { opacity: 0.7 }]} onPress={addSaving} disabled={saving}>
          {saving ? <ActivityIndicator color="#111111" /> : <Text style={styles.primaryButtonText}>Agregar ahorro</Text>}
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tus reservas</Text>
        {items.length ? items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.nombre}</Text>
              <Text style={styles.itemMeta}>{item.tipo} · {item.moneda}</Text>
            </View>
            <Text style={styles.itemAmount}>${Number(item.monto || 0).toFixed(2)}</Text>
            <Pressable onPress={() => removeSaving(item.id)}>
              <Text style={styles.removeText}>Quitar</Text>
            </Pressable>
          </View>
        )) : <Text style={styles.cardText}>Todavía no cargaste ahorros.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 36, gap: 16 },
  heroCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 24, padding: 22 },
  eyebrow: { color: COLORS.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginBottom: 8 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: COLORS.muted, lineHeight: 21 },
  card: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 18, gap: 12 },
  cardTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  cardText: { color: COLORS.muted, lineHeight: 20 },
  totalValue: { color: COLORS.primary, fontSize: 30, fontWeight: '800' },
  input: { backgroundColor: COLORS.surfaceSoft, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: COLORS.text },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: COLORS.surfaceSoft, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  chipActive: { backgroundColor: 'rgba(212, 160, 23, 0.16)', borderColor: COLORS.primary },
  chipText: { color: COLORS.muted, fontWeight: '600' },
  chipTextActive: { color: COLORS.primary },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#111111', fontWeight: '800' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surfaceSoft, borderRadius: 14, padding: 12 },
  itemName: { color: COLORS.text, fontWeight: '700' },
  itemMeta: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  itemAmount: { color: COLORS.green, fontWeight: '800' },
  removeText: { color: COLORS.red, fontWeight: '700' },
});
