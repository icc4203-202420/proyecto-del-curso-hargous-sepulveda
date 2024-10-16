import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Button } from 'react-native';
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
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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





