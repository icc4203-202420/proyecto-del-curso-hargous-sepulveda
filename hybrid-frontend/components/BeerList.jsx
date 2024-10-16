import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from '@env';
import Header from "./Header";

const BeerList = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState(''); 
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllBeers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/beers`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setBeers(data.beers || []);
    } catch (err) {
      console.error('Error fetching all beers:', err);
      setError('Error fetching all beers.');
    } finally {
      setLoading(false);
    }
  };

  const searchBeers = async () => {
    if (!query.trim()) {
      fetchAllBeers(); 
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/beers/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setBeers(data.beers || []);
    } catch (err) {
      console.error('Error fetching beers:', err);
      setError('Error fetching beers.');
    } finally {
      setLoading(false);
    }
  };

  const handleBeerPress = (id) => {
    navigation.navigate('Beer', { id });
  };

  const beersByType = beers.reduce((acc, beer) => {
    const style = beer.style || 'Unknown'; 
    if (!acc[style]) {
      acc[style] = { type: style, data: [] };
    }
    acc[style].data.push(beer);
    return acc;
  }, {});

  const flatListData = Object.keys(beersByType).reduce((acc, style) => {
    acc.push({ type: 'header', style }); 
    acc.push(...beersByType[style].data.map(beer => ({ type: 'beer', ...beer }))); 
    return acc;
  }, []);

  useEffect(() => {
    searchBeers();
  }, [query]); 

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionHeader}>{item.style}</Text>;
    } else if (item.type === 'beer') {
      return (
        <TouchableOpacity onPress={() => handleBeerPress(item.id)} style={styles.beerCard}>
          <View style={styles.cardContent}>
            <View style={styles.textContent}>
              <Text style={styles.beerName}>{item.name}</Text>
              <Text style={styles.beerRating}>
                {item.avg_rating !== undefined ? `Calificación Promedio: ${Math.round(item.avg_rating * 10) / 10}/5` : 'No Rating'}
              </Text>
              <Text style={styles.beerInfo}>IBU: {item.ibu || 'N/A'}</Text>
              <Text style={styles.beerInfo}>Alcohol: {item.alcohol || 'N/A'}</Text>
            </View>
            <Image
              source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/100' }}
              style={styles.beerImage}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={styles.container1}>
      <Header onSearch={handleSearch} />
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : flatListData.length > 0 ? (
          <FlatList
            data={flatListData}
            keyExtractor={(item, index) => `${item.type}-${item.id || index}`} // Unique key
            renderItem={renderItem}
          />
        ) : (
          <Text style={styles.noResults}>No se encontraron cervezas.</Text>
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
    color: '#333',
  },
  beerRating: {
    color: '#555',
    marginTop: 2,
  },
  beerInfo: {
    color: '#555',
    marginTop: 2,
  },
  beerImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#ccc', // Fallback background color
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



