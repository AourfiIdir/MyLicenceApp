import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";

const API = Constants.expoConfig?.extra?.API || "http://localhost:3000";

export default function CreateList() {
  const router = useRouter();
  const { userToken, authFetch } = useAuth();
  const [listName, setListName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateList = async () => {
    if (!listName.trim()) {
      Alert.alert("Error", "Please enter a list name");
      return;
    }

    try {
      setLoading(true);
      const res = await authFetch(`${API}/lists`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: listName,
          description: description,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          Array.isArray(errorData.message)
            ? errorData.message.join(", ")
            : errorData.message || "Failed to create list",
        );
      }

      // ...existing code...
      const newList = await res.json();
      Alert.alert("Success", "List created! 🎉");
      router.push("/list/lists"); // Changed from router.push(`/list/${newList._id}`);
      // ...existing code...
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create list");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>CREATE NEW LIST</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>LIST NAME *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter list name..."
            value={listName}
            onChangeText={setListName}
            placeholderTextColor="#CCC"
            maxLength={50}
          />
          <Text style={styles.charCount}>{listName.length}/50</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter list description (optional)..."
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#CCC"
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.charCount}>{description.length}/200</Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateList}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" size="large" />
          ) : (
            <>
              <Ionicons name="add-circle" size={24} color="#000" />
              <Text style={styles.createButtonText}>CREATE LIST</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: {
    fontSize: 24,
    fontWeight: "black",
    color: "#000",
    flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "#000",
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: "black",
    color: "#FF6B35",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  textArea: {
    textAlignVertical: "top",
    paddingTop: 12,
  },
  charCount: {
    fontSize: 11,
    color: "#999",
    marginTop: 8,
    textAlign: "right",
  },
  createButton: {
    backgroundColor: "#34C759",
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
    marginBottom: 40,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "black",
    color: "#000",
    marginLeft: 8,
    textTransform: "uppercase",
  },
});
