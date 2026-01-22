import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="car" size={50} color="#007AFF" />
          <Text style={styles.mainTitle}>Driver Licence</Text>
          <Text style={styles.subtitle}>Learning App</Text>
        </View>

        {/* Welcome Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome! 👋</Text>
          <Text style={styles.cardText}>
            Learn everything you need to know about driving rules and regulations.
            Practice with our interactive quizzes and become a confident driver.
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Road Rules</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>30</Text>
            <Text style={styles.statLabel}>Quiz Questions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Free</Text>
          </View>
        </View>

        {/* Features */}
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featureItem}>
          <Ionicons name="book" size={24} color="#007AFF" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>📚 Learn Tab</Text>
            <Text style={styles.featureDesc}>
              Study comprehensive road rules and safety guidelines
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="help-circle" size={24} color="#34C759" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>🏆 Quiz Tab</Text>
            <Text style={styles.featureDesc}>
              Test your knowledge with interactive multiple choice questions
            </Text>
          </View>
        </View>

        {/* Tips Section */}
        <Text style={styles.sectionTitle}>Tips for Success</Text>
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>✅ Start with the Learn tab to understand the rules</Text>
        </View>
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>✅ Take the Quiz multiple times to improve your score</Text>
        </View>
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>✅ Focus on areas where you score lower</Text>
        </View>
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>✅ Practice makes perfect - keep learning!</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Drive Safe, Learn Smart! 🚗</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginTop: 5,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  cardText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 15,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#E3F2FD",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginBottom: 15,
    marginTop: 10,
    color: "#000",
  },
  featureItem: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    marginLeft: 15,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  featureDesc: {
    fontSize: 13,
    color: "#666",
  },
  tipBox: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 4,
    borderLeftColor: "#34C759",
    padding: 12,
    marginHorizontal: 15,
    marginBottom: 8,
    borderRadius: 6,
  },
  tipText: {
    fontSize: 15,
    color: "#2E7D32",
    fontWeight: "500",
  },
  footer: {
    paddingVertical: 30,
    alignItems: "center",
  },
  footerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
  },
});
