import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from '@env';

const Account = () => {
  const [hasToken, setHasToken] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchStoredData = async () => {
    try {
      const token = await SecureStore.getItemAsync('jwtToken');
      const storedUserId = await SecureStore.getItemAsync('userId');
      const storedUserName = await SecureStore.getItemAsync('userName');

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

  const fetchFriends = async (userId) => {
    try {
      const token = await SecureStore.getItemAsync('jwtToken');
      const response = await fetch(`${BACKEND_URL}/api/v1/users/${userId}/friendships`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }

      const data = await response.json();
      setFriends(data);
    } catch (error) {
      Alert.alert('Error', 'Error al obtener la lista de amigos.');
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('jwtToken');
      await SecureStore.deleteItemAsync('userId');
      await SecureStore.deleteItemAsync('userName');
      setHasToken(false);
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión. Inténtalo de nuevo.');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Reload data every time screen is focused
      fetchStoredData();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.promptText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hasToken && (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <>
              <Text style={styles.welcomeText}>Bienvenido, {userName}.</Text>
              <Text style={styles.friendsTitle}>Tus amigos:</Text>
            </>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.friendItem}>
              <Text style={styles.friendName}>{item.first_name} {item.last_name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.noFriendsText}>No tienes amigos agregados.</Text>}
          ListFooterComponent={
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f1f4f7',
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
  logoutButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FF5733',
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  logoutButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Account;
