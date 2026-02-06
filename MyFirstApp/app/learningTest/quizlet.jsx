import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Constants from "expo-constants";
import { useAuth } from "../../contexts/AuthContext";

const { width } = Dimensions.get("window");
const API = process.env.EXPO_PUBLIC_API_URL || Constants.manifest.extra.apiUrl;

export default function QuizletTest() {
  const { listId, source } = useLocalSearchParams();
  const router = useRouter();
  const { authFetch } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const x = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);

      try {
        let cards = [];

        if (source === "userList") {
          const listRes = await authFetch(`${API}/lists/${listId}`);
          const listJson = await listRes.json();

          if (!Array.isArray(listJson.cards) || listJson.cards.length === 0) {
            setCards([]);
            return;
          }

          const fetched = await Promise.all(
            listJson.cards
              .filter(Boolean)
              .map(async (cardId) => {
                const res = await authFetch(`${API}/card/${cardId}`);
                if (!res.ok) return null;
                return res.json();
              })
          );

          cards = fetched.filter(Boolean);
        }

        if (source === "reviseList") {
          const hitRes = await authFetch(`${API}/usertocard/hitCards`);
          const hitJson = await hitRes.json();

          if (!Array.isArray(hitJson.cards) || hitJson.cards.length === 0) {
            setCards([]);
            return;
          }

          const fetched = await Promise.all(
            hitJson.cards.map(async (cardId) => {
              const res = await authFetch(`${API}/card/${cardId}`);
              if (!res.ok) return null;
              return res.json();
            })
          );

          cards = fetched.filter(Boolean);
        }

        setCards(cards);
      } catch (err) {
        console.error("fetchCards error:", err);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [listId, source, authFetch]);

  const handleSwipeRight = async (cardId) => {
    try {
      await authFetch(`${API}/usertocard/hitCards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dec" }),
      });
    } catch (err) {
      console.error("Right swipe request failed:", err);
    }
  };

  const handleSwipeLeft = async (cardId) => {
    try {
      await authFetch(`${API}/usertocard/hitCards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "inc" }),
      });
    } catch (err) {
      console.error("Left swipe request failed:", err);
    }
  };

  const swipe = (dir) => {
    x.value = withTiming(dir * width, { duration: 200 }, () => {
      runOnJS(nextCard)();
    });
  };

  const nextCard = () => {
    x.value = 0;
    rotate.value = 0;
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  // Tap gesture to reveal card
  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(setRevealed)((prev) => !prev);
  });

  // Pan gesture for swiping
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
      rotate.value = interpolate(x.value, [-200, 200], [-10, 10]);
    })
    .onEnd(() => {
      if (x.value > 120) {
        runOnJS(handleSwipeRight)(cards[index]?._id);
        swipe(1);
      } else if (x.value < -120) {
        runOnJS(handleSwipeLeft)(cards[index]?._id);
        swipe(-1);
      } else {
        x.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  // Combine gestures
  const gesture = Gesture.Simultaneous(pan, tap);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { rotate: `${rotate.value}deg` },
      { scale: interpolate(Math.abs(x.value), [0, 200], [1, 0.95]) },
    ],
  }));

  const rightSideStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.max(0, x.value), [0, 120], [0, 1]),
  }));

  const leftSideStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.min(0, x.value), [0, -120], [0, 1]),
  }));

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading cards…</Text>
      </View>
    );
  }

  if (!cards[index]) {
    return (
      <View style={styles.emptyScreen}>
        <Text style={styles.emptyTitle}>Test Completed 🎉</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => router.replace(`/`)}>
          <Text style={styles.emptyBtnText}>Back to list</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const card = cards[index];

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.card, style]}>
          <Animated.View style={[styles.sideIndicator, styles.leftIndicator, leftSideStyle]} />
          <Animated.View style={[styles.sideIndicator, styles.rightIndicator, rightSideStyle]} />

          <View style={styles.cardInner}>
            {!revealed ? (
              <Image source={{ uri: card.imageURI }} style={styles.image} />
            ) : (
              <Text style={styles.answer}>{card.name}</Text>
            )}
          </View>
        </Animated.View>
      </GestureDetector>

      <Text style={styles.hint}>👈 Dont know · Tap · Know 👉</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8E1", justifyContent: "center", alignItems: "center" },
  card: {
    width: "85%",
    height: 420,
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 5,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    overflow: "hidden",
  },
  cardInner: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "90%", height: "90%", resizeMode: "contain" },
  answer: { fontSize: 30, fontWeight: "black", textAlign: "center" },
  sideIndicator: { position: "absolute", top: 0, bottom: 0, width: "100%", zIndex: 10 },
  leftIndicator: { backgroundColor: "#FF6B6B" },
  rightIndicator: { backgroundColor: "#34C759" },
  hint: { marginTop: 30, fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { fontSize: 18, fontWeight: "bold" },
  emptyScreen: { flex: 1, backgroundColor: "#FFF8E1", justifyContent: "center", alignItems: "center", padding: 20 },
  emptyTitle: { fontSize: 26, fontWeight: "black", color: "#000", textAlign: "center", marginBottom: 30 },
  emptyBtn: {
    backgroundColor: "#FF6B35",
    borderWidth: 4,
    borderColor: "#000",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 26,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
  },
  emptyBtnText: { fontWeight: "black", fontSize: 16, color: "#FFF" },
});