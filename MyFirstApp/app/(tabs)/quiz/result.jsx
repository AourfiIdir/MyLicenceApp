import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ResultScreen() {
  const { score, total, mistakes, cardId } = useLocalSearchParams();
  const router = useRouter();
  
  const scoreNum = parseInt(score);
  const totalNum = parseInt(total);
  const mistakesNum = parseInt(mistakes || "0");
  const percentage = Math.round((scoreNum / totalNum) * 100);

  const getResultMessage = () => {
    if (percentage >= 80) return { emoji: "🏆", title: "EXCELLENT!", color: "#4ECDC4" };
    if (percentage >= 60) return { emoji: "👍", title: "BIEN JOUÉ!", color: "#FFE66D" };
    if (percentage >= 40) return { emoji: "💪", title: "PAS MAL!", color: "#FF9F1C" };
    return { emoji: "📚", title: "CONTINUE!", color: "#FF6B6B" };
  };

  const result = getResultMessage();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: result.color }]}>
        <Text style={styles.emoji}>{result.emoji}</Text>
        <Text style={styles.resultTitle}>{result.title}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Votre Score</Text>
          <Text style={styles.scoreText}>
            {scoreNum} / {totalNum}
          </Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
          
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: result.color }]} 
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: "#4ECDC4" }]}>
            <Ionicons name="checkmark-circle" size={32} color="#FFF" />
            <Text style={styles.statNumber}>{scoreNum}</Text>
            <Text style={styles.statLabel}>Correctes</Text>
          </View>
          
          <View style={[styles.statBox, { backgroundColor: "#FF6B6B" }]}>
            <Ionicons name="close-circle" size={32} color="#FFF" />
            <Text style={styles.statNumber}>{mistakesNum}</Text>
            <Text style={styles.statLabel}>Erreurs</Text>
          </View>
        </View>

        {/* Mistakes Block */}
        {mistakesNum > 0 && (
          <TouchableOpacity 
            style={styles.mistakesBlock}
            onPress={() => router.push({
              pathname: "/(tabs)/quiz/mistakes",
              params: { cardId }
            })}
            activeOpacity={0.7}
          >
            <View style={styles.mistakesHeader}>
              <View style={styles.mistakesIconContainer}>
                <Ionicons name="alert-circle" size={28} color="#FF6B6B" />
              </View>
              <View style={styles.mistakesInfo}>
                <Text style={styles.mistakesTitle}>Vos Erreurs</Text>
                <Text style={styles.mistakesSubtitle}>
                  {mistakesNum} question{mistakesNum > 1 ? 's' : ''} incorrecte{mistakesNum > 1 ? 's' : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </View>
            
            <View style={styles.mistakesFooter}>
              <Text style={styles.mistakesFooterText}>
                Appuyez pour réviser vos erreurs
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Perfect Score Message */}
        {mistakesNum === 0 && (
          <View style={styles.perfectScoreBlock}>
            <Text style={styles.perfectEmoji}>🎯</Text>
            <Text style={styles.perfectTitle}>Score Parfait!</Text>
            <Text style={styles.perfectText}>
              Aucune erreur! Vous maîtrisez ce sujet!
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.retryButton]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Refaire</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.homeButton]}
            onPress={() => router.push("/(tabs)/quiz")}
            activeOpacity={0.7}
          >
            <Ionicons name="home" size={20} color="#000" />
            <Text style={[styles.buttonText, { color: "#000" }]}>Accueil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomWidth: 5,
    borderBottomColor: "#000",
  },
  emoji: {
    fontSize: 64,
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: "black",
    color: "#000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  scoreCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#000",
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: "black",
    color: "#000",
  },
  percentageText: {
    fontSize: 32,
    fontWeight: "black",
    color: "#FF6B35",
    marginTop: 10,
  },
  progressBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#000",
    overflow: "hidden",
    marginTop: 20,
  },
  progressFill: {
    height: "100%",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: "#000",
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "black",
    color: "#FFF",
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 5,
  },
  mistakesBlock: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    borderWidth: 4,
    borderColor: "#000",
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  mistakesHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 15,
  },
  mistakesIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFE6E6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FF6B6B",
  },
  mistakesInfo: {
    flex: 1,
  },
  mistakesTitle: {
    fontSize: 18,
    fontWeight: "black",
    color: "#000",
  },
  mistakesSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  mistakesFooter: {
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderTopWidth: 2,
    borderTopColor: "#000",
    borderStyle: "dashed",
  },
  mistakesFooterText: {
    fontSize: 13,
    color: "#FF6B35",
    fontWeight: "bold",
    textAlign: "center",
  },
  perfectScoreBlock: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    borderWidth: 4,
    borderColor: "#000",
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  perfectEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  perfectTitle: {
    fontSize: 24,
    fontWeight: "black",
    color: "#4ECDC4",
    marginBottom: 10,
  },
  perfectText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 15,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "#000",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  retryButton: {
    backgroundColor: "#FF6B35",
  },
  homeButton: {
    backgroundColor: "#FFE66D",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "black",
    color: "#FFF",
  },
});