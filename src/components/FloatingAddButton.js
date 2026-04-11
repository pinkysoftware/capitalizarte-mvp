import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { C, R, S } from '../theme';

export default function FloatingAddButton({ bottom = 100 }) {
  const navigation = useNavigation();

  return (
    <Pressable
      style={[styles.fab, { bottom }]}
      onPress={() => navigation.navigate('Chat')}
      hitSlop={12}
    >
      {/* AI Core glow effect */}
      <View style={styles.glowOuter}>
        <View style={styles.glowInner}>
          <Text style={styles.fabIcon}>🤖</Text>
        </View>
      </View>
      {/* Pulse ring */}
      <View style={styles.pulseRing} />
      <View style={styles.pulseRing2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: S.lg,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  glowOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212, 160, 23, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4A017',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  glowInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  fabIcon: {
    fontSize: 26,
    textAlign: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(212, 160, 23, 0.4)',
    top: 0,
  },
  pulseRing2: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.2)',
    top: -4,
  },
});