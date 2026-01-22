import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";

const roadRules = [
  {
    category: "Traffic Lights",
    rules: [
      "🔴 Red Light: Stop completely before the stop line",
      "🟢 Green Light: Go if the road is clear",
      "🟡 Yellow Light: Prepare to stop, don't accelerate",
    ],
  },
  {
    category: "Safety Rules",
    rules: [
      "🪑 Seat Belt: Always wear seat belt while driving",
      "👨‍👩‍👦 Child Seats: Use appropriate child seats for young children",
      "📵 No Distractions: Never use phone while driving",
      "🚫 No Alcohol: Don't drive under the influence",
    ],
  },
  {
    category: "Speed Limits",
    rules: [
      "🏙️ City Areas: 50 km/h is typical speed limit",
      "🛣️ Highways: 100-120 km/h depending on road type",
      "🚌 School Zones: 40 km/h during school hours",
      "⛈️ Bad Weather: Reduce speed during rain or fog",
    ],
  },
  {
    category: "Parking Rules",
    rules: [
      "🚫 No Parking: Never park in no-parking zones",
      "♿ Disabled Spaces: Only disabled vehicles can use these",
      "🅿️ Perpendicular: Always park straight in parking spaces",
      "🔐 Lock Vehicle: Always lock your car when leaving",
    ],
  },
  {
    category: "Right of Way",
    rules: [
      "🔄 Roundabouts: Yield to vehicles already in the circle",
      "🚶 Pedestrians: Always give way to pedestrians",
      "🚒 Emergency: Allow emergency vehicles to pass",
      "🛣️ Side Roads: Main road vehicles have priority",
    ],
  },
  {
    category: "Vehicle Maintenance",
    rules: [
      "🔧 Regular Checks: Service your vehicle regularly",
      "💡 Lights: Ensure all lights are working",
      "🛞 Tires: Check tire pressure and tread depth",
      "🔋 Battery: Keep battery in good condition",
    ],
  },
];

export default function Learn() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>📚 Learning Guide</Text>
          <Text style={styles.subtitle}>Road Rules & Regulations</Text>
        </View>

        {roadRules.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{section.category}</Text>
            </View>
            {section.rules.map((rule, ruleIndex) => (
              <View key={ruleIndex} style={styles.ruleBox}>
                <Text style={styles.rule}>{rule}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            📖 Study these rules carefully to pass your driving test!
          </Text>
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
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: "#007AFF",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#E3F2FD",
  },
  section: {
    marginHorizontal: 12,
    marginBottom: 15,
  },
  categoryHeader: {
    backgroundColor: "#34C759",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  ruleBox: {
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rule: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    fontWeight: "500",
  },
  footer: {
    paddingVertical: 30,
    paddingHorizontal: 15,
    alignItems: "center",
    backgroundColor: "#FFF",
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  footerText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
});
