import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Button, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from '@env';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';

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
  
          await fetchEventPictures(selectedEvent.id);
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

  const handleImageChange = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!result.cancelled) {
      setSelectedImage(result);
    }
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
      Alert.alert('Upload Status', 'Please select an image to upload.');
      return;
    }
    setIsUploading(true);
    
    const base64Image = selectedImage.base64;
    const data = {
      event_picture: {
        user_id: await SecureStore.getItemAsync('userId'),
        flyer_base64: `data:image/jpeg;base64,${base64Image}`,
        description,
      },
    };
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/events/${id}/event_pictures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to upload image, status: ${response.status}`);
      }

      setUploadStatus('Image uploaded successfully.');
      Alert.alert('Upload Status', 'Image uploaded successfully.');
      await fetchEventPictures(id);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Upload Status',
          body: 'Image uploaded successfully.',
        },
        trigger: null,
      });
      setTimeout(() => handleCloseModal(), 2000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadStatus('Error uploading image.');
      Alert.alert('Upload Status', 'Error uploading image.');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Upload Status',
          body: 'Error uploading image.',
        },
        trigger: null,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Custom Notification',
        body: 'This is a custom notification triggered by pressing the button.',
      },
      trigger: null,
    });
  };

  if (loading) return <ActivityIndicator style={styles.loading} size="large" />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eventTitle}>{event?.name}</Text>
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
        <Text style={styles.bold}>Description:</Text> {event?.description || 'No available'}
      </Text>
      <Text style={styles.date}>
        <Text style={styles.bold}>Start Date:</Text> {new Date(event?.start_date).toLocaleString() || 'Not available'}
      </Text>
      <Text style={styles.date}>
        <Text style={styles.bold}>End Date:</Text> {new Date(event?.end_date).toLocaleString() || 'Not available'}
      </Text>

      {hasConfirmed ? (
        <Text style={styles.confirmedText}>Attendance confirmed</Text>
      ) : (
        <Button title="Confirm Attendance" onPress={confirmAttendance} />
      )}

      <Button title="Upload Event Picture" onPress={handleOpenModal} />
      <Button title="Send Notification" onPress={sendNotification} />
      {uploadStatus ? <Text style={styles.statusText}>{uploadStatus}</Text> : null}

      <Modal visible={openModal} onRequestClose={handleCloseModal} transparent={true} animationType="slide">
        <View style={styles.modalContainerCentered}>
          <Text style={styles.modalTitle}>Upload Image</Text>
          <Button title="Select Image" onPress={handleImageChange} />
          {selectedImage && (
            <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
          )}
          <TextInput
            placeholder="Add a description..."
            value={description}
            onChangeText={setDescription}
            style={styles.input}
          />
          <Button title={isUploading ? 'Uploading...' : 'Upload'} onPress={uploadImage} disabled={isUploading} />
          <Button title="Cancel" onPress={handleCloseModal} />
        </View>
      </Modal>

      <Text style={styles.bold}>Event Pictures:</Text>
      {eventPictures.map((picture, index) => (
        <Image key={index} source={{ uri: picture.flyer_urls[0] }} style={{ width: 200, height: 200, marginVertical: 10 }} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },

  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  barName: {
    fontSize: 18,
    marginBottom: 10,
  },

  link: {
    color: 'blue',
  },

  description: {
    fontSize: 16,
    marginVertical: 10,
  },

  date: {
    fontSize: 16,
    marginBottom: 10,
  },

  bold: {
    fontWeight: 'bold',
  },

  confirmedText: {
    fontSize: 16,
    color: 'green',
    marginVertical: 10,
  },

  statusText: {
    fontSize: 14,
    color: 'gray',
  },

  modalContainerCentered: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '50%',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    color: 'red',
    fontSize: 16,
  },

  selectedImage: {
    width: 200,
    height: 200,
    marginVertical: 10,
  },
});

export default EventDetails;
