import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

export default function Header({ onSearch }) { 
  const [query, setQuery] = useState('');
  const navigation = useNavigation();
  const route = useRoute();

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query); 
    }
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
          <Icon name="search" type="font-awesome" color="#fff" />
        </TouchableOpacity>
      </View>

      {route.name !== 'Home' && (
        <View style={styles.buttonGroupContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Beers')}>
            <Text style={styles.navButtonText}>Beers</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Bars')}>
            <Text style={styles.navButtonText}>Bars</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Events')}>
            <Text style={styles.navButtonText}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Users')}>
            <Text style={styles.navButtonText}>Users</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#525277',
    paddingTop: 7,
    paddingHorizontal: 7,
    paddingBottom: 3,
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
    backgroundColor: '#323242',
    padding: 10,
    borderRadius: 5,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingTop: 5,
    paddingBottom: 5,
    padding: 0,
    borderRadius: 16,
    backgroundColor: '#2E2E42',
  },
});






