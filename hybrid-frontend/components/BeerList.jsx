import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { BACKEND_URL } from '@env';

<<<<<<< HEAD
const BeerList = () => {
=======
const Home = () => {
>>>>>>> 940077fea66b0659fd4e6e1914e72c2b73c4dcb1
  const navigation = useNavigation(); // Initialize navigation
  const [query, setQuery] = useState('');
  const [beers, setBeers] = useState([]);

  const searchBeers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/beers/search?q=${query}`);
      const data = await response.json();
      setBeers(data.beers || []); // Assuming the results come in 'beers'
    } catch (error) {
      console.error('Error fetching beers:', error);
    }
  };

  const handleBeerPress = (id) => {
    navigation.navigate('Beer', { id }); // Navigate to Beer with the beer id
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Buscar cerveza"
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Buscar" onPress={searchBeers} />
      {beers.length > 0 ? (
        <FlatList
          data={beers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleBeerPress(item.id)}>
              <View style={styles.beerContainer}>
                <Text style={styles.beerName}>{item.name}</Text>
                <Text>Estilo: {item.style}</Text>
                <Text>IBU: {item.ibu}</Text>
                <Text>Alcohol: {item.alcohol}</Text>
<<<<<<< HEAD
                <Text>CalificaciÃ³n Promedio: {item.avg_rating}</Text>
=======
                <Text>Calificación Promedio: {item.avg_rating}</Text>
>>>>>>> 940077fea66b0659fd4e6e1914e72c2b73c4dcb1
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noResults}>No se encontraron cervezas.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center', // Center items horizontally
    justifyContent: 'center', // Center items vertically
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '100%', // Full width for the search bar
    borderRadius: 5, // Rounded corners
  },
  beerContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    width: '100%', // Full width for the beer container
  },
  beerName: {
    fontWeight: 'bold',
  },
  noResults: {
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
});

<<<<<<< HEAD
export default BeerList;
=======
export default Home;
>>>>>>> 940077fea66b0659fd4e6e1914e72c2b73c4dcb1
