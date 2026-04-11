import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_EMAIL_KEY = 'capitalizarte.userEmail';

export async function getUserEmail() {
  return await AsyncStorage.getItem(USER_EMAIL_KEY);
}

export async function saveUserEmail(email) {
  if (email) {
    await AsyncStorage.setItem(USER_EMAIL_KEY, email);
  }
}
