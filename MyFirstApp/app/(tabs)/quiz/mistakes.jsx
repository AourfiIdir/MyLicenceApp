import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import { BACKEND_API } from '../../../constants/constants';
import { Ionicons } from "@expo/vector-icons";

const API = BACKEND_API;

export default function MistakesScreen() {
  const { cardId } = useLocalSearchParams();
  const router = useRouter();
  const { userToken, authFetch } = useAuth();

  const [mistakes, setMistakes] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMistakes();
  }, [cardId]);

  const fetchMistakes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user data first
      const userRes = await authFetch(`${API}/user/currentUser`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!userRes.ok) {
        throw new Error("Failed to fetch user data");
      }

      const user = await userRes.json();

      // Fetch quiz data to get question details
      const quizRes = await fetch(`${API}/card/${cardId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!quizRes.ok) {
        throw new Error("Failed to load quiz data");
      }

      const quiz = await quizRes.json();
      setQuizData(quiz);

      // Fetch user's mistakes for this specific card
      const mistakesRes = await fetch(`${API}/mistake/myMistakes/${user._id}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      if (mistakesRes.ok) {
        const mistakesData = await mistakesRes.json();
        console.log("All mistakes data:", mistakesData);
        
        // Filter mistakes for this specific card
        const cardMistakes = mistakesData.mistakes?.filter(
          m => m.card?._id === cardId || m.card === cardId
        ) || [];
        
        console.log("Mistakes for this card:", cardMistakes);
        setMistakes(cardMistakes);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching mistakes:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Chargement des erreurs...</Text>
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
          <Text style={styles.headerTitle}>Vos Erreurs</Text>
          <Text style={styles.headerSubtitle}>
            {mistakes.length} erreur{mistakes.length > 1 ? 's' : ''} à réviser
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="alert-circle" size={24} color="#FFF" />
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
              Vous avez réussi ce quiz sans faire derreurs.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.back()}
            >
              <Text style={styles.emptyButtonText}>Retour</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <Ionicons name="bar-chart" size={32} color="#FF6B35" />
              </View>
              <View style={styles.summaryContent}>
                <Text style={styles.summaryTitle}>Résumé</Text>
                <Text style={styles.summaryText}>
                  Prenez le temps de bien comprendre vos erreurs pour progresser!
                </Text>
              </View>
            </View>

            {/* Mistakes List */}
            {mistakes.map((mistake, index) => (
              <MistakeCard 
                key={mistake._id || index} 
                mistake={mistake} 
                index={index}
                quizData={quizData}
              />
            ))}

            {/* Retry Button */}
            <Link
              href={{
                pathname: "/(tabs)/quiz/[category]/[quiz]",
                params: { 
                  quiz: cardId,
                  category: quizData?.category || ""
                }
              }}
              asChild
            >
              <TouchableOpacity style={styles.retryQuizButton}>
                <Ionicons name="refresh-circle" size={24} color="#FFF" />
                <Text style={styles.retryQuizText}>Refaire le quiz</Text>
              </TouchableOpacity>
            </Link>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const MistakeCard = ({ mistake, index, quizData }) => {
  // Parse the mistake text to extract question, user answer, and correct answer
  const parseMistake = (mistakeText) => {
    // Format: "Question - Votre réponse: X (Correct: Y)"
    const parts = mistakeText.split(" - Votre réponse: ");
    if (parts.length < 2) return { question: mistakeText, userAnswer: "", correctAnswer: "" };
    
    const question = parts[0];
    const answerParts = parts[1].split(" (Correct: ");
    const userAnswer = answerParts[0];
    const correctAnswer = answerParts[1]?.replace(")", "") || "";
    
    return { question, userAnswer, correctAnswer };
  };

  const { question, userAnswer, correctAnswer } = parseMistake(mistake.mistake);

  // Find the question in quiz data to get the image
  const questionData = quizData?.content?.find(q => q.question === question);

  return (
    <View style={styles.mistakeCard}>
      <View style={styles.mistakeHeader}>
        <View style={styles.mistakeNumber}>
          <Text style={styles.mistakeNumberText}>#{index + 1}</Text>
        </View>
        <Text style={styles.mistakeDate}>
          {new Date(mistake.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </Text>
      </View>

      {/* Question Image */}
      {questionData?.imageURI && (
        <View style={styles.mistakeImageContainer}>
          <Image
            source={{ uri: questionData.imageURI }}
            style={styles.mistakeImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Question */}
      <View style={styles.questionSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="help-circle" size={20} color="#4ECDC4" />
          <Text style={styles.sectionTitle}>Question</Text>
        </View>
        <Text style={styles.questionText}>{question}</Text>
      </View>

      {/* User's Wrong Answer */}
      <View style={styles.wrongAnswerSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="close-circle" size={20} color="#FF6B6B" />
          <Text style={styles.sectionTitle}>Votre réponse</Text>
        </View>
        <Text style={styles.wrongAnswerText}>{userAnswer}</Text>
      </View>

      {/* Correct Answer */}
      <View style={styles.correctAnswerSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
          <Text style={styles.sectionTitle}>Réponse correcte</Text>
        </View>
        <Text style={styles.correctAnswerText}>{correctAnswer}</Text>
      </View>
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
    fontSize: 24,
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
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
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
    paddingVertical: 60,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  summaryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFE6E6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FF6B35",
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "black",
    color: "#000",
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  mistakeCard: {
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
  mistakeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    borderStyle: "dashed",
  },
  mistakeNumber: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000",
  },
  mistakeNumberText: {
    fontSize: 14,
    fontWeight: "black",
    color: "#FFF",
  },
  mistakeDate: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
  },
  mistakeImageContainer: {
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#000",
    overflow: "hidden",
  },
  mistakeImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 16 / 9,
    backgroundColor: "#F5F5F5",
  },
  questionSection: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    textTransform: "uppercase",
  },
  questionText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "600",
    lineHeight: 24,
  },
  wrongAnswerSection: {
    backgroundColor: "#FFE6E6",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FF6B6B",
    padding: 15,
    marginBottom: 10,
  },
  wrongAnswerText: {
    fontSize: 15,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  correctAnswerSection: {
    backgroundColor: "#E6F7F5",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4ECDC4",
    padding: 15,
  },
  correctAnswerText: {
    fontSize: 15,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  retryQuizButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 15,
    borderWidth: 4,
    borderColor: "#000",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  retryQuizText: {
    fontSize: 18,
    fontWeight: "black",
    color: "#FFF",
  },
});