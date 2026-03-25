import AsyncStorage from '@react-native-async-storage/async-storage';

const photoKey = (email) => `capitalizarte.profilePhoto.${email}`;

export async function getStoredProfilePhoto(email) {
  if (!email) return null;
  return AsyncStorage.getItem(photoKey(email));
}

export async function setStoredProfilePhoto(email, uri) {
  if (!email) return;
  if (uri) {
    await AsyncStorage.setItem(photoKey(email), uri);
  } else {
    await AsyncStorage.removeItem(photoKey(email));
  }
}
