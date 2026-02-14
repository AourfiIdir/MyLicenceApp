import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../../../contexts/AuthContext";

import { Ionicons } from "@expo/vector-icons";
import Card from "../../../../components/Card.jsx"
import { BACKEND_API } from "../../../../constants/constants.jsx";
const API = BACKEND_API;



export default function QuizScreen() {
  const { quiz: cardId, category } = useLocalSearchParams();
  const router = useRouter();
  const { userToken } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState([]); // Nouveau state pour les erreurs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [cardId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${API}/card/${cardId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!res.ok) {
        throw new Error("Failed to load quiz");
      }
      
      const data = await res.json();
      console.log("Quiz data:", data);
      
      if (!data || !data.content || !Array.isArray(data.content) || data.content.length === 0) {
        throw new Error("Invalid quiz data");
      }
      
      setQuiz(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching quiz:", err);
    } finally {
      setLoading(false);
    }
  };

const answer = async (i) => {
  const question = quiz.content[index];
  const isCorrect = i === question.correctAnswer;
  const newScore = isCorrect ? score + 1 : score;

  if (!isCorrect) {
    const mistake = {
      question: question.question,
      userAnswer: question.answers[i],
      correctAnswer: question.answers[question.correctAnswer],
      imageURI: question.imageURI,
      card: cardId
    };

    await saveMistakeToBackend(mistake);
    setMistakes(prev => [...prev, mistake]);

  } else {
    // 🔥 SUPPRIME DIRECTEMENT EN BASE
    await deleteExistingMistake(question.question);
  }

  if (index + 1 < quiz.content.length) {
    setIndex(idx => idx + 1);
    if (isCorrect) setScore(s => s + 1);
  } else {
    router.replace({
      pathname: "/(tabs)/quiz/result",
      params: {
        score: newScore,
        total: quiz.content.length,
        mistakes: JSON.stringify(mistakes.length + (!isCorrect ? 1 : 0)),
        cardId: cardId,
      },
    });
  }
};



  const deleteExistingMistake = async (questionText) => {
  try {
    const response = await fetch(`${API}/mistake/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      console.log("No existing mistake to delete");
    }
  } catch (err) {
    console.error("Error deleting mistake:", err);
  }
};


  const saveMistakeToBackend = async (mistakeObj) => {
  try {
    const response = await fetch(`${API}/mistake`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mistake: `${mistakeObj.question} - Votre réponse: ${mistakeObj.userAnswer} (Correct: ${mistakeObj.correctAnswer})`,
        card: cardId
      })
    });

    if (!response.ok) {
      console.error("Failed to save mistake:", await response.text());
    } else {
      console.log("Mistake saved successfully");
    }
  } catch (err) {
    console.error("Error saving mistake:", err);
  }
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Chargement du quiz...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>❌ Erreur</Text>
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

  if (!quiz || !quiz.content || quiz.content.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>🤔 Aucune question</Text>
        <Text style={styles.errorText}>Ce quiz ne contient pas de questions.</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = quiz.content[index];

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
        <Text style={styles.headerTitle}>Quiz</Text>
        <View style={styles.scoreBadgeContainer}>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>
              {score}/{quiz.content.length}
            </Text>
          </View>
          {mistakes.length > 0 && (
            <View style={styles.mistakesBadge}>
              <Ionicons name="close-circle" size={16} color="#FFF" />
              <Text style={styles.mistakesBadgeText}>{mistakes.length}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((index + 1) / quiz.content.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.counter}>
            Question {index + 1} / {quiz.content.length}
          </Text>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          {/* Image if available */}
          {question.imageURI && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: question.imageURI }}
                style={styles.questionImage}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Question Text */}
          <Text style={styles.question}>{question.question}</Text>
        </View>

        {/* Answers */}
        <View style={styles.answersContainer}>
          {question.answers && question.answers.map((a, i) => (
            <TouchableOpacity
              key={i}
              style={styles.answer}
              onPress={() => answer(i)}
              activeOpacity={0.7}
            >
              <View style={styles.answerNumber}>
                <Text style={styles.answerNumberText}>{String.fromCharCode(65 + i)}</Text>
              </View>
              <Text style={styles.answerText}>{a}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: "#FFF8E1"
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
  errorTitle: {
    fontSize: 32,
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
    fontSize: 24,
    fontWeight: "black",
    color: "#000",
    flex: 1,
    marginLeft: 15,
  },
  scoreBadgeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  scoreBadge: {
    backgroundColor: "#FFE66D",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000",
  },
  scoreBadgeText: {
    fontSize: 14,
    fontWeight: "black",
    color: "#000",
  },
  mistakesBadge: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mistakesBadgeText: {
    fontSize: 12,
    fontWeight: "black",
    color: "#FFF",
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000",
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#34C759",
  },
  counter: { 
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
  },
  questionCard: {
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
  imageContainer: {
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#000",
    overflow: "hidden",
  },
  questionImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 16 / 9,
    backgroundColor: "#F5F5F5",
  },
  question: { 
    fontSize: 20, 
    fontWeight: "black", 
    color: "#000",
    lineHeight: 28,
  },
  answersContainer: {
    gap: 12,
  },
  answer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderWidth: 3,
    borderRadius: 12,
    backgroundColor: "#FFF",
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    gap: 12,
  },
  answerNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF6B35",
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  answerNumberText: {
    fontSize: 16,
    fontWeight: "black",
    color: "#FFF",
  },
  answerText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    fontWeight: "600",
  },
});