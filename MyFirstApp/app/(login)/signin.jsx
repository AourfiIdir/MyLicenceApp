import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
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
import {useAuth} from "../../contexts/AuthContext"
import { BACKEND_API } from "../../constants/constants";
WebBrowser.maybeCompleteAuthSession();

const API = BACKEND_API;
const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
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
  const { login } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "verify"

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // ======== Validation ========
  const isPasswordValid = (pwd) =>
    pwd.length >= 6 && /\d/.test(pwd) && /[A-Za-z]/.test(pwd);
  const isEmailValid = (email) => /^\S+@\S+\.\S+$/.test(email);

  const validateForm = () => {
    const required = [
      "nom",
      "prenom",
      "email",
      "password",
      "sexe",
      "wilaya",
      "username",
    ];
    for (const k of required) if (!form[k]) return `${k} est requis`;
    if (!isEmailValid(form.email)) return "Email invalide";
    if (!isPasswordValid(form.password))
      return "Le mot de passe doit faire ≥6 caractères, inclure des lettres et des chiffres";
    if (form.age && Number(form.age) < 18) return "L’âge doit être ≥18";
    if (!["male", "female"].includes(form.sexe)) return "Le sexe doit être male/female";
    return null;
  };

  // ======== OTP HANDLERS ========
  const handleRequestOtp = async () => {
    const err = validateForm();
    if (err) return Alert.alert("Validation", err);

    setLoading(true);
    try {
      const res = await fetch(`${API}/signin/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Échec de l’envoi du code");
      Alert.alert("Vérifiez votre email", "Nous avons envoyé un code pour vérifier votre compte.");
      setStep("verify");
    } catch (e) {
      Alert.alert("Erreur", e.message || "Impossible d’envoyer le code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async () => {
    if (!otp) return Alert.alert("Validation", "Saisissez le code envoyé par email");

    setLoading(true);
    try {
      const res = await fetch(`${API}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Code invalide");

      Alert.alert("Succès", "Compte vérifié");
      router.push("/(login)/login");
    } catch (e) {
      Alert.alert("Erreur", e.message || "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/signin/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Échec du renvoi");
      Alert.alert("Envoyé", "Nouveau code envoyé à votre email");
    } catch (e) {
      Alert.alert("Erreur", e.message || "Impossible de renvoyer le code");
    } finally {
      setLoading(false);
    }
  };

  // ======== GOOGLE LOGIN ========
  const redirectUri = AuthSession.makeRedirectUri();

  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientId,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleLogin(id_token, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const handleGoogleLogin = async (idToken, isSignup = false) => {
  setLoading(true);
  try {
    const res = await fetch(`${API}/signin/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, isSignup }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Connexion Google échouée");

    // Save token in AuthContext
    await login(data.token,data.refreshToken ,data.user);
    console.log("Google login success:", data.user);

    Alert.alert("Succès", isSignup ? "Inscription avec Google réussie !" : "Connexion avec Google réussie !");
    router.replace("/(tabs)");
  } catch (err) {
    Alert.alert("Erreur de connexion Google", err.message);
  } finally {
    setLoading(false);
  }
};


  // ======== RENDER ========
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.comicBurst}>
          <Text style={styles.burstText}>{step === "form" ? "INSCRIPTION !" : "VÉRIFIER !"}</Text>
        </View>
        <Ionicons name={step === "form" ? "person-add" : "mail-unread"} size={60} color="#FFE66D" style={styles.headerIcon} />
        <Text style={styles.title}>{step === "form" ? "CRÉER UN COMPTE" : "VÉRIFIER L’EMAIL"}</Text>
        <Text style={styles.subtitle}>{step === "form" ? "REJOINS LA QUÊTE" : "CONFIRME LE CODE"}</Text>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        {step === "form" ? (
          <>
            <Text style={styles.formTitle}>INFOS DU HÉROS</Text>

            {/* FIRST NAME (prenom) */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputLabel}>
                <Ionicons name="person" size={16} color="#FF6B35" />
                <Text style={styles.inputLabelText}>PRÉNOM</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Prénom"
                value={form.prenom}
                onChangeText={(v) => setField("prenom", v)}
                placeholderTextColor="#999"
              />
            </View>

            {/* LAST NAME (nom) */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputLabel}>
                <Ionicons name="person" size={16} color="#FF6B35" />
                <Text style={styles.inputLabelText}>NOM</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nom"
                value={form.nom}
                onChangeText={(v) => setField("nom", v)}
                placeholderTextColor="#999"
              />
            </View>

            {/* USERNAME */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputLabel}>
                <Ionicons name="at" size={16} color="#FF6B35" />
                <Text style={styles.inputLabelText}>NOM D’UTILISATEUR</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nom d’utilisateur"
                value={form.username}
                onChangeText={(v) => setField("username", v)}
                placeholderTextColor="#999"
              />
            </View>

            {/* EMAIL */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputLabel}>
                <Ionicons name="mail" size={16} color="#FF6B35" />
                <Text style={styles.inputLabelText}>EMAIL</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={form.email}
                onChangeText={(v) => setField("email", v)}
                keyboardType="email-address"
                placeholderTextColor="#999"
              />
            </View>

            {/* PASSWORD */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputLabel}>
                <Ionicons name="lock-closed" size={16} color="#FF6B35" />
                <Text style={styles.inputLabelText}>MOT DE PASSE</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Mot de passe (6+ caractères, lettres & chiffres)"
                value={form.password}
                onChangeText={(v) => setField("password", v)}
                secureTextEntry
                placeholderTextColor="#999"
              />
            </View>

            {/* GENDER & AGE */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                <View style={styles.inputLabel}>
                  <Ionicons name="person-circle" size={16} color="#FF6B35" />
                  <Text style={styles.inputLabelText}>SEXE</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="male/female"
                  value={form.sexe}
                  onChangeText={(v) => setField("sexe", v)}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <View style={styles.inputLabel}>
                  <Ionicons name="calendar" size={16} color="#FF6B35" />
                  <Text style={styles.inputLabelText}>ÂGE</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Âge"
                  value={form.age}
                  onChangeText={(v) => setField("age", v)}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* WILAYA */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputLabel}>
                <Ionicons name="location" size={16} color="#FF6B35" />
                <Text style={styles.inputLabelText}>WILAYA</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Wilaya"
                value={form.wilaya}
                onChangeText={(v) => setField("wilaya", v)}
                placeholderTextColor="#999"
              />
            </View>

            {/* GOOGLE LOGIN */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#4285F4", marginTop: 10 }]}
              onPress={() => promptAsync()}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: "#FFF" }]}>
                ⚡ SE CONNECTER AVEC GOOGLE
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.formTitle}>VÉRIFICATION EMAIL</Text>
            <Text style={styles.verifyHelper}>
              ✉️ Saisissez le code envoyé à
              <Text style={styles.emailHighlight}> {form.email}</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputLabel}>
                <Ionicons name="key" size={16} color="#FF6B35" />
                <Text style={styles.inputLabelText}>CODE DE VÉRIFICATION</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="000000"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                placeholderTextColor="#999"
                maxLength={6}
              />
            </View>
          </>
        )}

        {/* MAIN BUTTON */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={step === "form" ? handleRequestOtp : handleVerifyAndSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? step === "form"
                ? "⚡ ENVOI..."
                : "⚡ VÉRIFICATION..."
              : step === "form"
              ? "⚡ ENVOYER LE CODE"
              : "⚡ CRÉER LE COMPTE"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Resend OTP */}
      {step === "verify" && (
        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendOtp}
          disabled={loading}
        >
          <Text style={styles.resendText}>📬 PAS REÇU ? RENVOYER LE CODE</Text>
        </TouchableOpacity>
      )}

      {/* Login Link */}
      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => router.push("/(login)/login")}
      >
        <Text style={styles.loginLinkText}>DÉJÀ UN HÉROS ? SE CONNECTER</Text>
      </TouchableOpacity>
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
  formCard: { backgroundColor: "#FFF", borderRadius: 15, borderWidth: 4, borderColor: "#000", padding: 25, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
  formTitle: { fontSize: 20, fontWeight: "black", color: "#000", marginBottom: 20, backgroundColor: "#4ECDC4", paddingHorizontal: 15, paddingVertical: 8, alignSelf: "flex-start", borderWidth: 2, borderColor: "#000", transform: [{ rotate: "-1deg" }] },
  verifyHelper: { fontSize: 14, color: "#000", fontWeight: "600", marginBottom: 15, backgroundColor: "#FFE66D", padding: 12, borderRadius: 8, borderWidth: 2, borderColor: "#000" },
  emailHighlight: { fontWeight: "black", color: "#FF6B35" },
  inputWrapper: { marginBottom: 16 },
  rowInputs: { flexDirection: "row", marginBottom: 4 },
  inputLabel: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  inputLabelText: { fontSize: 12, fontWeight: "black", color: "#FF6B35", marginLeft: 6, textTransform: "uppercase" },
  input: { width: "100%", borderWidth: 3, borderColor: "#000", padding: 14, borderRadius: 10, backgroundColor: "#FFF8E1", fontSize: 16, fontWeight: "500", color: "#000" },
  button: { width: "100%", backgroundColor: "#FF6B6B", paddingVertical: 16, borderRadius: 12, marginTop: 10, borderWidth: 4, borderColor: "#000", shadowColor: "#000", shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#FFF", fontSize: 18, fontWeight: "black", textAlign: "center", textTransform: "uppercase" },
  resendButton: { backgroundColor: "#FFF", padding: 15, borderRadius: 12, borderWidth: 3, borderColor: "#000", marginBottom: 20 },
  resendText: { color: "#FF6B35", fontSize: 14, fontWeight: "black", textAlign: "center", textTransform: "uppercase" },
  loginLink: { backgroundColor: "#4ECDC4", padding: 15, borderRadius: 12, borderWidth: 3, borderColor: "#000" },
  loginLinkText: { color: "#000", fontSize: 14, fontWeight: "black", textAlign: "center", textTransform: "uppercase" },
});
