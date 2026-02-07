import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Text,
  Modal,
  FlatList,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";

const API = Constants.expoConfig?.extra?.API || "http://localhost:3000";

export default function CardDetail() {
  const router = useRouter();
  const { cardId, category } = useLocalSearchParams();
  const { userToken, authFetch } = useAuth();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [marking, setMarking] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [lists, setLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [addingToList, setAddingToList] = useState(false);

  useEffect(() => {
    fetchCard();
  }, [cardId]);

  const fetchCard = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API}/card/${cardId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setCard(data);
      console.log(data.imageURI);
      checkCompletionStatus(data._id);
    } catch (error) {
      Alert.alert("Error", "Failed to load card");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkCompletionStatus = async (cardId) => {
    try {
      const res = await authFetch(`${API}/usertocard/status/${cardId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setIsCompleted(data.status === "completed");
    } catch (error) {
      console.error("Error checking completion:", error);
    }
  };

  const fetchLists = async () => {
    try {
      setLoadingLists(true);
      const res = await authFetch(`${API}/lists`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setLists(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load lists");
      console.error(error);
    } finally {
      setLoadingLists(false);
    }
  };

  const handleAddToList = () => {
    setShowListModal(true);
    fetchLists();
  };

  const addCardToList = async (listId) => {
    try {
      setAddingToList(true);
      const res = await authFetch(`${API}/listtocard/${listId}/${card._id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        
      });

      if (!res.ok) throw new Error("Failed to add card to list");

      Alert.alert("Success", "Card added to list! 🎉");
      setShowListModal(false);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to add card to list");
      console.error(error);
    } finally {
      setAddingToList(false);
    }
  };

  const markAsComplete = async () => {
    try {
      setMarking(true);
      const res = await fetch(`${API}/usertocard/complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId: card._id,
          status: isCompleted ? "uncomplete" : "completed",
        }),
      });

      if (!res.ok) throw new Error("Failed to update completion status");

      setIsCompleted(!isCompleted);
      Alert.alert(
        "Success",
        isCompleted ? "Card marked as incomplete" : "Card marked as complete! 🎉"
      );
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to mark card");
      console.error(error);
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  if (!card) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Card not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {card.name}
          </Text>
          {isCompleted && (
            <View style={styles.completeIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            </View>
          )}
        </View>

        {/* Comic Card Content */}
        <View style={styles.contentSection}>
          <View style={styles.comicCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{card.name}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{card.category}</Text>
              </View>
            </View>

            {card.imageURI && (
             <Image
               source={{ uri: card.imageURI }}
               style={styles.cardImage}
               resizeMode="contain"
                />

            )}

            {card.description && (
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionLabel}>ABOUT</Text>
                <Text style={styles.descriptionText}>{card.description}</Text>
              </View>
            )}

            {card.content && (
              <View style={styles.contentBox}>
                <Text style={styles.contentLabel}>KNOWLEDGE</Text>
                {typeof card.content === "string" ? (
                  <Text style={styles.contentText}>{card.content}</Text>
                ) : (
                  <>
                    {/* Meaning Section */}
                    {card.content.meaning && (
                      <View style={styles.knowledgeItem}>
                        <View style={styles.knowledgeIcon}>
                          <Ionicons name="bulb" size={20} color="#FFD93D" />
                        </View>
                        <View style={styles.knowledgeContent}>
                          <Text style={styles.knowledgeBold}>Signification</Text>
                          <Text style={styles.contentText}>{card.content.meaning}</Text>
                        </View>
                      </View>
                    )}

                    {/* Where Section */}
                    {card.content.where && (
                      <View style={styles.knowledgeItem}>
                        <View style={styles.knowledgeIcon}>
                          <Ionicons name="location" size={20} color="#FF6B35" />
                        </View>
                        <View style={styles.knowledgeContent}>
                          <Text style={styles.knowledgeBold}>Où</Text>
                          <Text style={styles.contentText}>{card.content.where}</Text>
                        </View>
                      </View>
                    )}

                    {/* Do Section */}
                    {card.content.do && (
                      <View style={styles.knowledgeItem}>
                        <View style={styles.knowledgeIcon}>
                          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                        </View>
                        <View style={styles.knowledgeContent}>
                          <Text style={styles.knowledgeBold}>À faire</Text>
                          <Text style={styles.contentText}>{card.content.do}</Text>
                        </View>
                      </View>
                    )}

                    {/* Mistake Section */}
                    {card.content.mistake && (
                      <View style={styles.knowledgeItem}>
                        <View style={styles.knowledgeIcon}>
                          <Ionicons name="warning" size={20} color="#FF3B30" />
                        </View>
                        <View style={styles.knowledgeContent}>
                          <Text style={styles.knowledgeBold}>Erreur fréquente</Text>
                          <Text style={styles.contentText}>{card.content.mistake}</Text>
                        </View>
                      </View>
                    )}

                    {/* Fallback for other content types */}
                    {card.content.topics && (
                      <Text style={styles.contentText}>
                        <Text style={styles.contentBold}>Topics:</Text>{" "}
                        {card.content.topics}
                      </Text>
                    )}
                    {card.content.level && (
                      <Text style={[styles.contentText, { marginTop: 8 }]}>
                        <Text style={styles.contentBold}>Level:</Text>{" "}
                        {card.content.level}
                      </Text>
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Buttons Container */}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.addListButton}
            onPress={handleAddToList}
            disabled={addingToList}
          >
            <Ionicons name="add-circle" size={24} color="#FFF" />
            <Text style={styles.addListButtonText}>ADD TO LIST</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.markButton,
              isCompleted && styles.markButtonCompleted,
            ]}
            onPress={markAsComplete}
            disabled={marking}
          >
            {marking ? (
              <ActivityIndicator color={isCompleted ? "#000" : "#FFF"} />
            ) : (
              <>
                <Ionicons
                  name={isCompleted ? "checkmark" : "checkmark-outline"}
                  size={24}
                  color={isCompleted ? "#000" : "#FFF"}
                />
                <Text
                  style={[
                    styles.buttonText,
                    isCompleted && styles.buttonTextCompleted,
                  ]}
                >
                  {isCompleted ? "MASTERED!" : "MARK AS DONE"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* List Modal */}
      <Modal
        visible={showListModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowListModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECT A LIST</Text>
              <TouchableOpacity onPress={() => setShowListModal(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            {loadingLists ? (
              <View style={styles.loadingModal}>
                <ActivityIndicator size="large" color="#FF6B35" />
              </View>
            ) : (
              <FlatList
                data={lists}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => addCardToList(item._id)}
                    disabled={addingToList}
                  >
                    <View style={styles.listItemContent}>
                      <Ionicons name="list" size={24} color="#FF6B35" />
                      <View style={styles.listItemText}>
                        <Text style={styles.listItemName}>{item.name}</Text>
                        <Text style={styles.listItemCount}>
                          {item.cardCount || 0} cards
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#999" />
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            )}

            <TouchableOpacity
              style={styles.createListButton}
              onPress={() => {
                setShowListModal(false);
                router.push("/list/create");
              }}
            >
              <Ionicons name="add" size={24} color="#FFF" />
              <Text style={styles.createListButtonText}>CREATE NEW LIST</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  header: {
    backgroundColor: "#FF6B35",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 5,
    borderBottomColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "black",
    color: "#000",
    flex: 1,
    marginHorizontal: 15,
  },
  completeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#34C759",
  },
  contentSection: {
    padding: 20,
  },
  comicCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    borderWidth: 4,
    borderColor: "#000",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 3,
    borderBottomColor: "#000",
    borderStyle: "dashed",
  },
  cardName: {
    fontSize: 24,
    fontWeight: "black",
    color: "#000",
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#000",
    transform: [{ rotate: "-2deg" }],
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "black",
    color: "#000",
    textTransform: "uppercase",
  },
  cardImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#000",
    backgroundColor: "#FFF",
  },
  descriptionBox: {
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#FF6B35",
    padding: 15,
    marginBottom: 15,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: "black",
    color: "#FF6B35",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  descriptionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    fontWeight: "500",
  },
  contentBox: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#34C759",
    padding: 15,
  },
  contentLabel: {
    fontSize: 12,
    fontWeight: "black",
    color: "#34C759",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  contentText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    fontWeight: "500",
  },
  contentBold: {
    fontWeight: "black",
    color: "#34C759",
  },
  knowledgeItem: {
    flexDirection: "row",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#C8E6C9",
    borderStyle: "dashed",
  },
  knowledgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  knowledgeContent: {
    flex: 1,
  },
  knowledgeBold: {
    fontSize: 13,
    fontWeight: "black",
    color: "#34C759",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  spacer: {
    height: 100,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 3,
    borderTopColor: "#000",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  addListButton: {
    flex: 0.35,
    backgroundColor: "#4ECDC4",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#000",
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  addListButtonText: {
    fontSize: 12,
    fontWeight: "black",
    color: "#FFF",
    marginLeft: 6,
    textTransform: "uppercase",
  },
  markButton: {
    flex: 0.65,
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#000",
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  markButtonCompleted: {
    backgroundColor: "#34C759",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "black",
    color: "#FFF",
    marginLeft: 6,
    textTransform: "uppercase",
  },
  buttonTextCompleted: {
    color: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF8E1",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 4,
    borderTopColor: "#000",
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: "#000",
    borderStyle: "dashed",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "black",
    color: "#000",
  },
  loadingModal: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#EEE",
  },
  listItemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  listItemText: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  listItemCount: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  createListButton: {
    marginHorizontal: 20,
    marginTop: 15,
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#000",
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  createListButtonText: {
    fontSize: 14,
    fontWeight: "black",
    color: "#FFF",
    marginLeft: 8,
    textTransform: "uppercase",
  },
});