import { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { ActivityIndicator, View } from "react-native";

import * as SecureStore from "expo-secure-store";
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      // TODO: Check if user token exists in storage
      const userToken = await SecureStore.getItemAsync("userToken");
      if (userToken) {
        // Token found → User is logged in
        setIsLoggedIn(true);
      } else {
        // No token → User is not logged in
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.log("Error checking auth:", error);
      setIsLoggedIn(false);
    }
  };

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="(login)" options={{ headerShown: false }} />
        )}
      </Stack>
    </ThemeProvider>
  );
}