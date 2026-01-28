import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";

const API = Constants.expoConfig?.extra?.API || "http://localhost:3000";

export default function ListDetail() {
  const router = useRouter();
  const { listId } = useLocalSearchParams();
  const { userToken } = useAuth();
  const [list, setList] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchList();
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>
            {list.name}
          </Text>
          {list.description && (
            <Text style={styles.description} numberOfLines={1}>
              {list.description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.cardCountBadge}>
          <Ionicons name="layers" size={20} color="#FFF" />
          <Text style={styles.cardCountText}>
            {cards.length} cards
          </Text>
        </View>

        <FlatList
          scrollEnabled={false}
          data={cards}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() =>
                router.push(`/learn/${item.category}/${item._id}`)
              }
            >
              <View style={styles.cardContent}>
                <Ionicons name="card" size={28} color="#FF6B35" />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardCategory}>{item.category}</Text>
                </View>
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
              <Text style={styles.emptySubText}>
                Add cards from the Learn section
              </Text>
            </View>
          }
        />
      </View>
    </ScrollView>
  );
}

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
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "black",
    color: "#000",
  },
  description: {
    fontSize: 12,
    color: "rgba(0,0,0,0.6)",
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  cardCountBadge: {
    backgroundColor: "#4ECDC4",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardCountText: {
    fontSize: 14,
    fontWeight: "black",
    color: "#FFF",
    textTransform: "uppercase",
  },
  cardItem: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "#000",
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "black",
    color: "#000",
  },
  cardCategory: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
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
  emptySubText: {
    fontSize: 14,
    color: "#CCC",
    marginTop: 8,
  },
});