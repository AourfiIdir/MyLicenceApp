import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_API } from '../../constants/constants';
const API = BACKEND_API;

const Profile = () => {
  const { logout, userToken, authFetch } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [progress, setProgress] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // First, fetch user data
      const userRes = await authFetch(`${API}/user/currentUser`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!userRes.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const user = await userRes.json();
      console.log('User Data:', user);
      setUserData(user);

      // Check if user._id exists
      if (!user._id) {
        throw new Error('User ID not found');
      }

      // Then fetch progress with the user ID
      const progressRes = await authFetch(`${API}/progress/user`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        console.log('Progress Data:', progressData);
        setProgress(Array.isArray(progressData) ? progressData : []);
      }

      // Then fetch mistakes with the user ID
      const mistakesRes = await fetch(`${API}/mistake/myMistakes/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (mistakesRes.ok) {
        const mistakesData = await mistakesRes.json();
        console.log('Mistakes Data:', mistakesData);
        setMistakes(Array.isArray(mistakesData.mistakes) ? mistakesData.mistakes : []);
      }

    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert("Error", error.message || "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const getTotalPoints = () => {
    return progress.reduce((sum, p) => sum + p.points, 0);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Comic Header */}
      <View style={styles.header}>
        <View style={styles.comicBurst}>
          <Text style={styles.burstText}>POW!</Text>
        </View>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {userData?.nom?.charAt(0)}{userData?.prenom?.charAt(0)}
            </Text>
          </View>
          <View style={styles.avatarShadow} />
        </View>
        <View style={styles.speechBubble}>
          <Text style={styles.name}>{userData?.nom} {userData?.prenom}</Text>
          <Text style={styles.username}>@{userData?.username}</Text>
          <View style={styles.bubbleTail} />
        </View>
      </View>

      {/* Comic Stats Panels */}
      <View style={styles.statsContainer}>
        <View style={[styles.statPanel, { backgroundColor: '#FFE66D' }]}>
          <View style={styles.panelBorder}>
            <Ionicons name="trophy" size={40} color="#FF6B35" />
            <Text style={styles.statNumber}>{getTotalPoints()}</Text>
            <Text style={styles.statLabel}>POINTS!</Text>
            <View style={styles.starBurst}>
              <Text style={styles.starText}>⭐</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.statPanel, { backgroundColor: '#FF6B6B' }]}
          onPress={() => router.push('/(tabs)/quiz/all-mistakes')}
          activeOpacity={0.7}
        >
          <View style={styles.panelBorder}>
            <Ionicons name="close-circle" size={40} color="#FFF" />
            <Text style={[styles.statNumber, { color: '#FFF' }]}>{mistakes.length}</Text>
            <Text style={[styles.statLabel, { color: '#FFF' }]}>OOPS!</Text>
          </View>
        </TouchableOpacity>
        <View style={[styles.statPanel, { backgroundColor: '#4ECDC4' }]}>
          <View style={styles.panelBorder}>
            <Ionicons name="checkmark-circle" size={40} color="#FFF" />
            <Text style={[styles.statNumber, { color: '#FFF' }]}>{progress.length}</Text>
            <Text style={[styles.statLabel, { color: '#FFF' }]}>WINS!</Text>
          </View>
        </View>
      </View>

      {/* User Info Comic Panel */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>HERO INFO</Text>
          <View style={styles.zigzag} />
        </View>
        <View style={styles.comicCard}>
          <InfoRow icon="mail" label="Email" value={userData?.email} />
          <InfoRow icon="location" label="Wilaya" value={userData?.wilaya} />
          <InfoRow icon="calendar" label="Age" value={userData?.age} />
          <InfoRow icon="person" label="Gender" value={userData?.sexe} />
        </View>
      </View>

      {/* Progress Comic Panel */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>QUEST LOG</Text>
          <View style={styles.zigzag} />
        </View>
        <View style={styles.comicCard}>
          {progress.length === 0 ? (
            <View style={styles.emptyPanel}>
              <Text style={styles.emptyText}>START YOUR ADVENTURE!</Text>
            </View>
          ) : (
            progress.map((p, index) => (
              <View key={index} style={styles.progressItem}>
                <View style={styles.progressBadge}>
                  <View style={styles.badgeBorder}>
                    <Text style={styles.progressType}>{p.type}</Text>
                  </View>
                </View>
                <View style={styles.pointsBurst}>
                  <Text style={styles.pointsText}>+{p.points}</Text>
                  <Text style={styles.boomText}>BOOM!</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Mistakes Comic Panel with "View All" button */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>VILLAIN STRIKES</Text>
          <View style={styles.zigzag} />
        </View>
        <View style={styles.comicCard}>
          {mistakes.length === 0 ? (
            <View style={styles.emptyPanel}>
              <Text style={styles.heroText}>🦸 FLAWLESS VICTORY! 🦸</Text>
            </View>
          ) : (
            <>
              {mistakes.slice(0, 5).map((mistake, index) => (
                <View key={index} style={styles.mistakeItem}>
                  <View style={styles.mistakeIcon}>
                    <Text style={styles.xText}>✗</Text>
                  </View>
                  <View style={styles.mistakeBubble}>
                    <Text style={styles.mistakeText} numberOfLines={2}>
                      {mistake.mistake}
                    </Text>
                  </View>
                </View>
              ))}
              {mistakes.length > 5 && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => router.push('/(tabs)/quiz/all-mistakes')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllText}>
                    Voir toutes les erreurs ({mistakes.length})
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      {/* Comic Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <View style={styles.buttonBorder}>
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.logoutText}>EXIT GAME</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <View style={styles.iconBadge}>
        <Ionicons name={icon} size={18} color="#FF6B35" />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 5,
    borderBottomColor: '#000',
  },
  comicBurst: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 70,
    height: 70,
    backgroundColor: '#FFE66D',
    transform: [{ rotate: '15deg' }],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  burstText: {
    fontSize: 18,
    fontWeight: 'black',
    color: '#000',
    transform: [{ rotate: '-15deg' }],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFE66D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#000',
    zIndex: 2,
  },
  avatarShadow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#000',
    top: 5,
    left: 5,
    zIndex: 1,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: 'black',
    color: '#FF6B35',
  },
  speechBubble: {
    backgroundColor: '#FFF',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#000',
    position: 'relative',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -15,
    left: '45%',
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#000',
  },
  name: {
    fontSize: 22,
    fontWeight: 'black',
    color: '#000',
    textAlign: 'center',
  },
  username: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    marginTop: -25,
    marginBottom: 25,
  },
  statPanel: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#000',
    position: 'relative',
  },
  panelBorder: {
    padding: 15,
    alignItems: 'center',
  },
  starBurst: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  starText: {
    fontSize: 24,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'black',
    color: '#000',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 'black',
    color: '#000',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    marginBottom: 10,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'black',
    color: '#000',
    textTransform: 'uppercase',
    backgroundColor: '#FFE66D',
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    borderWidth: 3,
    borderColor: '#000',
    transform: [{ rotate: '-2deg' }],
  },
  zigzag: {
    position: 'absolute',
    bottom: -5,
    left: 10,
    width: 150,
    height: 5,
    backgroundColor: '#FF6B35',
  },
  comicCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    borderWidth: 4,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    borderStyle: 'dashed',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE66D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    borderStyle: 'dashed',
  },
  progressBadge: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#000',
    transform: [{ rotate: '-2deg' }],
  },
  badgeBorder: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  progressType: {
    fontSize: 14,
    fontWeight: 'black',
    color: '#000',
  },
  pointsBurst: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 24,
    fontWeight: 'black',
    color: '#FF6B35',
  },
  boomText: {
    fontSize: 10,
    fontWeight: 'black',
    color: '#FF6B35',
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    borderStyle: 'dashed',
  },
  mistakeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
    marginRight: 12,
  },
  xText: {
    fontSize: 24,
    fontWeight: 'black',
    color: '#FFF',
  },
  mistakeBubble: {
    flex: 1,
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
  },
  mistakeText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 10,
    backgroundColor: '#FFE66D',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#000',
    gap: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: 'black',
    color: '#FF6B35',
  },
  emptyPanel: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'black',
    color: '#FF6B35',
  },
  heroText: {
    fontSize: 16,
    fontWeight: 'black',
    color: '#4ECDC4',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FF6B6B',
    borderRadius: 15,
    borderWidth: 4,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  buttonBorder: {
    flexDirection: 'row',
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'black',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  spacer: {
    height: 30,
  },
});