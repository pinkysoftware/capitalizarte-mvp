import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
  surface: '#141820',
  surfaceSoft: '#1A1F2B',
  text: '#E8E8E8',
  muted: '#9A9FAA',
  border: 'rgba(212, 160, 23, 0.22)',
  green: '#2ECC40',
  amber: '#D4A017',
  red: '#E53935',
};

export default function FinancialBar({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const color = pct > 50 ? COLORS.green : pct >= 20 ? COLORS.amber : COLORS.red;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Salud financiera</Text>
        <Text style={[styles.value, { color }]}>{pct.toFixed(1)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.hint}>Mientras más alto sea el porcentaje, mejor equilibrio financiero.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 15,
  },
  value: {
    fontWeight: '800',
    fontSize: 16,
  },
  track: {
    height: 14,
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  hint: {
    marginTop: 10,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
  },
});
