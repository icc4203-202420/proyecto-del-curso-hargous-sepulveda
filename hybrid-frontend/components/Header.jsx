import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function Header() {
  const [query, setQuery] = useState('');
  const navigation = useNavigation();
  const route = useRoute();

  const handleSearch = () => {
    // Navigate to the Beers screen with the search query as a parameter
    navigation.navigate('Beers', { searchQuery: query });
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for Beers, Bars, Events or Users"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {route.name !== 'Home' && (
        <View style={styles.buttonGroupContainer}>
          <Button onPress={() => navigation.navigate('Beers')} title="Beers" />
          <Button onPress={() => navigation.navigate('Bars')} title="Bars" />
          <Button onPress={() => navigation.navigate('Events')} title="Events" />
          <Button onPress={() => navigation.navigate('Users')} title="Users" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#525277',
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  searchInput: {
    backgroundColor: '#DBDBE0',
    color: '#49454F',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#A6A7B5',
    padding: 10,
    borderRadius: 5,
  },
  searchButtonText: {
    color: '#fff',
  },
  buttonGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
});





