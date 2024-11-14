import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from '@env';
import * as SecureStore from 'expo-secure-store';

const Home = () => {
  const [feedData, setFeedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all'); // Filter state
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
      const beers = await fetchData(`${BACKEND_URL}/api/v1/beers`);
      
      setUsers(usersData.users);

      const beersById = beers.beers.reduce((acc, beer) => ({ ...acc, [beer.id]: beer }), {});

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
    if (selectedFilter === 'all') return true;
    return item.type === selectedFilter;
  });

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
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
      <View style={styles.buttonGroupContainer}>
        <TouchableOpacity onPress={() => handleFilterChange('all')}>
          <Text style={[styles.navButtonText, selectedFilter === 'all' && styles.selectedButtonText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFilterChange('event_picture')}>
          <Text style={[styles.navButtonText, selectedFilter === 'event_picture' && styles.selectedButtonText]}>
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleFilterChange('review')}>
          <Text style={[styles.navButtonText, selectedFilter === 'review' && styles.selectedButtonText]}>
            Reviews
          </Text>
        </TouchableOpacity>
      </View>
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
    color: '#2E2E42',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewText: {
    marginBottom: 5,
  },
  reviewRating: {
    fontWeight: 'bold',
  },
  reviewerHandle: {
    fontStyle: 'italic',
    color: '#888',
  },
  buttonGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingTop: 5,
    paddingBottom: 5,
    padding: 0,
    borderRadius: 16,
    backgroundColor: '#525277',
  },
  selectedButtonText: {
    color: '#fff',
  },
});

export default Home;




