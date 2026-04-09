import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, S, R } from '../theme';

export default function FinancialBar({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const color = pct > 50 ? C.green : pct >= 20 ? C.primary : C.red;

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
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: S.md,
    borderWidth: 1,
    borderColor: C.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: S.sm,
  },
  label: {
    color: C.text,
    fontWeight: '700',
    fontSize: 15,
  },
  value: {
    fontWeight: '800',
    fontSize: 16,
  },
  track: {
    height: 14,
    backgroundColor: C.surfaceHover,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  hint: {
    marginTop: S.sm,
    color: C.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
});
