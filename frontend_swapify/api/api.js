import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://192.168.1.107:8000/api/";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

async function getAccessToken() {
  return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

async function getRefreshToken() {
  return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

async function clearTokens() {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
}

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        await clearTokens();
        // Burada yönlendirme yapma, sadece token temizle
        return Promise.reject(error);
      }
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/accounts/token/refresh/",
          { refresh: refreshToken }
        );
        const newAccessToken = response.data.access;
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await clearTokens();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
