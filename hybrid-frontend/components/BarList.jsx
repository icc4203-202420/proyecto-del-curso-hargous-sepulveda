import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from '@env';
import Header from "./Header";

const BarList = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState(''); 
  const [bars, setBars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllBars = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/bars/search`);
      
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      const barsWithDetails = data.map((bar) => ({
        ...bar,
        line1: bar.address?.line1 || 'No address available',
        line2: bar.address?.line2,
        country: bar.address?.country?.name,
        city: bar.address?.city,
      }));
      setBars(barsWithDetails);
      console.log(barsWithDetails)
    } catch (err) {
      console.error('Error fetching all bars:', err);
      setError('Error fetching all bars.');
    } finally {
      setLoading(false);
    }
  };

  const searchBars = async () => {
    if (!query.trim()) {
      fetchAllBars(); 
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/bars/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setBars(data.bars || []);
    } catch (err) {
      console.error('Error fetching bars:', err);
      setError('Error fetching bars.');
    } finally {
      setLoading(false);
    }
  };

  const handleBarPress = (id) => {
    navigation.navigate('Bar', { id });
  };

  const flatListData = bars.map((bar) => ({ type: 'bar', ...bar }));

  useEffect(() => {
    searchBars();
  }, [query]); 

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const renderItem = ({ item }) => {
    if (item.type === 'bar') {
      return (
        <TouchableOpacity onPress={() => handleBarPress(item.id)} style={styles.barCard}>
          <View style={styles.cardContent}>
            <View style={styles.textContent}>
              <Text style={styles.barName}>{item.name}</Text>
              <Text style={styles.barAddress}>
                {item.address 
                  ? `Address: ${item.line1}, ${item.city}, ${item.country}` 
                  : 'No Address'}
              </Text>
            </View>
            <Image
              source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/100' }}
              style={styles.barImage}
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
          <Text style={styles.noResults}>No se encontraron bares.</Text>
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
  barCard: {
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
  barName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  barAddress: {
    color: '#555',
    marginTop: 2,
  },
  barImage: {
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#fff',
  },
});

export default BarList;


