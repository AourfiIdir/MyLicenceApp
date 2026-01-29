import { Pressable } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";

const API = Constants.expoConfig?.extra?.API || "http://localhost:3000";

export default function Lists() {
  const router = useRouter();
  const { userToken, authFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchLists();
    }, [])
  );

  const fetchLists = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API}/lists`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setLists(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load lists");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteList = (listId) => {
    Alert.alert(
      "Delete List",
      "Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            console.log("Deleting list:", listId);
            try {
              const res = await authFetch(`${API}/lists/${listId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${userToken}`,
                },
              });

              if (!res.ok) throw new Error("Failed to delete list");

              fetchLists();
            } catch (error) {
              Alert.alert("Error", "Failed to delete list");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>MY LISTS</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/list/create")}
        >
          <Ionicons name="add-circle" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {lists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No lists yet</Text>
            <Text style={styles.emptySubText}>Create your first list!</Text>
          </View>
        ) : (
          lists.map((list) => (
            <View key={list._id} style={styles.listCard}>
              {/* NAVIGATION AREA */}
              <TouchableOpacity
                style={styles.listContent}
                onPress={() => router.push(`/list/${list._id}`)}
                activeOpacity={0.7}
              >
                <Ionicons name="list" size={32} color="#FF6B35" />
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{list.name}</Text>
                  {list.description && (
                    <Text style={styles.listDescription} numberOfLines={1}>
                      {list.description}
                    </Text>
                  )}
                  <Text style={styles.listCount}>
                    {list.cards?.length || 0} cards
                  </Text>
                </View>
              </TouchableOpacity>

              {/* DELETE BUTTON */}
              <Pressable
                onPress={() => deleteList(list._id)}
                hitSlop={12}
                style={styles.deleteButton}
              >
                <Ionicons name="trash" size={20} color="#FF6B6B" />
              </Pressable>
            </View>
          ))
        )}
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
  title: {
    fontSize: 28,
    fontWeight: "black",
    color: "#000",
    flex: 1,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  listContainer: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "black",
    color: "#999",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#CCC",
    marginTop: 8,
  },
  listCard: {
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
  listContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 18,
    fontWeight: "black",
    color: "#000",
  },
  listDescription: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  listCount: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontWeight: "bold",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE8E8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
});
