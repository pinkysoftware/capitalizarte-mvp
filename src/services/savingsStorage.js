import AsyncStorage from '@react-native-async-storage/async-storage';

const keyFor = (email) => `capitalizarte.savings.${email}`;

export async function loadSavings(email) {
  if (!email) return [];
  const raw = await AsyncStorage.getItem(keyFor(email));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveSavings(email, items) {
  if (!email) return;
  await AsyncStorage.setItem(keyFor(email), JSON.stringify(items || []));
}
