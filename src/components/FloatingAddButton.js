import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { C, R, S } from '../theme';

export default function FloatingAddButton({ bottom = 100 }) {
  const navigation = useNavigation();

  return (
    <Pressable
      style={[styles.fab, { bottom }]}
      onPress={() => navigation.navigate('AddTransaction')}
      hitSlop={10}
    >
      <Text style={styles.fabText}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: S.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 999,
  },
  fabText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#000',
    marginTop: -2,
  },
});