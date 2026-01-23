import { useState } from "react";
import { useRouter, Link } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet, TextInput, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";

const API = "http://192.168.1.182:3000";

export default function Login() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      await SecureStore.setItemAsync("userToken", data.token);
      await SecureStore.setItemAsync("refreshToken", data.refreshToken);
      await SecureStore.setItemAsync("userEmail", email);

      Alert.alert("Success", "Logged in");
      router.replace("(tabs)");
    } catch (error) {
      Alert.alert("Login Failed", error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Dont have an account? </Text>
        <Link href="/(login)/signin" asChild>
          <TouchableOpacity>
            <Text style={styles.signUpLinkText}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  button: {
    width: "100%",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 14,
    color: "#666",
  },
  signUpLinkText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "bold",
  },
});