import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { colors } from "../constants/styles";

export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

export function ErrorDisplay({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorEmoji}>⚠️</Text>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <Text style={styles.retryText} onPress={onRetry}>
          Tap to retry
        </Text>
      )}
    </View>
  );
}

export function EmptyState({ message = "No data available" }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
    fontWeight: "600",
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  retryText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "black",
    textTransform: "uppercase",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: "600",
    textAlign: "center",
  },
});
