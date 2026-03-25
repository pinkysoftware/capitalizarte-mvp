import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Pressable } from 'react-native';

const COLORS = {
  surface: '#141820',
  text: '#E8E8E8',
  muted: '#9A9FAA',
  green: '#2ECC40',
  red: '#E53935',
  border: 'rgba(255,255,255,0.06)',
};

export default function TransactionItem({ item, onDelete }) {
  const isIn = item.tipo === 'INGRESO';
  const color = isIn ? COLORS.green : COLORS.red;
  const sign = isIn ? '+ ' : '- ';
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: (_, gesture) => {
          if (gesture.dx < 0) {
            translateX.setValue(Math.max(gesture.dx, -92));
          }
        },
        onPanResponderRelease: (_, gesture) => {
          const open = gesture.dx < -60;
          Animated.spring(translateX, {
            toValue: open ? -92 : 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        },
      }),
    [translateX]
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.deleteActionWrap}>
        <Pressable style={styles.deleteAction} onPress={onDelete}>
          <Text style={styles.deleteText}>Eliminar</Text>
        </Pressable>
      </View>

      <Animated.View style={[styles.card, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <View style={styles.row}>
          <Text style={styles.category}>{item.categoria || 'Sin categoría'}</Text>
          <Text style={[styles.amount, { color }]}>{sign}${Number(item.monto || 0).toFixed(2)}</Text>
        </View>
        <Text style={styles.desc}>{item.descripcion || 'Sin descripción'}</Text>
        <Text style={styles.date}>{item.fecha || ''}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  deleteActionWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: COLORS.red,
    borderRadius: 16,
  },
  deleteAction: {
    width: 92,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  category: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 15,
  },
  amount: {
    fontWeight: '800',
    fontSize: 15,
  },
  desc: {
    color: COLORS.muted,
    marginBottom: 6,
  },
  date: {
    color: COLORS.muted,
    fontSize: 12,
  },
});
