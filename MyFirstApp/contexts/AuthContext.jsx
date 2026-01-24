import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const token = await storage.getItem("userToken");
      setUserToken(token);
    } catch (error) {
      console.log("Error loading token:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token, refreshToken) => {
    await storage.setItem("userToken", token);
    if (refreshToken) await storage.setItem("refreshToken", refreshToken);
    setUserToken(token);
  };

  const logout = async () => {
    await storage.deleteItem("userToken");
    await storage.deleteItem("refreshToken");
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);