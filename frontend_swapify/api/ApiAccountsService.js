import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Tokenları AsyncStorage'a kaydet
async function saveTokens(access, refresh) {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, access);
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

// Tokenları temizle
async function clearTokens() {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Tokenları getir
export async function getAccessToken() {
  return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}
export async function getRefreshToken() {
  return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

// Giriş
export async function login(username, password) {
  try {
    const response = await api.post("accounts/token/", { username, password });
    const { access, refresh } = response.data;
    await saveTokens(access, refresh);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Çıkış
export async function logout() {
  await clearTokens();
}

// Kayıt
export async function register(userData) {
  try {
    const response = await api.post("accounts/register/", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// 🔍 Kendi profilini getir
export async function getMyProfile() {
  try {
    const response = await api.get("accounts/me/");
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ✏️ Kendi profilini güncelle (FormData ile)
export async function updateMyProfile(data, imageUri) {
  if (imageUri && imageUri.startsWith("file://")) {
    // Multipart form data
    let formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value);
    });

    // Resim dosyasını ekleme
    const filename = imageUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image";

    formData.append("profile_image", {
      uri: imageUri,
      name: filename,
      type,
    });

    const response = await api.put("accounts/me/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } else {
    // Sadece JSON verisi gönder
    const response = await api.put("accounts/me/", data);
    return response.data;
  }
}

// 👤 Başka bir kullanıcının profilini getir
export async function getPublicProfile(username) {
  try {
    const response = await api.get(`accounts/user/${username}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// pp degistirme
export async function updateProfileImage(imageUri) {
  const formData = new FormData();
  const filename = imageUri.split("/").pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;

  formData.append("profile_image", {
    uri: imageUri,
    name: filename,
    type,
  });

  try {
    const response = await api.patch("accounts/me/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
