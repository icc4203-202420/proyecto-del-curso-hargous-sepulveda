import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@env';

const Account = () => {
  const [hasToken, setHasToken] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true); 
  const navigation = useNavigation();

  useEffect(() => {
    const fetchStoredData = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedUserName = await AsyncStorage.getItem('userName');

        if (token && storedUserId && storedUserName) {
          setHasToken(true);
          setUserId(storedUserId);
          setUserName(storedUserName);
          fetchFriends(storedUserId);
        } else {
          setHasToken(false);
          navigation.navigate('Login');
        }
      } catch (error) {
        Alert.alert('Error', 'Error al recuperar la información.');
      } finally {
        setLoading(false); 
      }
    };

    fetchStoredData();
  }, [navigation]);

  const fetchFriends = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`${BACKEND_URL}/api/v1/users/${userId}/friendships`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setFriends(data);
    } catch (error) {
      Alert.alert('Error', 'Error al obtener la lista de amigos.');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('jwtToken');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('userName');
      setHasToken(false);
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.promptText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hasToken ? (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.welcomeText}>Bienvenido, {userName}.</Text>
          <Text style={styles.friendsTitle}>Tus amigos:</Text>
          {friends.length > 0 ? (
            <FlatList
              data={friends}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.friendItem}>
                  <Text style={styles.friendName}>{item.first_name} {item.last_name}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.noFriendsText}>No tienes amigos agregados.</Text>
          )}
          <Button title="Cerrar sesión" onPress={handleLogout} color="#FF5733" />
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f1f4f7',
  },
  scrollContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  friendsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  friendItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
    alignItems: 'flex-start',
  },
  friendName: {
    fontSize: 16,
    color: '#333',
  },
  noFriendsText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  promptText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Account;
