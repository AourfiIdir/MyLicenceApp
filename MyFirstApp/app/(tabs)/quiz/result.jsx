import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function QuizResult() {
  const router = useRouter();
  const { score, total, cardId, category } = useLocalSearchParams();

  const scoreNum = parseInt(score);
  const totalNum = parseInt(total);
  const percentage = Math.round((scoreNum / totalNum) * 100);

  // Déterminer le message en fonction du score
  const getMessage = () => {
    if (percentage === 100) {
      return {
        title: "Parfait ! 🎉",
        message: "Vous avez répondu correctement à toutes les questions !",
        color: "#34C759",
      };
    } else if (percentage >= 80) {
      return {
        title: "Excellent ! 🌟",
        message: "Très bon travail, vous maîtrisez bien le sujet !",
        color: "#34C759",
      };
    } else if (percentage >= 60) {
      return {
        title: "Bien joué ! 👍",
        message: "Bon résultat, continuez comme ça !",
        color: "#FFE66D",
      };
    } else if (percentage >= 40) {
      return {
        title: "Pas mal ! 📚",
        message: "Il y a encore quelques points à améliorer.",
        color: "#FF9500",
      };
    } else {
      return {
        title: "Continuez à apprendre ! 💪",
        message: "N'abandonnez pas, la pratique fait la perfection !",
        color: "#FF6B35",
      };
    }
  };

  const result = getMessage();

  const handleRestart = () => {
    if (category && cardId) {
      router.replace({
        pathname: "/(tabs)/quiz/[category]/[quiz]",
        params: { category: category, quiz: cardId }
      });
    } else if (cardId) {
      router.back();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: result.color }]}>
        <Text style={styles.headerTitle}>Résultat du Quiz</Text>
      </View>

      {/* Score Circle */}
      <View style={styles.scoreSection}>
        <View style={[styles.scoreCircle, { borderColor: result.color }]}>
          <Text style={[styles.percentage, { color: result.color }]}>
            {percentage}%
          </Text>
          <Text style={styles.scoreText}>
            {scoreNum} / {totalNum}
          </Text>
        </View>
      </View>

      {/* Message */}
      <View style={styles.messageSection}>
        <Text style={styles.messageTitle}>{result.title}</Text>
        <Text style={styles.messageText}>{result.message}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Ionicons name="checkmark-circle" size={32} color="#34C759" />
          <Text style={styles.statNumber}>{scoreNum}</Text>
          <Text style={styles.statLabel}>Correctes</Text>
        </View>

        <View style={styles.statBox}>
          <Ionicons name="close-circle" size={32} color="#FF3B30" />
          <Text style={styles.statNumber}>{totalNum - scoreNum}</Text>
          <Text style={styles.statLabel}>Incorrectes</Text>
        </View>

        <View style={styles.statBox}>
          <Ionicons name="help-circle" size={32} color="#FF6B35" />
          <Text style={styles.statNumber}>{totalNum}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFF" />
          <Text style={styles.primaryButtonText}>Retour aux cartes</Text>
        </TouchableOpacity>

        {cardId && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRestart}
          >
            <Ionicons name="refresh" size={20} color="#FF6B35" />
            <Text style={styles.secondaryButtonText}>Recommencer</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.tertiaryButton}
          onPress={() => router.push("/(tabs)/learn")}
        >
          <Text style={styles.tertiaryButtonText}>
            Explorer dautres catégories
          </Text>
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
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 5,
    borderBottomColor: "#000",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "black",
    color: "#000",
  },
  scoreSection: {
    alignItems: "center",
    paddingVertical: 40,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  percentage: {
    fontSize: 48,
    fontWeight: "black",
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginTop: 5,
  },
  messageSection: {
    paddingHorizontal: 30,
    alignItems: "center",
    marginBottom: 30,
  },
  messageTitle: {
    fontSize: 28,
    fontWeight: "black",
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },
  messageText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#000",
    padding: 20,
    alignItems: "center",
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "black",
    color: "#000",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontWeight: "bold",
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#000",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "black",
    color: "#FFF",
  },
  secondaryButton: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#FF6B35",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "black",
    color: "#FF6B35",
  },
  tertiaryButton: {
    padding: 16,
    alignItems: "center",
  },
  tertiaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    textDecorationLine: "underline",
  },
});