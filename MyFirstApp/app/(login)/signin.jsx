import { useState } from "react";
import { useRouter } from "expo-router";
import {API } from "../../constants/vars";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Comic Header */}
      <View style={styles.header}>
        <View style={styles.comicBurst}>
          <Text style={styles.burstText}>SIGNUP!</Text>
        </View>
        <Ionicons name={step === "form" ? "person-add" : "mail-unread"} size={60} color="#FFE66D" style={styles.headerIcon} />
        <Text style={styles.title}>{step === "form" ? "CREATE ACCOUNT" : "VERIFY EMAIL"}</Text>
        <Text style={styles.subtitle}>{step === "form" ? "JOIN THE QUEST" : "CONFIRM CODE"}</Text>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        {step === "form" ? (
          <>
            <Text style={styles.formTitle}>HERO DETAILS</Text>
            
            <View style={styles.inputWrapper}>
              <View style={styles.inputLabel}>
                <Ionicons name="person" size={16} color="#FF6B35" />
                <Text style={styles.inputLabelText}>FIRST NAME</Text>
              </View>
              <TextInput style={styles.input} placeholder="Nom" value={form.nom} onChangeText={(v) => setField("nom", v)} placeholderTextColor="#999" />
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputLabel}>
                <Ionicons name="person" size={16} color="#FF6B35" />
                <Text style={styles.inputLabelText}>LAST NAME</Text>
              </View>
              <TextInput style={styles.input} placeholder="Prenom" value={form.prenom} onChangeText={(v) => setField("prenom", v)} placeholderTextColor="#999" />
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputLabel}>
                <Ionicons name="at" size={16} color="#FF6B35" />
                <Text style={styles.inputLabelText}>USERNAME</Text>
              </View>
              <TextInput style={styles.input} placeholder="Username" value={form.username} onChangeText={(v) => setField("username", v)} placeholderTextColor="#999" />
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputLabel}>
                <Ionicons name="mail" size={16} color="#FF6B35" />
                <Text style={styles.inputLabelText}>EMAIL</Text>
              </View>
              <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={(v) => setField("email", v)} keyboardType="email-address" placeholderTextColor="#999" />
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputLabel}>
                <Ionicons name="lock-closed" size={16} color="#FF6B35" />
                <Text style={styles.inputLabelText}>PASSWORD</Text>
              </View>
              <TextInput style={styles.input} placeholder="Password (6+ chars, letters & numbers)" value={form.password} onChangeText={(v) => setField("password", v)} secureTextEntry placeholderTextColor="#999" />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                <View style={styles.inputLabel}>
                  <Ionicons name="person-circle" size={16} color="#FF6B35" />
                  <Text style={styles.inputLabelText}>GENDER</Text>
                </View>
                <TextInput style={styles.input} placeholder="male/female" value={form.sexe} onChangeText={(v) => setField("sexe", v)} placeholderTextColor="#999" />
              </View>

              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <View style={styles.inputLabel}>
                  <Ionicons name="calendar" size={16} color="#FF6B35" />
                  <Text style={styles.inputLabelText}>AGE</Text>
                </View>
                <TextInput style={styles.input} placeholder="Age" value={form.age} onChangeText={(v) => setField("age", v)} keyboardType="numeric" placeholderTextColor="#999" />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.inputLabel}>
                <Ionicons name="location" size={16} color="#FF6B35" />
                <Text style={styles.inputLabelText}>WILAYA</Text>
              </View>
              <TextInput style={styles.input} placeholder="Wilaya" value={form.wilaya} onChangeText={(v) => setField("wilaya", v)} placeholderTextColor="#999" />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.formTitle}>EMAIL VERIFICATION</Text>
            <Text style={styles.verifyHelper}>✉️ Enter the code sent to<Text style={styles.emailHighlight}> {form.email}</Text></Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputLabel}>
                <Ionicons name="key" size={16} color="#FF6B35" />
                <Text style={styles.inputLabelText}>VERIFICATION CODE</Text>
              </View>
              <TextInput style={styles.input} placeholder="000000" value={otp} onChangeText={setOtp} keyboardType="number-pad" placeholderTextColor="#999" maxLength={6} />
            </View>
          </>
        )}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={step === "form" ? handleRequestOtp : handleVerifyAndSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? (step === "form" ? "⚡ SENDING..." : "⚡ VERIFYING...") : (step === "form" ? "⚡ SEND CODE" : "⚡ CREATE ACCOUNT")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Resend OTP - Only on verify step */}
      {step === "verify" && (
        <TouchableOpacity style={styles.resendButton} onPress={handleResendOtp} disabled={loading}>
          <Text style={styles.resendText}>📬 DIDNT RECEIVE? RESEND CODE</Text>
        </TouchableOpacity>
      )}

      {/* Login Link */}
      <TouchableOpacity style={styles.loginLink} onPress={() => router.push("/(login)/login")}>
        <Text style={styles.loginLinkText}>ALREADY A HERO? LOGIN</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#FFF8E1",
  },
  header: {
    backgroundColor: "#FF6B35",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: "#000",
    marginBottom: 30,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  comicBurst: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    backgroundColor: "#FFE66D",
    transform: [{ rotate: "20deg" }],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 12,
  },
  burstText: {
    fontSize: 16,
    fontWeight: "black",
    color: "#000",
    transform: [{ rotate: "-20deg" }],
  },
  headerIcon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: "black",
    color: "#FFF",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFE66D",
  },
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    borderWidth: 4,
    borderColor: "#000",
    padding: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "black",
    color: "#000",
    marginBottom: 20,
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: "#000",
    transform: [{ rotate: "-1deg" }],
  },
  verifyHelper: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
    marginBottom: 15,
    backgroundColor: "#FFE66D",
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000",
  },
  emailHighlight: {
    fontWeight: "black",
    color: "#FF6B35",
  },
  inputWrapper: {
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: "row",
    marginBottom: 4,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabelText: {
    fontSize: 12,
    fontWeight: "black",
    color: "#FF6B35",
    marginLeft: 6,
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    borderWidth: 3,
    borderColor: "#000",
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#FFF8E1",
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  button: {
    width: "100%",
    backgroundColor: "#FF6B6B",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 4,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "black",
    textAlign: "center",
    textTransform: "uppercase",
  },
  resendButton: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#000",
    marginBottom: 20,
  },
  resendText: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "black",
    textAlign: "center",
    textTransform: "uppercase",
  },
  loginLink: {
    backgroundColor: "#4ECDC4",
    padding: 15,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#000",
  },
  loginLinkText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "black",
    textAlign: "center",
    textTransform: "uppercase",
  },
});