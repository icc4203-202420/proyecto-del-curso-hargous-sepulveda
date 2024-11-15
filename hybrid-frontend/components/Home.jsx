import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, FlatList, Modal, Button, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from '@env';
import { Icon } from 'react-native-elements';
const Home = () => {
  const [feedData, setFeedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedBars, setFeedBars] = useState([]);
  const [feedCountries, setFeedCountries] = useState([]);
  const [users, setUsers] = useState([]);
  const [beers, setBeers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [selectedBeers, setSelectedBeers] = useState([]);
  const [selectedBars, setSelectedBars] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([])
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const fetchData = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Request failed, status: ${response.status}`);
    return await response.json();
  };

  const fetchFeed = async () => {
    try {
      const userId = await SecureStore.getItemAsync('userId');
      setLoading(true);

      const data = await fetchData(`${BACKEND_URL}/api/v1/feed/${userId}`);
      const usersResponse = await fetch(`${BACKEND_URL}/api/v1/users/search`);
      const usersData = await usersResponse.json();
      const beersResponse = await fetch(`${BACKEND_URL}/api/v1/beers`);
      const beersData = await beersResponse.json();
      const friendsResponse = await fetch(`${BACKEND_URL}/api/v1/users/${parseInt(userId)}/friendships`);
      const friendsData = await friendsResponse.json();
      
      setFriends(friendsData);
      setUsers(usersData.users);
      setBeers(beersData.beers);

      const beersById = beersData.beers.reduce((acc, beer) => ({ ...acc, [beer.id]: beer }), {});

      const reviewsWithBeer = data.reviews.map(review => ({
        ...review,
        beer_name: beersById[review.beer_id]?.name || 'Unknown Beer',
        type: 'review',
        created_at: review.created_at,
      }));

      const combinedFeed = [
        ...reviewsWithBeer,
        ...data.event_pictures.map(item => ({ ...item, type: 'event_picture', created_at: item.created_at })),
      ];

      const sortedFeed = combinedFeed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setFeedData(sortedFeed);
      const eventPictures = sortedFeed.filter(item => item.type === "event_picture");

      const uniqueBars = [
        ...new Map(eventPictures.map(item => [item.bar_id, item])).values()
      ];
      const uniqueCountries = [
        ...new Map(eventPictures.map(item => [item.country_id, item])).values()
      ];     
      setFeedBars(uniqueBars);
      setFeedCountries(uniqueCountries);
  

    } catch (error) {
      console.error('Error fetching feed data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeed();
    }, [])
  );

  const handleUserPress = (id) => {
    navigation.navigate('UserProfile', { id });
  };

  const handleBeerPress = (id) => {
    navigation.navigate('Beer', { id });
  };

  const handleEventPress = (id) => {
    navigation.navigate('EventDetails', { id });
  };

  const renderDescriptionWithTags = (description) => {
    const tagRegex = /@([\w.]+)/g;
    const parts = description.split(tagRegex);

    return (
      <Text>
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            const username = part;
            const user = users.find((user) => user.handle === username);
            const tagId = user ? user.id : null;
            return (
              <TouchableOpacity key={index} onPress={() => handleUserPress(tagId)}>
                <Text style={{ color: 'blue' }}>{`@${username}`}</Text>
              </TouchableOpacity>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  const filteredData = feedData?.filter((item) => {
    if (selectedFriends.length > 0 && !selectedFriends.includes(item.user_id)) return false;
    
    if (selectedBeers.length > 0 && !selectedBeers.includes(item.beer_id)) return false;
  
    if (selectedBars.length > 0 && !selectedBars.includes(item.event_bar_id)) return false;
    
    if (selectedCountries.length > 0 && !selectedCountries.includes(item.country_id)) return false;
  
    return true;
  });
  const toggleFriendSelection = (friendId) => {
    setSelectedFriends((prevState) =>
      prevState.includes(friendId) ? prevState.filter(id => id !== friendId) : [...prevState, friendId]
    );
  };

  const toggleBeerSelection = (beerId) => {
    setSelectedBeers((prevState) =>
      prevState.includes(beerId) ? prevState.filter(id => id !== beerId) : [...prevState, beerId]
    );
  };
  const toggleBarSelection = (barId) => {
    setSelectedBars((prevState) =>
      prevState.includes(barId) ? prevState.filter(event_bar_id => event_bar_id !== barId) : [...prevState, barId]
    );
  };

  const toggleCountrySelection = (countryId) => {
    console.log(countryId);
    setSelectedCountries((prevState) =>
      prevState.includes(countryId) ? prevState.filter(country_id => country_id !== countryId) : [...prevState, countryId]
    );
  };

  const resetFilters = () => {
    setSelectedFriends([]);
    setSelectedBeers([]);
    setSelectedBars([]);
    setSelectedCountries([]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    if (item.type === 'review') {
      const reviewer = users.find(user => user.id === item.user_id);
      return (
        <TouchableOpacity onPress={() => handleBeerPress(item.beer_id)}>
          <View key={item.id} style={styles.card}>
            <Text style={styles.reviewRating}>Cerveza: {item.beer_name}</Text>
            <Text style={styles.reviewText}>{item.text}</Text>
            <Text style={styles.reviewRating}>Calificación: {item.rating}</Text>
            <Text style={styles.reviewerHandle}>Autor: {reviewer ? reviewer.handle : 'Desconocido'}</Text>
          </View>
        </TouchableOpacity>
      );
    } else if (item.type === 'event_picture') {
      const autor = users.find(user => user.id === item.user_id);
      return (
        <TouchableOpacity onPress={() => handleEventPress(item.event_id)}>
          <View key={item.id} style={styles.card}>
            <Text style={styles.reviewerHandle}>Autor: {autor ? autor.handle : 'Desconocido'}</Text>
            <Text style={styles.reviewRating}>Evento: {item.event_name}</Text>
            <Text style={styles.reviewRating}>Bar: {item.bar_name}</Text>
            <Image source={{ uri: item.flyer_urls[0] }} style={{ width: 200, height: 200 }} />
            <Text>{renderDescriptionWithTags(item.description)}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Feed</Text>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Icon name="filter" type="font-awesome" size={24} color="white" style={styles.filterButton}/>
      </TouchableOpacity>

      <Modal
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => {
            setModalVisible(false);
            resetFilters();  
          }}
        >
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalHeader}>Select Friends</Text>
              {friends.map(user => (
                <TouchableOpacity
                  key={user.id}
                  onPress={() => toggleFriendSelection(user.id)}
                  style={[styles.friendItem, selectedFriends.includes(user.id) && styles.selectedItem]}
                >
                  <Text>{user.handle}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.modalHeader}>Select Beers</Text>
              {beers.map(beer => (
                <TouchableOpacity
                  key={beer.id}
                  onPress={() => toggleBeerSelection(beer.id)}
                  style={[styles.beerItem, selectedBeers.includes(beer.id) && styles.selectedItem]}
                >
                  <Text>{beer.name}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.modalHeader}>Select Bars</Text>
              {feedBars.map(bar => (
                <TouchableOpacity
                  key={bar.event_bar_id}
                  onPress={() => toggleBarSelection(bar.event_bar_id)}
                  style={[styles.beerItem, selectedBars.includes(bar.event_bar_id) && styles.selectedItem]}
                >
                  <Text>{bar.bar_name}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.modalHeader}>Select Country</Text>
              {feedCountries.map(country => (
                <TouchableOpacity
                  key={country.country_id}
                  onPress={() => toggleCountrySelection(country.country_id)}
                  style={[styles.beerItem, selectedCountries.includes(country.country_id) && styles.selectedItem]}
                >
                  <Text>{country.country_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button title="Apply Filters" onPress={() => setModalVisible(false)} />
            <Button title="Close Filters" onPress={() => setModalVisible(false)} color="red" />
            <Button title="Reset Filters" onPress={resetFilters} color="gray" />
          </View>
        </Modal>

      {filteredData && (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => `${item.type}-${item.id || index}`}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2E2E42',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  filterButton: {
    backgroundColor: '#525277',
    borderRadius: 50,
    padding: 10,
    alignSelf:"flex-end"

  },
  card: {
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    elevation: 3,
  },
  navButtonText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewRating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
  },
  reviewerHandle: {
    fontSize: 12,
    color: 'gray',
  },
  selectedItem: {
    backgroundColor: '#d3d3d3',
  },
  friendItem: {
    padding: 10,
  },
  beerItem: {
    padding: 10,
  },
});

export default Home;





