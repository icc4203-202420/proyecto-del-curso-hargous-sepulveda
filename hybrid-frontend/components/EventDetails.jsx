import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Button, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from '@env';
import { useRoute, useNavigation } from '@react-navigation/native';

const EventDetails = () => {
  const route = useRoute();
  const { id } = route.params;
  const navigation = useNavigation();

  const [event, setEvent] = useState(null);
  const [barName, setBarName] = useState('');
  const [barId, setBarId] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [friends, setFriends] = useState([]);
  const [eventPictures, setEventPictures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        console.log(`Fetching event details for event ID: ${id}`);
        const eventResponse = await fetch(`${BACKEND_URL}/api/v1/events`);
        
        if (!eventResponse.ok) {
          throw new Error(`Failed to fetch events, status: ${eventResponse.status}`);
        }
        
        const eventData = await eventResponse.json();
        
        const selectedEvent = eventData.events.find((e) => e.id === id);
        
        if (selectedEvent) {
          setEvent(selectedEvent);
  
          if (selectedEvent.bar_id) {
            const barResponse = await fetch(`${BACKEND_URL}/api/v1/bars/${selectedEvent.bar_id}`);
            
            if (!barResponse.ok) {
              throw new Error(`Failed to fetch bar details, status: ${barResponse.status}`);
            }
            
            const barData = await barResponse.json();
            
            setBarName(barData.bar.name);
            setBarId(selectedEvent.bar_id);
          }
  
          const attendanceResponse = await fetch(`${BACKEND_URL}/api/v1/attendances/event/${id}`);
          
          if (!attendanceResponse.ok) {
            throw new Error(`Failed to fetch attendees, status: ${attendanceResponse.status}`);
          }
          
          const attendanceData = await attendanceResponse.json();
  
          const attendeesData = attendanceData.attendees;
          const attendeesNamesPromises = attendeesData.map(async (userId) => {
            const userResponse = await fetch(`${BACKEND_URL}/api/v1/users/${userId}`);
            
            if (!userResponse.ok) {
              throw new Error(`Failed to fetch user details, status: ${userResponse.status}`);
            }
            
            const userData = await userResponse.json();
  
            return { userId, name: userData.user.name };
          });
          
          const currentUserId = await SecureStore.getItemAsync('userId');
          const attendeesNames = await Promise.all(attendeesNamesPromises);
  
          setAttendees(attendeesNames);
  
          if (attendeesData.includes(parseInt(currentUserId))) {
            setHasConfirmed(true);
          }
  
          const friendsResponse = await fetch(`${BACKEND_URL}/api/v1/users/${currentUserId}/friendships`);
          
          if (!friendsResponse.ok) {
            throw new Error(`Failed to fetch friends, status: ${friendsResponse.status}`);
          }
          
          const friendsData = await friendsResponse.json();
          
          setFriends(friendsData);
  
          fetchEventPictures(selectedEvent.id);
        } else {
          setEvent(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event details or attendees:', error);
        setError('Error fetching event details or attendees');
        setLoading(false);
      }
    };
  
    const fetchEventPictures = async (eventId) => {
      try {
        console.log(`Fetching event pictures for event ID: ${eventId}`);
        const response = await fetch(`${BACKEND_URL}/api/v1/events/${eventId}/event_pictures`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch event pictures, status: ${response.status}`);
        }
        
        const pictureData = await response.json();
        console.log('Event picture data:', pictureData);
        
        setEventPictures(pictureData);
      } catch (error) {
        console.error('Error fetching event pictures:', error);
        setError('Error fetching event pictures');
      }
    };
  
    fetchEventDetails();
  }, [id]);
  

  const confirmAttendance = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/v1/attendances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: id, user_id: await SecureStore.getItemAsync('userId') }),
      });
      setHasConfirmed(true);
    } catch (error) {
      console.error('Error confirming attendance:', error);
    }
  };

  const handleImageChange = (image) => {
    setSelectedImage(image);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setDescription('');
    setSelectedImage(null);
    setUploadStatus('');
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      setUploadStatus('Please select an image.');
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      const data = {
        event_picture: { user_id: await SecureStore.getItemAsync('userId'), flyer_base64: base64Image, description },
      };
      try {
        await fetch(`${BACKEND_URL}/api/v1/events/${id}/event_pictures`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        setUploadStatus('Image uploaded successfully.');
        fetchEventPictures(id);
        setTimeout(() => handleCloseModal(), 2000);
      } catch (error) {
        setUploadStatus('Error uploading image.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(selectedImage);
  };

  if (loading) return <ActivityIndicator style={styles.loading} size="large" />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eventTitle}>{event.name}</Text>
      <Text style={styles.barName}>
        Bar:{' '}
        {barId ? (
          <TouchableOpacity onPress={() => navigation.navigate('Bar', { id: barId })}>
            <Text style={styles.link}>{barName}</Text>
          </TouchableOpacity>
        ) : (
          'No Bar'
        )}
      </Text>
      <Text style={styles.description}>
        <Text style={styles.bold}>Description:</Text> {event.description || 'No available'}
      </Text>
      <Text style={styles.date}>
        <Text style={styles.bold}>Start Date:</Text> {new Date(event.start_date).toLocaleString() || 'Not available'}
      </Text>
      <Text style={styles.date}>
        <Text style={styles.bold}>End Date:</Text> {new Date(event.end_date).toLocaleString() || 'Not available'}
      </Text>

      {hasConfirmed ? (
        <Text style={styles.confirmedText}>Attendance confirmed</Text>
      ) : (
        <Button title="Confirm Attendance" onPress={confirmAttendance} />
      )}

      <Button title="Upload Event Picture" onPress={handleOpenModal} />
      {uploadStatus ? <Text style={styles.statusText}>{uploadStatus}</Text> : null}

      <Modal visible={openModal} onRequestClose={handleCloseModal} transparent={true}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Upload Image</Text>
          <TextInput placeholder="Add a description..." value={description} onChangeText={setDescription} style={styles.input} />
          {/* Implement image picker logic here */}
          <Button title={isUploading ? 'Uploading...' : 'Upload'} onPress={uploadImage} disabled={isUploading} />
          <Button title="Cancel" onPress={handleCloseModal} />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5' },

  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10 },

  barName: {
    fontSize: 18,
    marginBottom: 10 },

  link: {
    color: 'blue' },

  description: {
    fontSize: 16,
    marginVertical: 10 },

  date: {
    fontSize: 16,
    marginBottom: 10 },

  bold: {
    fontWeight: 'bold' },

  confirmedText: {
    fontSize: 16,
    color: 'green',
    marginVertical: 10 },

  statusText: {
    fontSize: 14,
    color: 'gray' },

  modalContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center' },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    width: '100%' },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center' },

  errorText: {
    color: 'red',
    fontSize: 16 },

});

export default EventDetails;
