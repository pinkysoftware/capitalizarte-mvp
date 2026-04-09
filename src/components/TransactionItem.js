import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Pressable } from 'react-native';
import { C, S, R } from '../theme';

export default function TransactionItem({ item, onDelete }) {
  const isIn = item.tipo === 'INGRESO';
  const color = isIn ? C.green : C.red;
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
    marginBottom: S.sm,
    borderRadius: R.md,
    overflow: 'hidden',
  },
  deleteActionWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: C.red,
    borderRadius: R.md,
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
    backgroundColor: C.surface,
    borderRadius: R.md,
    padding: S.md,
    borderWidth: 1,
    borderColor: C.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  category: {
    color: C.text,
    fontWeight: '700',
    fontSize: 15,
  },
  amount: {
    fontWeight: '800',
    fontSize: 15,
  },
  desc: {
    color: C.textSecondary,
    marginBottom: 6,
  },
  date: {
    color: C.textSecondary,
    fontSize: 12,
  },
});
