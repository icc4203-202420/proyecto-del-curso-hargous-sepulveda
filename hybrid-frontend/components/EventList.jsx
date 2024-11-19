import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BACKEND_URL } from '@env';
import Header from "./Header";

const EventList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const query = route.params?.query || '';

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/events`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const eventData = await response.json();

      const eventsWithBarNames = await Promise.all(eventData.events.map(async (event) => {
        if (event.bar_id) {
          try {
            const barResponse = await fetch(`${BACKEND_URL}/api/v1/bars/${event.bar_id}`);
            if (!barResponse.ok) {
              throw new Error(`Error fetching bar data for bar_id: ${event.bar_id}`);
            }
            const barData = await barResponse.json();
            return { ...event, bar_name: barData.bar.name };
          } catch (barError) {
            console.error(`Error fetching bar data for bar_id: ${event.bar_id}`, barError);
            return { ...event, bar_name: 'Unknown Bar' };
          }
        } else {
          return { ...event, bar_name: 'No Bar' };
        }
      }));

      setEvents(eventsWithBarNames);
      setFilteredEvents(eventsWithBarNames);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Error fetching events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    onSearch(query);
  }, [query, events]);

  const onSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      setFilteredEvents(events);
      return;
    }
    console.log(searchQuery);
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = events.filter(event =>
      event.name.toLowerCase().includes(lowerCaseQuery) ||
      (event.bar_name && event.bar_name.toLowerCase().includes(lowerCaseQuery))
    );

    setFilteredEvents(filtered);
  };

  const handleEventPress = (id) => {
    navigation.navigate('EventDetails', { id });
  };

  const groupByBar = (events) => {
    return events.reduce((acc, event) => {
      const barName = event.bar_name || 'No Bar';
      if (!acc[barName]) {
        acc[barName] = [];
      }
      acc[barName].push(event);
      return acc;
    }, {});
  };

  const groupedEvents = groupByBar(filteredEvents);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <View style={styles.container1}>
      <Header onSearch={onSearch}/>  
      <FlatList style={styles.container}
        data={Object.keys(groupedEvents)}
        keyExtractor={(item) => item}
        renderItem={({ item: barName }) => (
          <View style={styles.eventGroup}>
            <Text style={styles.sectionHeader}>{barName}</Text>
            {groupedEvents[barName].map(event => (
              <TouchableOpacity key={event.id} onPress={() => handleEventPress(event.id)} style={styles.eventCard}>
                <View style={styles.cardContent}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text style={styles.eventDate}>Fecha: {new Date(event.start_date).toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
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
  eventGroup: {
    marginBottom: 0,
  },
  eventCard: {
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
    padding: 10,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDate: {
    color: '#555',
    marginTop: 2,
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

export default EventList;


