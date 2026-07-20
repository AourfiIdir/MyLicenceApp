module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-web|react-native-worklets|@react-native-async-storage/async-storage|expo-secure-store|expo-auth-session|expo-crypto|expo-web-browser|@expo/vector-icons|expo-constants|expo-font|expo-haptics|expo-image|expo-linear-gradient|expo-linking|expo-splash-screen|expo-status-bar|expo-symbols|expo-system-ui)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/__tests__/**/*.test.js", "**/__tests__/**/*.test.jsx"],
};
