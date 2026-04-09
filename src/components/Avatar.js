import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { C, R } from '../theme';

const AVATARS = { '1': '🧑‍💼', '2': '🧑‍🎓', '3': '🧑‍🚀', '4': '🧑‍🔧', '5': '🧑‍💻' };

export default function Avatar({ avatarId = '1', apodo = 'Capitalizador', photoUri = null, onPress }) {
  const emoji = AVATARS[String(avatarId)] || '🧑';

  const content = (
    <View style={styles.card}>
      <View style={styles.badge}>
        {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : <Text style={styles.emoji}>{emoji}</Text>}
      </View>
      <Text style={styles.name}>{apodo || 'Capitalizador'}</Text>
      <Text style={styles.sub}>Tu panel principal</Text>
    </View>
  );

  if (onPress) return <Pressable onPress={onPress}>{content}</Pressable>;
  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  badge: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: C.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    fontSize: 42,
  },
  name: {
    color: C.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sub: {
    marginTop: 4,
    color: C.textSecondary,
    fontSize: 13,
  },
});
