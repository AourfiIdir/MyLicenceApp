import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Text,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import Card from "../../../../Components/Card";

const API = Constants.expoConfig?.extra?.API || "http://localhost:3000";

export default function CardDetail() {
  const router = useRouter();
  const { cardId, category } = useLocalSearchParams();
  const { userToken } = useAuth();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchCard();
  }, [cardId]);

  const fetchCard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/card/${cardId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setCard(data);
      checkCompletionStatus(data._id);
    } catch (error) {
      Alert.alert("Error", "Failed to load card");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkCompletionStatus = async (cardId) => {
    try {
      const res = await fetch(`${API}/usertocard/status/${cardId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setIsCompleted(data.status === "completed");
    } catch (error) {
      console.error("Error checking completion:", error);
    }
  };

  const markAsComplete = async () => {
    try {
      setMarking(true);
      const res = await fetch(`${API}/usertocard/complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId: card._id,
          status: isCompleted ? "uncomplete" : "completed",
        }),
      });

      if (!res.ok) throw new Error("Failed to update completion status");

      setIsCompleted(!isCompleted);
      Alert.alert(
        "Success",
        isCompleted ? "Card marked as incomplete" : "Card marked as complete! 🎉"
      );
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to mark card");
      console.error(error);
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!card) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Card not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {card.name}
          </Text>
          {isCompleted && (
            <View style={styles.completeIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            </View>
          )}
        </View>

        <View style={styles.cardContainer}>
          <Card
            name={card.name}
            description={card.description}
            category={card.category}
            content={card.content}
            type="learning"
          />
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Mark Complete Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.markButton,
            isCompleted && styles.markButtonCompleted,
          ]}
          onPress={markAsComplete}
          disabled={marking}
        >
          {marking ? (
            <ActivityIndicator color={isCompleted ? "#000" : "#FFF"} />
          ) : (
            <>
              <Ionicons
                name={isCompleted ? "checkmark" : "checkmark-outline"}
                size={24}
                color={isCompleted ? "#000" : "#FFF"}
              />
              <Text
                style={[
                  styles.buttonText,
                  isCompleted && styles.buttonTextCompleted,
                ]}
              >
                {isCompleted ? "MASTERED!" : "MARK AS DONE"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B6B",
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "black",
    color: "#000",
    flex: 1,
    marginHorizontal: 15,
  },
  completeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#34C759",
  },
  cardContainer: {
    padding: 20,
  },
  spacer: {
    height: 100,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 3,
    borderTopColor: "#000",
  },
  markButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#000",
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  markButtonCompleted: {
    backgroundColor: "#34C759",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "black",
    color: "#FFF",
    marginLeft: 8,
    textTransform: "uppercase",
  },
  buttonTextCompleted: {
    color: "#000",
  },
});