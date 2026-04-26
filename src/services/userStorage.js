import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_EMAIL_KEY = 'capitalizarte.userEmail';
const USER_PROFILE_KEY = 'capitalizarte.userProfile';

export async function getUserEmail() {
  return await AsyncStorage.getItem(USER_EMAIL_KEY);
}

export async function saveUserEmail(email) {
  if (email) {
    await AsyncStorage.setItem(USER_EMAIL_KEY, email);
  }
}

export async function getUserProfile() {
  const raw = await AsyncStorage.getItem(USER_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveUserProfile(profile) {
  if (profile) {
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  }
}
