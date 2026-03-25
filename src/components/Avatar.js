import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';

const COLORS = {
  surface: '#141820',
  surfaceSoft: '#1A1F2B',
  primary: '#D4A017',
  text: '#E8E8E8',
  muted: '#9A9FAA',
  border: 'rgba(212, 160, 23, 0.22)',
};

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
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badge: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sub: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 13,
  },
});
