import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { BACKEND_API } from "../../../constants/constants";

const API = BACKEND_API;

export default function Lists() {
  const router = useRouter();
  const { userToken, authFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchLists();
    }, [userToken])
  );

  const fetchLists = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API}/lists`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const data = await res.json();
      setLists(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to load lists");
    } finally {
      setLoading(false);
    }
  };

  const deleteList = async (listId) => {
    try {
      console.log("DELETE PRESSED");

      const res = await authFetch(`${API}/lists/${listId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setLists((prev) => prev.filter((item) => item._id !== listId));
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to delete list");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      
      {/* LEFT SIDE (NAVIGATION) */}
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => router.push(`/list/${item._id}`)}
        activeOpacity={0.7}
      >
        <Ionicons name="list" size={28} color="#FF6B35" />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.titleText}>{item.name}</Text>
          <Text style={styles.subtitle}>
            {item.cards?.length || 0} cards
          </Text>
        </View>
      </TouchableOpacity>

      {/* RIGHT SIDE (DELETE) */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteList(item._id)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash" size={20} color="#FFF" />
      </TouchableOpacity>

    </View>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <FlatList
      data={lists}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text>No lists yet</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFF8E1",
    flexGrow: 1,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  titleText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 12,
    color: "#666",
  },

  deleteButton: {
    backgroundColor: "#FF6B6B",
    padding: 10,
    borderRadius: 8,
  },

  empty: {
    alignItems: "center",
    marginTop: 50,
  },
});