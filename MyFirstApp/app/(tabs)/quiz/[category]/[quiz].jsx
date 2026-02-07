import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Constants from "expo-constants";
import { useAuth } from "../../../../contexts/AuthContext";

const API = Constants.expoConfig?.extra?.API || "http://localhost:3000";

export default function QuizScreen() {
  const { quiz: cardId,category } = useLocalSearchParams(); 
  const router = useRouter();
  const { userToken } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
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
      console.log("Quiz data:", data); // Pour déboguer
      
      // Vérifier que les données sont valides
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

  const answer = (i) => {
    const question = quiz.content[index];
    const newScore = i === question.correctAnswer ? score + 1 : score;

    if (index + 1 < quiz.content.length) {
      if (i === question.correctAnswer) {
        setScore(s => s + 1);
      }
      setIndex(idx => idx + 1);
    } else {
      router.replace({
        pathname: "/(tabs)/quiz/result",
        params: {
          score: newScore,
          total: quiz.content.length,
          cardId: cardId,
          category : category,
        }
      });
    }
  };

  // États de chargement
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Chargement du quiz...</Text>
      </View>
    );
  }

  // État d'erreur
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

  // Vérification finale avant le rendu
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
      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((index + 1) / quiz.content.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <Text style={styles.counter}>
        Question {index + 1} / {quiz.content.length}
      </Text>

      <Text style={styles.question}>{question.question}</Text>

      {question.answers && question.answers.map((a, i) => (
        <TouchableOpacity
          key={i}
          style={styles.answer}
          onPress={() => answer(i)}
        >
          <Text style={styles.answerText}>{a}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: "#FFF8E1"
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
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6B35",
  },
  counter: { 
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
  },
  question: { 
    fontSize: 22, 
    fontWeight: "black", 
    marginBottom: 30,
    color: "#000",
  },
  answer: {
    padding: 18,
    borderWidth: 3,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#FFF",
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  answerText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  }
});