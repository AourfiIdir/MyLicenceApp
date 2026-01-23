import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { cardImages } from '../constants/images';

export default function Card({ name, description, category, content, type, onAnswer }) {
  // Load image from registry based on card name
  const getImageSource = () => {
    const imageName = name.toLowerCase().replace(/\s+/g, '_');
    return cardImages[imageName] || null;
  };

  const imageSource = getImageSource();

  // Get gradient colors based on category
  const getCategoryGradient = () => {
    const gradients = {
      "Traffic Signs": ["#667eea", "#764ba2"],
      "Priority": ["#f093fb", "#f5576c"],
      "Safety": ["#4facfe", "#00f2fe"],
      "Penalties": ["#fa709a", "#fee140"],
      "Overtaking": ["#30cfd0", "#330867"],
      "Parking": ["#a8edea", "#fed6e3"],
      default: ["#667eea", "#764ba2"]
    };
    return gradients[category] || gradients.default;
  };

  // Render different content based on card type
  const renderContent = () => {
    switch (type) {
      case "quiz":
        return (
          <View style={styles.quizContainer}>
            {/* Display image if exists */}
            {imageSource && (
              <Image source={imageSource} style={styles.cardImage} />
            )}
            <Text style={styles.question}>{content.question}</Text>
            {content.suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.suggestionButton,
                  content.selectedAnswer === index && styles.suggestionSelected,
                  content.showResult && index === content.correctAnswer && styles.suggestionCorrect,
                  content.showResult && content.selectedAnswer === index && index !== content.correctAnswer && styles.suggestionWrong,
                ]}
                onPress={() => onAnswer && onAnswer(index)}
                disabled={content.showResult}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
            {content.showResult && content.explanation && (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationText}>{content.explanation}</Text>
              </View>
            )}
          </View>
        );

      case "learning":
        const gradientColors = getCategoryGradient();
        return (
          <View style={styles.learningCard}>
            {/* Image with gradient overlay */}
            {imageSource && (
              <View style={styles.imageContainer}>
                <Image source={imageSource} style={styles.learningImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.imageOverlay}
                />
              </View>
            )}
            
            {/* Content Section */}
            <View style={styles.learningContent}>
              {/* Category Badge */}
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.learningCategoryBadge}
              >
                <Text style={styles.learningCategoryText}>{category}</Text>
              </LinearGradient>

              {/* Title */}
              <Text style={styles.learningTitle}>{name}</Text>

              {/* Description */}
              <Text style={styles.learningDescription}>{description}</Text>

              {/* Sections or Key-Value Pairs */}
              <View style={styles.learningBody}>
                {content.sections ? (
                  content.sections.map((section, index) => (
                    <View key={index} style={styles.learningSection}>
                      <View style={styles.sectionHeader}>
                        <View style={[styles.sectionDot, { backgroundColor: gradientColors[0] }]} />
                        <Text style={styles.learningSectionTitle}>{section.title}</Text>
                      </View>
                      <Text style={styles.learningSectionContent}>{section.content}</Text>
                    </View>
                  ))
                ) : (
                  Object.entries(content).map(([key, value], index) => (
                    <View key={key} style={styles.learningInfoRow}>
                      <View style={styles.infoIconContainer}>
                        <LinearGradient
                          colors={gradientColors}
                          style={styles.infoIcon}
                        >
                          <Text style={styles.infoIconText}>{index + 1}</Text>
                        </LinearGradient>
                      </View>
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.learningInfoKey}>{key}</Text>
                        <Text style={styles.learningInfoValue}>{value}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.defaultContainer}>
            <Text style={styles.defaultText}>Unknown type: {type}</Text>
            <Text style={styles.defaultText}>{JSON.stringify(content, null, 2)}</Text>
          </View>
        );
    }
  };

  if (type === "learning") {
    return renderContent();
  }

  return (
    <View style={styles.card}>
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{category}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  // ... keep all your existing styles
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  cardImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: "contain",
  },
  quizContainer: {
    marginTop: 8,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  suggestionButton: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  suggestionSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  suggestionCorrect: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  suggestionWrong: {
    borderColor: "#F44336",
    backgroundColor: "#FFEBEE",
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
  },
  explanationContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  explanationText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  learningCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  imageContainer: {
    width: "100%",
    height: 240,
    position: "relative",
  },
  learningImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  learningContent: {
    padding: 20,
  },
  learningCategoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  learningCategoryText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  learningTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
    lineHeight: 30,
  },
  learningDescription: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
    lineHeight: 22,
  },
  learningBody: {
    marginTop: 8,
  },
  learningSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  learningSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  learningSectionContent: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
    paddingLeft: 18,
  },
  learningInfoRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  infoIconContainer: {
    marginRight: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  infoIconText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  infoTextContainer: {
    flex: 1,
  },
  learningInfoKey: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  learningInfoValue: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  defaultContainer: {
    marginTop: 8,
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
});