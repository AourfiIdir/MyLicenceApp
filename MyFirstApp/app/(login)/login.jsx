import { useState, useEffect } from "react";
import { useRouter, Link } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet, TextInput, Alert, ScrollView } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { API } from "../../constants/vars";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Google login
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "1016949109257-rt1g0cnoo5q3qilkl2ti10amjne7kp92.apps.googleusercontent.com", // Replace with your Google Web Client ID
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      await login(data.token, data.refreshToken,data.user);
      Alert.alert("Success", "Logged in");
    } catch (error) {
      Alert.alert("Login Failed", error.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/login/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google login failed");

      await login(data.token);
      Alert.alert("Success", "Logged in with Google!");
      router.replace("/");
    } catch (err) {
      Alert.alert("Google login error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Comic Header */}
      <View style={styles.header}>
        <View style={styles.comicBurst}>
          <Text style={styles.burstText}>LOGIN!</Text>
        </View>
        <Ionicons name="log-in-outline" size={60} color="#FFE66D" style={styles.headerIcon} />
        <Text style={styles.title}>WELCOME BACK</Text>
        <Text style={styles.subtitle}>HERO</Text>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>ENTER THE ARENA</Text>

        <View style={styles.inputWrapper}>
          <View style={styles.inputLabel}>
            <Ionicons name="person" size={16} color="#FF6B35" />
            <Text style={styles.inputLabelText}>USERNAME</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            editable={!loading}
          />
        </View>

        <View style={styles.inputWrapper}>
          <View style={styles.inputLabel}>
            <Ionicons name="lock-closed" size={16} color="#FF6B35" />
            <Text style={styles.inputLabelText}>PASSWORD</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "⚡ LOADING..." : "⚡ LOGIN NOW"}
          </Text>
        </TouchableOpacity>

        {/* Google Login Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#4285F4", marginTop: 10 }]}
          onPress={() => promptAsync()}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: "#FFF" }]}>
            ⚡ LOGIN WITH GOOGLE
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>NEW HERO? </Text>
        <Link href="/(login)/signin" asChild>
          <TouchableOpacity>
            <Text style={styles.signUpLinkText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingVertical: 40, paddingHorizontal: 20, backgroundColor: "#FFF8E1" },
  header: { backgroundColor: "#FF6B35", paddingVertical: 40, paddingHorizontal: 20, borderRadius: 15, borderWidth: 4, borderColor: "#000", marginBottom: 30, alignItems: "center", position: "relative", shadowColor: "#000", shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
  comicBurst: { position: "absolute", top: -20, right: -20, width: 80, height: 80, backgroundColor: "#FFE66D", transform: [{ rotate: "20deg" }], justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#000", borderRadius: 12 },
  burstText: { fontSize: 16, fontWeight: "black", color: "#000", transform: [{ rotate: "-20deg" }] },
  headerIcon: { marginBottom: 15 },
  title: { fontSize: 32, fontWeight: "black", color: "#FFF", textTransform: "uppercase", marginBottom: 5 },
  subtitle: { fontSize: 18, fontWeight: "bold", color: "#FFE66D" },
  formCard: { backgroundColor: "#FFF", borderRadius: 15, borderWidth: 4, borderColor: "#000", padding: 25, marginBottom: 25, shadowColor: "#000", shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
  formTitle: { fontSize: 20, fontWeight: "black", color: "#000", marginBottom: 20, backgroundColor: "#4ECDC4", paddingHorizontal: 15, paddingVertical: 8, alignSelf: "flex-start", borderWidth: 2, borderColor: "#000", transform: [{ rotate: "-1deg" }] },
  inputWrapper: { marginBottom: 18 },
  inputLabel: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  inputLabelText: { fontSize: 12, fontWeight: "black", color: "#FF6B35", marginLeft: 6, textTransform: "uppercase" },
  input: { width: "100%", borderWidth: 3, borderColor: "#000", padding: 14, borderRadius: 10, backgroundColor: "#FFF8E1", fontSize: 16, fontWeight: "500", color: "#000" },
  button: { width: "100%", backgroundColor: "#FF6B6B", paddingVertical: 16, borderRadius: 12, marginTop: 10, borderWidth: 4, borderColor: "#000", shadowColor: "#000", shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "black", textAlign: "center", textTransform: "uppercase" },
  signUpContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "#FFF", padding: 15, borderRadius: 12, borderWidth: 3, borderColor: "#000" },
  signUpText: { fontSize: 14, color: "#000", fontWeight: "bold" },
  signUpLinkText: { fontSize: 14, color: "#FF6B35", fontWeight: "black", textTransform: "uppercase" },
});
