import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../../../contexts/AuthContext";
import Constants from "expo-constants";
import { BACKEND_API } from "../../../../constants/constants";

const API = BACKEND_API;

export default function CategoryQuiz() {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const { authFetch, userToken } = useAuth();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category) fetchCardByCategory();
  }, [category]);

  const fetchCardByCategory = async () => {
    try {
      setLoading(true);

      // Try two common endpoints
      let res = await authFetch(`${API}/card/category/${category}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        res = await authFetch(`${API}/card?category=${category}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        });
      }

      if (!res.ok) throw new Error("Failed to fetch quiz");

      const data = await res.json();
      const cardData = Array.isArray(data) ? data[0] : data;

      if (!cardData?._id) throw new Error("No quiz found");

      setCard(cardData);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    if (!card?._id) {
      Alert.alert("Error", "No quiz available");
      return;
    }
    router.push({
      pathname: "session",
      params: { cardId: card._id },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </SafeAreaView>
    );
  }

  if (!card) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>No quiz available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{card.name}</Text>
      <Text style={styles.desc}>{card.description}</Text>
      <Text style={styles.meta}>
        {card.content?.length || 0} Questions
      </Text>

      <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
        <Text style={styles.startText}>START QUIZ</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8E1", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  desc: { marginBottom: 8, color: "#444" },
  meta: { marginBottom: 20, fontWeight: "bold" },
  startButton: {
    backgroundColor: "#34C759",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  startText: { color: "#FFF", fontWeight: "bold" },
  errorText: { color: "#FF6B6B", fontWeight: "bold" },
});