import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, SectionList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from '@env';

const BeerList = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchBeers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/beers/search?q=${query}`);
      const data = await response.json();
      setBeers(data.beers || []);
    } catch (err) {
      setError('Error fetching beers.');
    } finally {
      setLoading(false);
    }
  };

  const handleBeerPress = (id) => {
    navigation.navigate('Beer', { id });
  };

  // Group beers by their style
  const beersByType = beers.reduce((acc, beer) => {
    if (!acc[beer.style]) {
      acc[beer.style] = [];
    }
    acc[beer.style].push(beer);
    return acc;
  }, {});

  // Convert the grouped beers into sections
  const sections = Object.keys(beersByType).map(style => ({
    title: style,
    data: beersByType[style],
  }));

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Buscar cerveza"
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Buscar" onPress={searchBeers} />
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : sections.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleBeerPress(item.id)} style={styles.beerCard}>
              <View style={styles.cardContent}>
                <View style={styles.textContent}>
                  <Text style={styles.beerName}>{item.name}</Text>

                    
                  <Text style={styles.textContent}>{`Calificación Promedio:${Math.round(item.avg_rating * 10) / 10}/5` || 'No Rating'}</Text>
                  <Text style={styles.beerInfo}>IBU: {item.ibu}</Text>
                  <Text style={styles.beerInfo}>Alcohol: {item.alcohol}</Text>
                </View>
                <Image 
                  source={{ uri: item.thumbnail_url || 'No photo yet' }}
                  style={styles.beerImage}
                  resizeMode="cover"
                />
              </View>
            </TouchableOpacity>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
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
    backgroundColor: '#2E2E42', 
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '100%',
    borderRadius: 5,
  },
  beerCard: {
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
  beerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  beerRating: {
    color: '#888',
    marginTop: 5,
  },
  beerInfo: {
    color: '#555',
    marginTop: 2,
  },
  beerImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#fff',
  },
});

export default BeerList;

