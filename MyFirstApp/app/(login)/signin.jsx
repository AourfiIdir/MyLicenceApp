import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

const API = "http://192.168.1.182:3000"; // ← your backend URL

const initialForm = {
  nom: "",
  prenom: "",
  email: "",
  password: "",
  sexe: "",
  wilaya: "",
  age: "",
  username: "",
};

export default function SignIn() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "verify"

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const isPasswordValid = (pwd) =>
    pwd.length >= 6 && /\d/.test(pwd) && /[A-Za-z]/.test(pwd);
  const isEmailValid = (email) => /^\S+@\S+\.\S+$/.test(email);

  const validateForm = () => {
    const required = ["nom", "prenom", "email", "password", "sexe", "wilaya", "username"];
    for (const k of required) if (!form[k]) return `${k} is required`;
    if (!isEmailValid(form.email)) return "Invalid email";
    if (!isPasswordValid(form.password)) return "Password must be ≥6 chars, include letters and numbers";
    if (form.age && Number(form.age) < 18) return "Age must be ≥18";
    if (!["male", "female"].includes(form.sexe)) return "Sexe must be male/female";
    return null;
  };

  const handleRequestOtp = async () => {
    const err = validateForm();
    if (err) return Alert.alert("Validation", err);

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send code");
      Alert.alert("Check email", "We sent a code to verify your account.");
      setStep("verify");
    } catch (e) {
      Alert.alert("Error", e.message || "Could not send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async () => {
    if (!otp) return Alert.alert("Validation", "Enter the code sent to your email");

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid code");
      Alert.alert("Success", "Account verified");
      // ✅ Redirect to login page (not tabs)
      router.push("/(login)/login");
    } catch (e) {
      Alert.alert("Error", e.message || "Invalid code");

    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend");
      Alert.alert("Sent", "New code sent to your email");
    } catch (e) {
      Alert.alert("Error", e.message || "Could not resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{step === "form" ? "Create Account" : "Verify Email"}</Text>

      {step === "form" ? (
        <>
          <TextInput style={styles.input} placeholder="Nom" value={form.nom} onChangeText={(v) => setField("nom", v)} />
          <TextInput style={styles.input} placeholder="Prenom" value={form.prenom} onChangeText={(v) => setField("prenom", v)} />
          <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={(v) => setField("email", v)} keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Password" value={form.password} onChangeText={(v) => setField("password", v)} secureTextEntry />
          <TextInput style={styles.input} placeholder="Sexe (male/female)" value={form.sexe} onChangeText={(v) => setField("sexe", v)} />
          <TextInput style={styles.input} placeholder="Wilaya" value={form.wilaya} onChangeText={(v) => setField("wilaya", v)} />
          <TextInput style={styles.input} placeholder="Age" value={form.age} onChangeText={(v) => setField("age", v)} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Username" value={form.username} onChangeText={(v) => setField("username", v)} />

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRequestOtp} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Submitting..." : "Send Code"}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.helper}>Enter the code sent to {form.email}</Text>
          <TextInput style={styles.input} placeholder="Verification code" value={otp} onChangeText={setOtp} keyboardType="number-pad" />
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleVerifyAndSignup} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify & Create Account"}</Text>
          </TouchableOpacity>

          {/* Resend OTP Button */}
          <TouchableOpacity style={styles.resendButton} onPress={handleResendOtp} disabled={loading}>
            <Text style={styles.resendText}>Didnt receive code? Resend</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.secondary} onPress={() => router.push("/(login)/login")}>
        <Text style={styles.secondaryText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", borderWidth: 1, borderColor: "#DDD", padding: 12, marginBottom: 12, borderRadius: 8, backgroundColor: "#FFF" },
  button: { width: "100%", backgroundColor: "#007AFF", paddingVertical: 12, borderRadius: 8, marginTop: 4 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "bold", textAlign: "center" },
  helper: { marginBottom: 12, color: "#444" },
  secondary: { marginTop: 16 },
  secondaryText: { color: "#007AFF", fontWeight: "600" },
  resendButton: { marginTop: 16 },
  resendText: { color: "#007AFF", fontSize: 14, fontWeight: "600", textAlign: "center" },
});