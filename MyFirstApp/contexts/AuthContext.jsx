import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_API } from "../constants/constants.jsx";

const AuthContext = createContext({});

const storage = {
  setItem: async (key, value) => {
    if (await SecureStore.isAvailableAsync()) return SecureStore.setItemAsync(key, value);
    return AsyncStorage.setItem(key, value);
  },
  getItem: async (key) => {
    if (await SecureStore.isAvailableAsync()) return SecureStore.getItemAsync(key);
    return AsyncStorage.getItem(key);
  },
  deleteItem: async (key) => {
    if (await SecureStore.isAvailableAsync()) return SecureStore.deleteItemAsync(key);
    return AsyncStorage.removeItem(key);
  },
};

export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const token = await storage.getItem("userToken");
      const userData = await storage.getItem("userData");
      setUserToken(token);
      if (userData) setUser(JSON.parse(userData));
    } catch (error) {
      console.log("Error loading token:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token, refreshToken, userData) => {
    await storage.setItem("userToken", token);
    if (refreshToken) await storage.setItem("refreshToken", refreshToken);
    if (userData) {
      await storage.setItem("userData", JSON.stringify(userData));
      setUser(userData);
    }
    setUserToken(token);
  };

  const logout = async () => {
    await storage.deleteItem("userToken");
    await storage.deleteItem("refreshToken");
    await storage.deleteItem("userData");
    setUserToken(null);
    setUser(null);
  };

  const refreshTokenRequest = async () => {
    const refreshToken2 = await storage.getItem("refreshToken");
    if (!refreshToken2) throw new Error("No refresh token");

    const res = await fetch(`${BACKEND_API}/login/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshToken2 }),
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();
    await storage.setItem("userToken", data.token);
    setUserToken(data.token);
    return data.token;
  };

  const authFetch = async (url, options = {}) => {
    const token = await storage.getItem("userToken");
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    let res = await fetch(url, { ...options, headers });

    if (res.status === 401 || res.status === 403) {
      try {
        const newToken = await refreshTokenRequest();
        const retryHeaders = {
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`,
          "Content-Type": "application/json",
        };
        res = await fetch(url, { ...options, headers: retryHeaders });
      } catch {
        await logout();
      }
    }

    return res;
  };

  return (
    <AuthContext.Provider
      value={{ userToken, user, isLoading, login, logout, authFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
