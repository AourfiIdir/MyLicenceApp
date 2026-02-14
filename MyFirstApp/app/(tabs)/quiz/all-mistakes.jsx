import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { BACKEND_API } from '../../../constants/constants';
import {  useAuth } from "../../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const API =BACKEND_API;

export default function AllMistakesScreen() {
  const router = useRouter();
  const { userToken, authFetch } = useAuth();

  const [mistakes, setMistakes] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllMistakes();
  }, []);

  const fetchAllMistakes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user data first
      const userRes = await authFetch(`${API}/user/currentUser`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!userRes.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const user = await userRes.json();
      setUserData(user);

      if (!user._id) {
        throw new Error('User ID not found');
      }

      // Fetch all mistakes
      const mistakesRes = await fetch(`${API}/mistake/myMistakes/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (mistakesRes.ok) {
        const mistakesData = await mistakesRes.json();
        console.log("All Mistakes:", mistakesData);
        setMistakes(Array.isArray(mistakesData.mistakes) ? mistakesData.mistakes : []);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching all mistakes:", err);
    } finally {
      setLoading(false);
    }
  };
const onCorrectAnswer = async (mistakeId) => {
  try {
    const mistake = mistakes.find(m => m._id === mistakeId);
    if (!mistake) return;

    const response = await fetch(`${API}/mistake/deleteByQuestion`, {
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${userToken}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        question: mistake.mistake.split(" - Votre réponse:")[0],
        card: mistake.card._id
      })
    });

    if (response.ok) {
      setMistakes((prev) => prev.filter((m) => m._id !== mistakeId));
    }
  } catch (err) {
    console.error(err);
  }
};



  // Group mistakes by quiz/card
  const groupMistakesByCard = () => {
    const grouped = {};
    mistakes.forEach((mistake) => {
      const cardId = mistake.card?._id || 'unknown';
      if (!grouped[cardId]) {
        grouped[cardId] = {
          cardName: mistake.card?.name || 'Quiz inconnu',
          cardId: cardId,
          mistakes: []
        };
      }
      grouped[cardId].mistakes.push(mistake);
    });
    return Object.values(grouped);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Erreur</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const groupedMistakes = groupMistakesByCard();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Toutes mes erreurs</Text>
          <Text style={styles.headerSubtitle}>
            {mistakes.length} erreur{mistakes.length > 1 ? 's' : ''} au total
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{mistakes.length}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mistakes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>Aucune erreur!</Text>
            <Text style={styles.emptyText}>
              Vous n'avez fait aucune erreur dans vos quiz. Continuez comme ça!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.back()}
            >
              <Text style={styles.emptyButtonText}>Retour au profil</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Ionicons name="document-text" size={24} color="#FF6B35" />
                  <Text style={styles.summaryNumber}>{groupedMistakes.length}</Text>
                  <Text style={styles.summaryLabel}>Quiz</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
                  <Text style={styles.summaryNumber}>{mistakes.length}</Text>
                  <Text style={styles.summaryLabel}>Erreurs</Text>
                </View>
              </View>
            </View>

            {/* Grouped Mistakes by Quiz */}
            {groupedMistakes.map((group, index) => (
              <View key={index} style={styles.quizGroup}>
                <TouchableOpacity
                  style={styles.quizHeader}
                  onPress={() => router.push({
                    pathname: "/(tabs)/quiz/mistakes",
                    params: { cardId: group.cardId }
                  })}
                  activeOpacity={0.7}
                >
                  <View style={styles.quizIconContainer}>
                    <Ionicons name="book" size={24} color="#FF6B35" />
                  </View>
                  <View style={styles.quizInfo}>
                    <Text style={styles.quizName}>{group.cardName}</Text>
                    <Text style={styles.quizMistakeCount}>
                      {group.mistakes.length} erreur{group.mistakes.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#999" />
                </TouchableOpacity>

                {/* Show first 3 mistakes preview */}
                <View style={styles.mistakesPreview}>
                  {group.mistakes.slice(0, 3).map((mistake, idx) => (
                    <MistakePreviewItem
                      key={mistake._id || idx}
                      mistake={mistake}
                      onCorrectAnswer={onCorrectAnswer}
                    />

                  ))}
                  {group.mistakes.length > 3 && (
                    <View style={styles.moreIndicator}>
                      <Text style={styles.moreText}>
                        +{group.mistakes.length - 3} de plus
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const MistakePreviewItem = ({ mistake }) => {
  const parseMistake = (mistakeText) => {
    const parts = mistakeText.split(" - Votre réponse: ");
    if (parts.length < 2) return { question: mistakeText };
    return { question: parts[0] };
  };

  const { question } = parseMistake(mistake.mistake);

  return (
    <View style={styles.mistakePreviewItem}>
      <View style={styles.mistakePreviewIcon}>
        <Ionicons name="close" size={16} color="#FFF" />
      </View>
      <Text style={styles.mistakePreviewText} numberOfLines={2}>
        {question}
      </Text>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
  header: {
    backgroundColor: "#FF6B6B",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 5,
    borderBottomColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "black",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFF",
    marginTop: 4,
    opacity: 0.9,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000",
  },
  headerBadgeText: {
    fontSize: 18,
    fontWeight: "black",
    color: "#FF6B6B",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    padding: 20,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "black",
    color: "#000",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#000",
  },
  retryText: {
    color: "#FFF",
    fontWeight: "black",
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "black",
    color: "#4ECDC4",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#000",
  },
  emptyButtonText: {
    color: "#FFF",
    fontWeight: "black",
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
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
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: "black",
    color: "#000",
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    marginTop: 4,
  },
  summaryDivider: {
    width: 2,
    height: 60,
    backgroundColor: "#000",
  },
  quizGroup: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    borderWidth: 4,
    borderColor: "#000",
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  quizHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 15,
    borderBottomWidth: 3,
    borderBottomColor: "#000",
    backgroundColor: "#FFF",
  },
  quizIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFE6E6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FF6B35",
  },
  quizInfo: {
    flex: 1,
  },
  quizName: {
    fontSize: 16,
    fontWeight: "black",
    color: "#000",
  },
  quizMistakeCount: {
    fontSize: 14,
    color: "#FF6B6B",
    marginTop: 4,
    fontWeight: "600",
  },
  mistakesPreview: {
    backgroundColor: "#FFF8E1",
    padding: 15,
  },
  mistakePreviewItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  mistakePreviewIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  mistakePreviewText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  moreIndicator: {
    paddingVertical: 10,
    alignItems: "center",
  },
  moreText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "bold",
  },
});