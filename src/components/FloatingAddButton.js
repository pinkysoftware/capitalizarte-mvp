import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { C, R, S } from '../theme';

export default function FloatingAddButton({ bottom = 100 }) {
  const navigation = useNavigation();

  return (
    <Pressable
      style={[styles.fab, { bottom }]}
      onPress={() => navigation.navigate('AddTransactionVoice')}
      hitSlop={10}
    >
      <Text style={styles.fabIcon}>🎤</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: S.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 999,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  fabIcon: {
    fontSize: 26,
    textAlign: 'center',
  },
});