import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useAuth,authFetch } from "../../../contexts/AuthContext.jsx";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { categoryImages } from "../../../constants/images.jsx";
import { BACKEND_API } from "../../../constants/constants.jsx";
const API = BACKEND_API;

export default function LearnCategories() {
  const router = useRouter();
  const { userToken, authFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API}/card/categories`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) throw new Error("Failed to fetch categories");
      

      const data = await res.json();
      const data2 = data.filter(cat=> {
        if(cat.split("-")[0] === "learning") return true;
        return false;
      })

      console.log("Categories:", data2); // Debug
      setCategories(data2);
      
    } catch (error) {
      console.error("Error fetching categories:", error);
      Alert.alert("Error", "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryName) => {
    console.log("Navigating to:", categoryName); // Debug
    router.push(`/learn/${encodeURIComponent(categoryName)}`);
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
        <View style={styles.comicBurst}>
          <Text style={styles.burstText}>LEARN!</Text>
        </View>
        <Text style={styles.title}>📚 CHOOSE YOUR QUEST</Text>
        <Text style={styles.subtitle}>Select a category to master</Text>
      </View>

      <View style={styles.categoriesGrid}>
        {categories.map((categoryName, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(categoryName)}
          >
            <Image
              source={
                categoryImages[categoryName] || 
                require("../../../assets/category/default.png")
              }
              style={styles.categoryImage}
            />

            <Text style={styles.categoryName}>{categoryName}</Text>

            <View style={styles.cardArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.motivationBox}>
        <Text style={styles.motivationText}>
          💪 Master all categories to become a LICENSED HERO!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ... same styles
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
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomWidth: 5,
    borderBottomColor: "#000",
    position: "relative",
  },
  comicBurst: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 70,
    height: 70,
    backgroundColor: "#FFE66D",
    transform: [{ rotate: "15deg" }],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000",
  },
  burstText: {
    fontSize: 16,
    fontWeight: "black",
    color: "#000",
    transform: [{ rotate: "-15deg" }],
  },
  title: {
    fontSize: 28,
    fontWeight: "black",
    color: "#000",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 20,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "#000",
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  categoryImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000",
    marginBottom: 10,
    resizeMode: "cover",
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "black",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  cardArrow: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  arrowText: {
    fontSize: 16,
    fontWeight: "black",
    color: "#FFF",
  },
  motivationBox: {
    backgroundColor: "#4ECDC4",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "#000",
    alignItems: "center",
  },
  motivationText: {
    fontSize: 16,
    fontWeight: "black",
    color: "#000",
    textAlign: "center",
  },
});