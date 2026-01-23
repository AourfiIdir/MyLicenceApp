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
  {
    question: "What does a red traffic light mean?",
    answers: [
      { text: "Go if you're in a hurry", correct: false },
      { text: "Stop completely before the stop line", correct: true },
      { text: "Slow down and proceed", correct: false },
      { text: "Honk and go", correct: false },
    ],
  },
  {
    question: "What is the typical speed limit in city areas?",
    answers: [
      { text: "100 km/h", correct: false },
      { text: "80 km/h", correct: false },
      { text: "50 km/h", correct: true },
      { text: "120 km/h", correct: false },
    ],
  },
  {
    question: "Is wearing a seat belt mandatory?",
    answers: [
      { text: "Only on highways", correct: false },
      { text: "Yes, always", correct: true },
      { text: "Only for front seats", correct: false },
      { text: "No", correct: false },
    ],
  },
  {
    question: "What should you do at a roundabout?",
    answers: [
      { text: "Always go first", correct: false },
      { text: "Stop completely", correct: false },
      { text: "Yield to vehicles already in the circle", correct: true },
      { text: "Honk your horn", correct: false },
    ],
  },
  {
    question: "Can you use your mobile phone while driving?",
    answers: [
      { text: "Yes, if you're careful", correct: false },
      { text: "No, it's distracting and illegal", correct: true },
      { text: "Only for emergency calls", correct: false },
      { text: "Yes, if you use hands-free", correct: false },
    ],
  },
  {
    question: "What is the maximum speed on a highway?",
    answers: [
      { text: "80 km/h", correct: false },
      { text: "100-120 km/h", correct: true },
      { text: "60 km/h", correct: false },
      { text: "150 km/h", correct: false },
    ],
  },
  {
    question: "What should you do if you see a yellow light?",
    answers: [
      { text: "Accelerate and go", correct: false },
      { text: "Prepare to stop if safe", correct: true },
      { text: "Ignore it", correct: false },
      { text: "Go if no traffic is visible", correct: false },
    ],
  },
  {
    question: "Should you check your vehicle regularly?",
    answers: [
      { text: "No, it's unnecessary", correct: false },
      { text: "Yes, check lights, tires, and battery", correct: true },
      { text: "Only when it's broken", correct: false },
      { text: "Once a year is enough", correct: false },
    ],
  },
];

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswer = (correct, index) => {
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
            <Text style={styles.buttonText}>Restart Quiz</Text>
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
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
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
            let buttonStyle = styles.button;
            let buttonTextStyle = styles.buttonText;

            if (answered && selectedAnswer === i) {
              buttonStyle = a.correct
                ? styles.buttonCorrect
                : styles.buttonIncorrect;
              buttonTextStyle = styles.buttonTextSelected;
            }

            return (
              <TouchableOpacity
                key={i}
                style={buttonStyle}
                //disabled={answered}
                onPress={() => handleAnswer(a.correct, i)}
              >
                <Text style={buttonTextStyle}>{a.text}</Text>
                {answered && selectedAnswer === i && (
                  <Text style={styles.feedbackEmoji}>
                    {a.correct ? "✓" : "✗"}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Next Button */}
        {answered && (
          <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
            <Text style={styles.buttonText}>
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
    backgroundColor: "#F5F5F5",
  },
  progressContainer: {
    padding: 15,
    backgroundColor: "#FFF",
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  scoreDisplay: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  currentScore: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
  },
  questionCard: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    lineHeight: 28,
  },
  answersContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FFF",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonCorrect: {
    backgroundColor: "#E8F5E9",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: "#34C759",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonIncorrect: {
    backgroundColor: "#FFEBEE",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: "#FF3B30",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  buttonTextSelected: {
    fontSize: 16,
    fontWeight: "600",
  },
  feedbackEmoji: {
    fontSize: 20,
    fontWeight: "bold",
  },
  nextButton: {
    backgroundColor: "#34C759",
    paddingVertical: 16,
    marginHorizontal: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  resultContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  resultCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000",
  },
  resultMessage: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  scoreText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 15,
  },
  percentageText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 20,
  },
  scoreBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 20,
  },
  scoreProgress: {
    height: "100%",
    borderRadius: 6,
  },
  restartButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
});
