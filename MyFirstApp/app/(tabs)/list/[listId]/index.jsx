import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { BACKEND_API } from "../../../../constants/constants";
const API = BACKEND_API;

export default function ListDetail() {
  const router = useRouter();
  const { listId } = useLocalSearchParams();
  const { userToken } = useAuth();
  const [list, setList] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTestModal, setShowTestModal] = useState(false);

  const tests = [
    { id: "quizlet", name: "Flashcard Quiz", icon: "layers", color: "#FF6B35" },
    { id: "multiple", name: "Multiple Choice", icon: "list", color: "#4ECDC4" },
    { id: "matching", name: "Matching", icon: "git-compare", color: "#FFE66D" },
  ];

  useFocusEffect(
    useCallback(() => {
      fetchList();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listId])
  );

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/lists/${listId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setList(data);

      // Fetch card details for each card ID
      if (data.cards && data.cards.length > 0) {
        const cardPromises = data.cards.map((cardId) =>
          fetch(`${API}/card/${cardId}`, {
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
          }).then((res) => res.json())
        );

        const cardDetails = await Promise.all(cardPromises);
        setCards(cardDetails);
      } else {
        setCards([]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load list");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeCardFromList = async (cardId) => {
    Alert.alert("Remove Card", "Remove this card from list?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Remove",
        onPress: async () => {
          try {
            const res = await fetch(`${API}/listtocard/${listId}/${cardId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${userToken}`,
                "Content-Type": "application/json",
              },
            });

            if (!res.ok) throw new Error("Failed to remove card");

            fetchList();
            Alert.alert("Success", "Card removed!");
          } catch (error) {
            Alert.alert("Error", error.message || "Failed to remove card");
          }
        },
      },
    ]);
  };

  const handleTestSelect = (testId) => {
    setShowTestModal(false);
    if (testId === "quizlet") {
      router.push({
        pathname: "/learningTest/quizlet",
        params: { listId,source:"userList" },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!list) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>List not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>{list.name}</Text>
          {list.description && (
            <Text style={styles.desc}>{list.description}</Text>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {/* CARD COUNT */}
        <View style={styles.badge}>
          <Ionicons name="layers" size={18} color="#FFF" />
          <Text style={styles.badgeText}>{cards.length} cards</Text>
        </View>

        {/* TAKE A TEST */}
        <TouchableOpacity
          style={styles.testBtn}
          onPress={() => setShowTestModal(true)}
        >
          <Ionicons name="school" size={22} color="#000" />
          <Text style={styles.testText}>TAKE A TEST</Text>
        </TouchableOpacity>

        {/* CARDS */}
        <FlatList
          scrollEnabled={false}
          data={cards}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() =>
                router.push(`/learn/${item.category}/${item._id}`)
              }
            >
              <Ionicons name="card" size={24} color="#FF6B35" />
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardName}>{item.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => removeCardFromList(item._id)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="inbox-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No cards in this list</Text>
            </View>
          }
        />
      </View>

      {/* TEST SELECTION MODAL */}
      <Modal visible={showTestModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose a Test Type</Text>
            {tests.map((test) => (
              <TouchableOpacity
                key={test.id}
                style={[styles.testOption, { borderLeftColor: test.color, borderLeftWidth: 5 }]}
                onPress={() => handleTestSelect(test.id)}
              >
                <Ionicons name={test.icon} size={24} color={test.color} />
                <Text style={styles.testOptionText}>{test.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowTestModal(false)}
            >
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8E1" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 18, fontWeight: "bold", color: "#FF6B6B" },

  header: {
    backgroundColor: "#FF6B35",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 5,
    borderColor: "#000",
    flexDirection: "row",
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  title: { fontSize: 24, fontWeight: "black", color: "#000" },
  desc: { fontSize: 12, opacity: 0.7 },

  content: { padding: 20 },

  badge: {
    flexDirection: "row",
    backgroundColor: "#4ECDC4",
    borderWidth: 3,
    borderColor: "#000",
    padding: 10,
    borderRadius: 14,
    gap: 8,
    marginBottom: 15,
  },
  badgeText: { color: "#FFF", fontWeight: "black" },

  testBtn: {
    backgroundColor: "#FFE66D",
    borderWidth: 4,
    borderColor: "#000",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
  },
  testText: {
    fontWeight: "black",
    fontSize: 16,
    color: "#000",
  },

  cardRow: {
    backgroundColor: "#FFF",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardName: { fontWeight: "black", fontSize: 16 },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE8E8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "black",
    color: "#999",
    marginTop: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF8E1",
    borderWidth: 5,
    borderColor: "#000",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "black",
    marginBottom: 20,
    textAlign: "center",
  },
  testOption: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    gap: 12,
    alignItems: "center",
  },
  testOptionText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  closeBtn: {
    backgroundColor: "#FF6B35",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
  },
  closeBtnText: {
    fontWeight: "black",
    color: "#FFF",
    textAlign: "center",
  },
});