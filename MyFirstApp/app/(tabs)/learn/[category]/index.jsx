import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../../contexts/AuthContext"
import { useFocusEffect } from "@react-navigation/native";

import { Ionicons } from "@expo/vector-icons";
const API = "http://localhost:3000";

export default function CategoryCards() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const { userToken, userId, authFetch } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedCards, setCompletedCards] = useState({});

  // Initial fetch on mount
  useEffect(() => {
    fetchCards();
  }, [category]);

  // Refetch when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchCards();
    }, [category, userToken])
  );

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API}/usertocard/user/${category}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        // Extract cards and status from the response structure
        const cardsData = data.map(item => ({
          ...item.cardId,
          progressId: item._id,
          status: item.status
        }));
        setCards(cardsData);
        
        // Extract completion status from the cards
        const statusMap = {};
        data.forEach((item) => {
          if (item.cardId && item.cardId._id) {
            statusMap[item.cardId._id] = item.status;
          }
        });
        setCompletedCards(statusMap);
      } else {
        setCards([]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load cards");
      console.error(error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  // ...existing code...

  const handleCardPress = (cardId) => {
    router.push(`/learn/${category}/${cardId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  const completedCount = Object.values(completedCards).filter(
    (status) => status === "completed"
  ).length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{category}</Text>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{completedCount}/{cards.length}</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${cards.length > 0 ? (completedCount / cards.length) * 100 : 0}%` },
          ]}
        />
      </View>

      {cards.map((card, index) => (
        <TouchableOpacity
          key={card._id}
          style={[
            styles.cardItem,
            completedCards[card._id] === "completed" && styles.cardCompleted,
          ]}
          onPress={() => handleCardPress(card._id)}
        >
          <View style={styles.cardNumber}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardName} numberOfLines={1}>
              {card.name}
            </Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {card.description}
            </Text>
          </View>

          {completedCards[card._id] === "completed" ? (
            <View style={styles.completeBadge}>
              <Ionicons name="checkmark-circle" size={28} color="#34C759" />
            </View>
          ) : (
            <View style={styles.arrowBadge}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

// ...existing code...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
  },
  header: {
    backgroundColor: "#FF6B35",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 5,
    borderBottomColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "black",
    color: "#000",
    flex: 1,
    marginLeft: 15,
  },
  progressBadge: {
    backgroundColor: "#FFE66D",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "black",
    color: "#000",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#34C759",
  },
  cardItem: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardCompleted: {
    backgroundColor: "#E8F5E9",
    borderColor: "#34C759",
  },
  cardNumber: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
    marginRight: 12,
  },
  numberText: {
    fontSize: 20,
    fontWeight: "black",
    color: "#FFF",
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: "#666",
  },
  completeBadge: {
    marginLeft: 10,
  },
  arrowBadge: {
    width: 35,
    height: 35,
    borderRadius: 17,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  arrowText: {
    fontSize: 18,
    fontWeight: "black",
    color: "#FFF",
  },
  spacer: {
    height: 30,
  },
});