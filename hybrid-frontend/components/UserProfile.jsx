import React, { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StyleSheet, View, Text, Button, ActivityIndicator, TouchableOpacity, Modal, TextInput, FlatList, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Card } from "react-native-elements";
import { BACKEND_URL } from '@env';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';

const UserProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEventTitle, setSelectedEventTitle] = useState("");
  const [eventSuggestions, setEventSuggestions] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventError, setEventError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchUserDetailsAndReviews = async () => {
      try {
        const userResponse = await fetch(`${BACKEND_URL}/api/v1/users/${id}`);
        const userData = await userResponse.json();
        setUser(userData.user);
        const userId = await SecureStore.getItem('userId'); 
        setCurrentUserId(userId);
        const friendshipResponse = await fetch(`${BACKEND_URL}/api/v1/users/${userId}/friendships`);
        const friendshipData = await friendshipResponse.json();
        const isFriend = friendshipData.some(friend => friend.id === id);
        setIsFriend(isFriend);
        const reviewResponse = await fetch(`${BACKEND_URL}/api/v1/users/${id}/reviews`);
        const reviewData = await reviewResponse.json();
        console.log(reviewData);
        if (reviewData.reviews.length > 0) {
          const beerIds = [...new Set(reviewData.reviews.map((review) => review.beer_id))];
          const beerPromises = beerIds.map((beerId) =>
            fetch(`${BACKEND_URL}/api/v1/beers/${beerId}`)
              .then(res => res.json())
              .then(data => data.beer)
          );

          const beers = await Promise.all(beerPromises);
          const beerMap = {};
          beers.forEach((beer) => {
            if (beer) {
              beerMap[beer.id] = beer;
            }
          });

          const updatedReviews = reviewData.reviews.map((review) => ({
            ...review,
            beer: beerMap[review.beer_id] || { id: null, name: "Unknown Beer" },
          }));

          setReviews(updatedReviews);
        }

        const eventsResponse = await fetch(`${BACKEND_URL}/api/v1/events`);
        const eventsData = await eventsResponse.json();
        setEventSuggestions(eventsData.events);
        
        setLoadingUser(false);
        setLoadingEvents(false);
      } catch (error) {
        setErrorUser("Error fetching user details or reviews");
        setLoadingUser(false);
      }
    };

    fetchUserDetailsAndReviews();
  }, [id]);

  const handleAddFriend = () => {
    setModalVisible(true);
  };

  const handleConfirmAddFriend = async () => {
    const userId = await SecureStore.getItemAsync('userId');

    try {
      const requestData = {
        friend_id: id,
        event_id: selectedEventTitle || null,
      };
      await fetch(`${BACKEND_URL}/api/v1/users/${parseInt(userId)}/friendships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      setIsFriend(true);
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  const handleRemoveFriend = async () => {
    const userId = await SecureStore.getItemAsync('userId');

    try {
      await fetch(`${BACKEND_URL}/api/v1/users/${parseInt(userId)}/friendships`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friend_id: id }),
      });
      setIsFriend(false);
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  if (loadingUser) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.username}>@{user?.handle}</Text>
        <Text style={styles.name}>{user?.name || "N/A"}</Text>
        {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
        <TouchableOpacity onPress={isFriend ? handleRemoveFriend : handleAddFriend} style={styles.friendButton}>
          <Icon name={isFriend ? "person-remove" : "person-add"} size={24} style={styles.icon} />
          <Text style={styles.friendButtonText}>{isFriend ? "Remove Friend" : "Add Friend"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Reviews</Text>
      
        <FlatList
          data={reviews}
          keyExtractor={(review) => review.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <Text style={styles.reviewRating}>Rating: {item.rating}/5</Text>
              <Text style={styles.reviewText}>Beer: {item.beer?.name || "Unknown Beer"}</Text>
              <Text style={styles.reviewText}>{item.text}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyMessage}>{user.handle} hasn't left any reviews yet.</Text>}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />
      

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add Friend</Text>
            <TextInput
              placeholder="Select Event"
              style={styles.input}
              value={selectedEventTitle}
              onChangeText={setSelectedEventTitle}
            />
            <Button title="Confirm" onPress={handleConfirmAddFriend} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 10,
  },
  profileCard: {
    borderRadius: 10,
    padding: 15,
  },
  icon: {
    color: "#333",
  },
  friendButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  name: {
    fontSize: 16,
    color: "#555",
  },
  bio: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 10,
  },
  reviewCard: {
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    maxWidth: 300,
    maxHeight: 150
  },
  reviewText: {
    marginBottom: 5,
    whiteSpace: 'pre-wrap',
  },
  reviewRating: {
    fontWeight: 'bold',
  },
  emptyMessage: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)", // Dark overlay for modal
  },
  modalView: {
    width: "80%",
    padding: 20,
    backgroundColor: "white", // White background for the modal content
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
});

export default UserProfile;



