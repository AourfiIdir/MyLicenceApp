import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useState } from "react";

const questions = [
  // ...existing questions...
];

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswer = (correct, index) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(index);
    if (correct) setScore(score + 1);
  };

  const nextQuestion = () => {
    setAnswered(false);
    setSelectedAnswer(null);
    setCurrent(current + 1);
  };

  const resetQuiz = () => {
    setCurrent(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
  };

  if (current >= questions.length) {
    const percentage = Math.round((score / questions.length) * 100);
    let resultMessage = "";
    let resultColor = "#000";

    if (percentage === 100) {
      resultMessage = "🏆 Perfect Score! You're ready to drive!";
      resultColor = "#34C759";
    } else if (percentage >= 80) {
      resultMessage = "🎉 Great Job! Keep practicing!";
      resultColor = "#34C759";
    } else if (percentage >= 60) {
      resultMessage = "👍 Good Effort! Review the material and try again.";
      resultColor = "#FF9500";
    } else {
      resultMessage = "📚 Keep Learning! Go back and study more.";
      resultColor = "#FF3B30";
    }

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Quiz Completed!</Text>
            <Text style={[styles.resultMessage, { color: resultColor }]}>
              {resultMessage}
            </Text>
            <Text style={styles.scoreText}>
              Your Score: {score}/{questions.length}
            </Text>
            <Text style={styles.percentageText}>{percentage}%</Text>
            <View style={styles.scoreBar}>
              <View
                style={[
                  styles.scoreProgress,
                  { width: `${percentage}%`, backgroundColor: resultColor },
                ]}
              />
            </View>
          </View>
          <TouchableOpacity style={styles.restartButton} onPress={resetQuiz}>
            <Text style={styles.buttonNextText}>Restart Quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const q = questions[current];
  const progress = Math.round(((current + 1) / questions.length) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Practice Quiz</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>LEARN & TEST</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Question {current + 1} of {questions.length}
          </Text>
        </View>

        {/* Score Display */}
        <View style={styles.scoreDisplay}>
          <Text style={styles.currentScore}>Score: {score}</Text>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.question}>{q.question}</Text>
        </View>

        {/* Answer Options */}
        <View style={styles.answersContainer}>
          {q.answers.map((a, i) => {
            const isSelected = selectedAnswer === i;
            const isCorrect = a.correct && answered;
            const isWrongSelected = answered && isSelected && !a.correct;

            const buttonStyle = [
              styles.button,
              isCorrect && styles.buttonCorrect,
              isWrongSelected && styles.buttonIncorrect,
            ];
            const buttonTextStyle = [
              styles.buttonText,
              (isSelected || isCorrect || isWrongSelected) && styles.buttonTextSelected,
            ];

            return (
              <TouchableOpacity
                key={i}
                style={buttonStyle}
                disabled={answered}
                onPress={() => handleAnswer(a.correct, i)}
              >
                <Text style={buttonTextStyle}>{a.text}</Text>
                {answered && isSelected && (
                  <Text style={styles.feedbackEmoji}>{a.correct ? "✓" : "✗"}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Next Button */}
        {answered && (
          <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
            <Text style={styles.buttonNextText}>
              {current === questions.length - 1 ? "See Results" : "Next Question"}
            </Text>
          </TouchableOpacity>
        )}
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
    paddingTop: 40,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 4,
    borderBottomColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000",
    marginBottom: 6,
  },
  headerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  headerBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: "#FFF",
    margin: 16,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  progressBar: {
    height: 12,
    backgroundColor: "#FFE7D6",
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#000",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6B35",
  },
  progressText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    fontWeight: "700",
  },
  scoreDisplay: {
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: "center",
  },
  currentScore: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
    backgroundColor: "#FFD166",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  questionCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 18,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  question: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    lineHeight: 28,
    textAlign: "center",
  },
  answersContainer: {
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  button: {
    backgroundColor: "#FFF",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 3,
    borderColor: "#000",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  buttonCorrect: {
    backgroundColor: "#E8F5E9",
    shadowColor: "#34C759",
  },
  buttonIncorrect: {
    backgroundColor: "#FFEBEE",
    shadowColor: "#FF3B30",
  },
  buttonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "800",
  },
  buttonTextSelected: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
  },
  feedbackEmoji: {
    fontSize: 20,
    fontWeight: "bold",
  },
  nextButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 22,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  buttonNextText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 0.5,
  },
  resultContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFF8E1",
  },
  resultCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 15,
    color: "#000",
  },
  resultMessage: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  scoreText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000",
    marginBottom: 15,
  },
  percentageText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#000",
    marginBottom: 20,
  },
  scoreBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#FFE7D6",
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#000",
    marginBottom: 20,
  },
  scoreProgress: {
    height: "100%",
    borderRadius: 6,
  },
  restartButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
});
