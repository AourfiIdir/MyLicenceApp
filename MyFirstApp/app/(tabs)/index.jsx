import {
  View,
  Text,
  StyleSheet,
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Comic Header */}
        <View style={styles.header}>
          <View style={styles.comicBurst}>
            <Text style={styles.burstText}>WELCOME!</Text>
          </View>
          <Ionicons name="car" size={60} color="#FFF" />
          <Text style={styles.mainTitle}>Driver ²</Text>
          <Text style={styles.subtitle}>Master the Road</Text>
        </View>

        {/* Welcome Comic Card */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>HEY THERE! 👋</Text>
            <View style={styles.zigzag} />
          </View>
          <View style={styles.comicCard}>
            <Text style={styles.cardText}>
              Ready to become a driving master? Learn everything about road rules, safety guidelines, and driving regulations!
            </Text>
            <View style={styles.featureBullet}>
              <Text style={styles.bulletText}>⚡ Interactive Learning</Text>
            </View>
            <View style={styles.featureBullet}>
              <Text style={styles.bulletText}>⚡ Epic Quizzes</Text>
            </View>
            <View style={styles.featureBullet}>
              <Text style={styles.bulletText}>⚡ 100% Free Forever</Text>
            </View>
          </View>
        </View>

        {/* Stats Panels */}
        <View style={styles.statsContainer}>
          <View style={[styles.statPanel, { backgroundColor: '#FFE66D' }]}>
            <View style={styles.panelBorder}>
              <Ionicons name="book" size={40} color="#FF6B35" />
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>CARDS</Text>
            </View>
          </View>
          <View style={[styles.statPanel, { backgroundColor: '#4ECDC4' }]}>
            <View style={styles.panelBorder}>
              <Ionicons name="help-circle" size={40} color="#FFF" />
              <Text style={[styles.statNumber, { color: '#FFF' }]}>30</Text>
              <Text style={[styles.statLabel, { color: '#FFF' }]}>QUIZZES</Text>
            </View>
          </View>
          <View style={[styles.statPanel, { backgroundColor: '#34C759' }]}>
            <View style={styles.panelBorder}>
              <Ionicons name="heart" size={40} color="#FFF" />
              <Text style={[styles.statNumber, { color: '#FFF' }]}>∞</Text>
              <Text style={[styles.statLabel, { color: '#FFF' }]}>FREE!</Text>
            </View>
          </View>
        </View>

        {/* REVISE YOUR CARDS Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>REVISE YOUR CARDS</Text>
            <View style={styles.zigzag} />
          </View>
          <View style={styles.comicCard}>
            <View style={styles.featureRow}>
              <View style={styles.iconBadge}>
                <Ionicons name="refresh-circle" size={28} color="#FF6B35" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>📚 Study Mode</Text>
                <Text style={styles.featureDesc}>
                  Flip through cards and master the rules
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push({
                pathname: "/learningTest/quizlet",
                params: { source: "reviseList" },
              })}
            >
              <View style={styles.buttonInner}>
                <Ionicons name="play" size={20} color="#FFF" />
                <Text style={styles.buttonText}>START REVISING</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* STICK UR KNOWLEDGE Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>STICK UR KNOWLEDGE</Text>
            <View style={styles.zigzag} />
          </View>
          <View style={styles.comicCard}>
            <View style={styles.featureRow}>
              <View style={styles.iconBadge}>
                <Ionicons name="trophy" size={28} color="#34C759" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>🏆 Quiz Mode</Text>
                <Text style={styles.featureDesc}>
                  Test yourself with challenging questions
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#34C759' }]}
              onPress={() => router.push("/(tabs)/quiz")}
            >
              <View style={styles.buttonInner}>
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <Text style={styles.buttonText}>START QUIZ</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PRO TIPS</Text>
            <View style={styles.zigzag} />
          </View>
          <View style={styles.comicCard}>
            <View style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNum}>1</Text>
              </View>
              <Text style={styles.tipText}>Start with the Learn tab to understand rules</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNum}>2</Text>
              </View>
              <Text style={styles.tipText}>Take quizzes multiple times to improve</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNum}>3</Text>
              </View>
              <Text style={styles.tipText}>Focus on areas where you score lower</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNum}>4</Text>
              </View>
              <Text style={styles.tipText}>Practice makes perfect - keep learning!</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Drive Safe, Learn Smart! 🚗</Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 40,
    alignItems: "center",
    position: "relative",
    borderBottomWidth: 5,
    borderBottomColor: "#000",
  },
  comicBurst: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 80,
    height: 80,
    backgroundColor: "#FFE66D",
    transform: [{ rotate: "15deg" }],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 10,
  },
  burstText: {
    fontSize: 16,
    fontWeight: "black",
    color: "#000",
    transform: [{ rotate: "-15deg" }],
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: "black",
    color: "#FFF",
    marginTop: 15,
  },
  subtitle: {
    fontSize: 18,
    color: "#FFF8E1",
    marginTop: 5,
    fontWeight: "bold",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
    marginTop: 15,
  },
  sectionHeader: {
    marginBottom: 10,
    position: "relative",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "black",
    color: "#000",
    textTransform: "uppercase",
    backgroundColor: "#FFE66D",
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignSelf: "flex-start",
    borderWidth: 3,
    borderColor: "#000",
    transform: [{ rotate: "-2deg" }],
  },
  zigzag: {
    position: "absolute",
    bottom: -5,
    left: 10,
    width: 150,
    height: 5,
    backgroundColor: "#FF6B35",
  },
  comicCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    borderWidth: 4,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    fontWeight: "600",
    marginBottom: 15,
  },
  featureBullet: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000",
    marginBottom: 10,
  },
  bulletText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  statPanel: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: "#000",
    position: "relative",
  },
  panelBorder: {
    padding: 15,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "black",
    color: "#000",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "black",
    color: "#000",
    marginTop: 2,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFE66D",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000",
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "black",
    color: "#000",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  actionButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#000",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    elevation: 4,
  },
  buttonInner: {
    flexDirection: "row",
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "black",
    color: "#FFF",
    marginLeft: 8,
    textTransform: "uppercase",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    borderStyle: "dashed",
  },
  tipNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4ECDC4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000",
    marginRight: 12,
  },
  tipNum: {
    fontSize: 20,
    fontWeight: "black",
    color: "#FFF",
  },
  tipText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 30,
    alignItems: "center",
  },
  footerText: {
    fontSize: 18,
    fontWeight: "black",
    color: "#FF6B35",
  },
  spacer: {
    height: 30,
  },
});