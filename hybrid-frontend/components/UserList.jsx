import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from '@env';
import Header from "./Header";

const UserList = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/users/search`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(data)
      setUsers(data.users);
    } catch (err) {
      console.error('Error fetching all users:', err);
      setError('Error fetching all users.');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!query.trim()) {
      fetchAllUsers(); 
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/users/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error fetching users.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (id) => {
    navigation.navigate('UserProfile', { id });
  };

  useEffect(() => {
    fetchAllUsers();
  }, []); 

  useEffect(() => {
    searchUsers();
  }, [query]); 

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleUserPress(item.id)} style={styles.userCard}>
      <View style={styles.cardContent}>
        <View style={styles.textContent}>
          <Text style={styles.userName}>{item.handle}</Text>
        </View>
        <Image
          source={{ uri: item.profile_image_url || 'https://via.placeholder.com/100' }}
          style={styles.userImage}
          resizeMode="cover"
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container1}>
      <Header onSearch={handleSearch} />
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : users.length > 0 ? (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        ) : (
          <Text style={styles.noResults}>No users found.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2E2E42',
  },
  container1: {
    flex: 1,
    padding: 0,
    backgroundColor: '#525277',
  },
  userCard: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 10,
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    color: '#555',
    marginTop: 2,
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  noResults: {
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default UserList;
