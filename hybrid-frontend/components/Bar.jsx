import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, FlatList, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const Bar = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params; // The bar id from route parameters
    const [bar, setBar] = useState(null);
    const [beers, setBeers] = useState([]);
    const [events, setEvents] = useState([]); // State for events
    const [country, setCountry] = useState(null);
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  
    useEffect(() => {
        const fetchBarAndBeers = async () => {
            try {
                const barResponse = await fetch(`http://localhost:3001/api/v1/bars/${id}`);
                const barData = await barResponse.json();
                setBar(barData.bar);
  
                const beersResponse = await fetch(`http://localhost:3001/api/v1/bars/${id}/beers`);
                const beersData = await beersResponse.json();
                setBeers(beersData);
  
                const addressResponse = await fetch(`http://localhost:3001/api/v1/bars/${id}/addresses`);
                const addressData = await addressResponse.json();
                setAddress(addressData);
  
                const countryResponse = await fetch(`http://localhost:3001/api/v1/bars/${id}/countrys`);
                const countryData = await countryResponse.json();
                setCountry(countryData.country);
  
                setLoading(false);
            } catch (error) {
                console.error('Error fetching bar details or beers:', error);
                setError('Error fetching bar details or beers');
                setLoading(false);
            }
        };
  
        fetchBarAndBeers();
    }, [id]);
  
    const fetchEvents = async () => {
        try {
            const eventsResponse = await fetch(`http://localhost:3001/api/v1/events?bar_id=${id}`);
            const eventsData = await eventsResponse.json();
            setEvents(eventsData.events);
            setModalVisible(true);
        } catch (error) {
            console.error('Error fetching events:', error);
            setError('Error fetching events');
        }
    };
  
    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text style={styles.errorText}>{error}</Text>;
  
    return (
        bar && (
            <ScrollView style={styles.container}>
                <View style={styles.card}>
                    {bar.image_url ? (
                      <Image source={{ uri: bar.image_url }} style={styles.barImage} />
                    ) : (
                      <Image source={{ uri: 'https://via.placeholder.com/200' }} style={styles.barImage} />
                    )}
                    <Text style={styles.barTitle}>{bar.name || 'N/A'}</Text>
                    <Text style={styles.barText}><strong>Country:</strong> {country.name || 'N/A'}</Text>
                    <Text style={styles.barText}><strong>City:</strong> {address.city || 'N/A'}</Text>
                    <Text style={styles.barText}>
                        <strong>Address:</strong> {address.line1 || 'N/A'}, {address.line2 || 'N/A'}
                    </Text>
  
                    <Button title="View Events" onPress={fetchEvents} />
  
                    <View style={styles.beersSection}>
                        <Text style={styles.sectionTitle}>Beers Available</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {Array.isArray(beers) && beers.length > 0 ? (
                                beers.map((beer) => (
                                    <TouchableOpacity key={beer.id} onPress={() => navigation.navigate('Beer', { id: beer.id })}>
                                        <View style={styles.beerCard}>
                                            <Text style={styles.beerTitle}>{beer.name}</Text>
                                            <Text style={styles.beerRating}>Rating: {Math.round(beer.avg_rating * 10) / 10 || 'N/A'}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text>No beers available at this bar.</Text>
                            )}
                        </ScrollView>
                    </View>

  
                    {/* Modal for events */}
                    <Modal visible={modalVisible} animationType="fade" transparent={true}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Events at {bar.name}</Text>
                                {events.length > 0 ? (
                                    events.map((event) => (
                                        <TouchableOpacity key={event.id} onPress={() => navigation.navigate('Event', { id: event.id })}>
                                            <View style={styles.eventCard}>
                                                <Text style={styles.eventTitle}>{event.name}</Text>
                                                <Text><strong>Event ID:</strong> {event.id || 'N/A'}</Text>
                                                <Text><strong>Description:</strong> {event.description || 'N/A'}</Text>
                                                <Text><strong>Start Date:</strong> {new Date(event.start_date).toLocaleString() || 'N/A'}</Text>
                                                <Text><strong>End Date:</strong> {new Date(event.end_date).toLocaleString() || 'N/A'}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <Text>No events available for this bar.</Text>
                                )}
                                <Button title="Close" onPress={() => setModalVisible(false)} />
                            </View>
                        </View>
                    </Modal>
                </View>
            </ScrollView>
        )
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    barImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    barTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    barText: {
        fontSize: 16,
        marginVertical: 4,
    },
    closeButton: {
        alignSelf: 'flex-end',
    },
    beersSection: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },  
    beerCard: {
        padding: 10,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
        maxWidth: 300,
      },
    beerRating: {
        fontWeight: 'bold',
    },
    beerImage: {
        width: 50,
        height: 50,
        resizeMode: 'cover',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        flex: 1,
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    eventCard: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginVertical: 4,
        borderRadius: 4,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default Bar;



