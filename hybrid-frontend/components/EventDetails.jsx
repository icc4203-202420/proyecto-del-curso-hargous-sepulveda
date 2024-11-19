import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Button, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert, FlatList } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from '@env';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Notifications from 'expo-notifications';
import { Video } from 'expo-av';

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
  const [status, setStatus] = useState({ loading: true, error: null });
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [modalData, setModalData] = useState({ open: false, description: '', image: null, uploading: false });
  const [isTagging, setIsTagging] = useState(false);
  const [query, setQuery] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false); 
  const inputRef = useRef(null);
  const [users, setUsers] = useState([]);

  const fetchData = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Request failed, status: ${response.status}`);
    return await response.json();
  };

  const fetchEventDetails = async () => {
    try {
      const eventData = await fetchData(`${BACKEND_URL}/api/v1/events/${id}`);
      const selectedEvent = eventData.event;

      if (!selectedEvent) return setEvent(null);

      setEvent(selectedEvent);
      setVideoUrl(selectedEvent.video_url);

      const [barData, attendanceData, friendsData, users] = await Promise.all([
        fetchData(`${BACKEND_URL}/api/v1/bars/${selectedEvent.bar_id}`),
        fetchData(`${BACKEND_URL}/api/v1/attendances/event/${id}`),
        fetchData(`${BACKEND_URL}/api/v1/users/${await SecureStore.getItemAsync('userId')}/friendships`),
        fetchData(`${BACKEND_URL}/api/v1/users/search`),
      ]);

      setBarName(barData.bar.name);
      setBarId(selectedEvent.bar_id);
      setAttendees(attendanceData.attendees);
      setFriends(friendsData);
      setUsers(users.users);
      const currentUserId = await SecureStore.getItemAsync('userId');
      setHasConfirmed(attendanceData.attendees.includes(parseInt(currentUserId)));

      await fetchEventPictures(selectedEvent.id);
      setStatus({ loading: false, error: null });
    } catch (error) {
      console.error('Error fetching event details:', error);
      setStatus({ loading: false, error: 'Error fetching event details' });
    }
  };

  const fetchEventPictures = async (eventId) => {
    try {
      const pictureData = await fetchData(`${BACKEND_URL}/api/v1/events/${eventId}/event_pictures`);
      setEventPictures(pictureData);
    } catch (error) {
      console.error('Error fetching event pictures:', error);
      setStatus((prevStatus) => ({ ...prevStatus, error: 'Error fetching event pictures' }));
    }
  };

  const generateEventVideo = async () => {
    setIsGeneratingVideo(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/events/${id}/generate_summary`, {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Video Generation', data.message);
      } else {
        Alert.alert('Error', data.error || 'Could not generate the video');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      Alert.alert('Error', 'An error occurred while generating the video');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  useEffect(() => {
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

  const handleImageChange = async (source) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Access Required', 'Access must be granted to upload a photo!');
      return;
    }

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });

    if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
      const imageUri = result.assets[0].uri;
      try {
        const resizedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 720, height: 720 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        setModalData({ ...modalData, image: resizedImage });
      } catch (error) {
        console.error('Error manipulating the image:', error);
        Alert.alert('Error', 'A problem occurred while uploading the image.');
      }
    } else {
      Alert.alert('Canceled', 'No image was selected.');
    }
  };

  const handleDescriptionChange = (text) => {
    setModalData((prev) => ({ ...prev, description: text }));

    const words = text.split(' ');
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      const tagQuery = lastWord.slice(1).toLowerCase();
      setQuery(tagQuery);
      setIsTagging(true);
    } else {
      setIsTagging(false);
      setQuery('');
    }
  };

  useEffect(() => {
    if (query) {
      const filteredSuggestions = users.filter(user => user.handle.toLowerCase().includes(query.toLowerCase()));
      setUserSuggestions(filteredSuggestions);
    } else {
      setUserSuggestions([]);
    }
  }, [query, users]);

  const handleTagSelect = (user) => {
    const updatedDescription = modalData.description.replace(/@\w*$/, `@${user.handle} `);
    setModalData((prev) => ({
      ...prev,
      description: updatedDescription,
    }));
    setIsTagging(false);
    setQuery('');
  };
  const closeTaggingModal = () => {
    setModalData({ ...modalData, open: false, description: '', image: null });
  };

  const uploadImage = async () => {
    if (hasEventEnded) {
      Alert.alert('Upload Not Allowed', 'The event has ended. You cannot upload more images.');
      return;
    }

    if (!modalData.image || !modalData.image.base64) {
      Alert.alert('Upload Status', 'Please, select an image to upload.');
      return;
    }

    setModalData({ ...modalData, uploading: true });
    const taggedUsers = userSuggestions.filter((user) => modalData.description.includes(user.handle));

    const data = {
      event_picture: {
        user_id: await SecureStore.getItemAsync('userId'),
        flyer_base64: `data:image/jpeg;base64,${modalData.image.base64}`,
        description: modalData.description,
        tagged_user_ids: taggedUsers.map((user) => user.id),
      },
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/events/${id}/event_pictures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`Failed to upload image, status: ${response.status}`);

      Alert.alert('Upload Status', 'Image uploaded successfully.');
      await fetchEventPictures(id);

      await Notifications.scheduleNotificationAsync({
        content: { title: 'Upload Status', body: 'Image uploaded successfully.' },
        trigger: null,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Status', 'Failed to upload the image.');
    } finally {
      setModalData({ ...modalData, uploading: false, open: false, description: '', image: null });
    }
  };

  if (status.loading) return <ActivityIndicator size="large" color="#0000ff" />;

  const handleUserPress = (id) => {
    navigation.navigate('UserProfile', { id });
  };

  const renderDescriptionWithTags = (description) => {
    const tagRegex = /@([\w.]+)/g; 
    const parts = description.split(tagRegex);
  
    return (
      <Text>
        {parts.map((part, index) => {
          if (index % 2 === 1) { 
            const username = part;
            const user = users.find((user) => user.handle === username); 
            const tagId = user ? user.id : null;
            return (
              <TouchableOpacity 
                key={index}
                onPress={() => handleUserPress(tagId)}
              >
                <Text style={{ color: 'blue' }}>{`@${username}`}</Text>
              </TouchableOpacity>
            );
          }
          return part; 
        })}
      </Text>
    );
  };

  const currentDate = new Date();
  const endDate = new Date(event?.end_date);
  const hasEventEnded = endDate < currentDate;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.eventTitle}>{event?.name || 'Event Title'}</Text>
      <Text style={styles.barName}>
        <Text style={styles.link}>Bar: {barName || 'Bar Name'}</Text>
      </Text>
      <Text style={styles.description}>{event?.description || 'Event description not available'}</Text>
      <Text style={styles.date}>
        <Text style={styles.bold}>Fecha de Inicio:</Text> {new Date(event?.start_date).toLocaleString() || 'Not available'}
      </Text>
      <Text style={styles.date}>
        <Text style={styles.bold}>Fecha de Termino:</Text> {endDate.toLocaleString() || 'Not available'}
      </Text>
      {hasEventEnded && (
        <Text style={styles.expiredText}>Este evento ha terminado.</Text>
      )}
      <Text style={styles.attendees}>Asistentes: {attendees.length}</Text>


      {hasEventEnded ? (
        videoUrl ? (
          <>
            <Button title="Ver Video" onPress={() => setIsVideoModalVisible(true)} />
            <Modal
              visible={isVideoModalVisible}
              animationType="slide"
              onRequestClose={() => setIsVideoModalVisible(false)}
            >
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Video
                  source={{ uri: `${BACKEND_URL}${videoUrl}` }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode="cover"
                  shouldPlay
                  style={{ width: '100%', height: 300 }}
                />
                <Button title="Cerrar Video" onPress={() => setIsVideoModalVisible(false)} />
              </View>
            </Modal>
          </>
        ) : (
          <Button title={isGeneratingVideo ? "Generando Video..." : "Resumen"} onPress={generateEventVideo} disabled={isGeneratingVideo} />
        )
      ) : (
        hasConfirmed ? (
          <Text style={styles.confirmedText}>Attendance confirmed</Text>
        ) : (
          <Button title="Confirmar Asistencia" onPress={confirmAttendance} />
        )
      )}

      {!hasEventEnded && (
        <Button title="Subir Imagen" onPress={() => setModalData((prev) => ({ ...prev, open: true }))} />
      )}
      
      <Text style={styles.bold}>Event Pictures:</Text>
      {eventPictures.map((picture, index) => (
        <View key={index} style={{ marginVertical: 10, paddingBottom: 15 }}>
          <Image 
            source={{ uri: picture.flyer_urls[0] }} 
            style={{ width: 200, height: 200 }} 
          />
          <Text>{renderDescriptionWithTags(picture.description)}</Text>
        </View>
      ))}

      <Modal visible={modalData.open} animationType="slide" onRequestClose={closeTaggingModal}>
        <View style={styles.modalContent}>

          <Button title="Cámara" onPress={() => handleImageChange('camera')} />
          <Button title="Galería" onPress={() => handleImageChange('library')} />
          <TextInput
            ref={inputRef}
            placeholder="Description"
            value={modalData.description}
            onChangeText={handleDescriptionChange}
            style={styles.descriptionInput}
          />
          {isTagging && userSuggestions.length > 0 && (
            <FlatList
              data={userSuggestions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleTagSelect(item)}>
                  <Text style={styles.suggestionText}>{item.handle}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          <Button title="Subir" onPress={uploadImage} />
          <Button title="Cerrar" onPress={closeTaggingModal} />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center' },
  eventTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  barName: { fontSize: 16, color: 'blue', marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 8 },
  date: { fontSize: 16, marginBottom: 4 },
  attendees: { fontSize: 16, marginBottom: 8 },
  confirmedText: { fontSize: 16, color: 'green', marginVertical: 10 },
  expiredText: { fontSize: 16, color: 'red', marginVertical: 10 },
  bold: { fontWeight: 'bold' },
  pictureContainer: { marginBottom: 16 },
  picture: { width: '100%', height: 200, resizeMode: 'cover' },
  modalContent: { flex: 1, justifyContent: 'center', padding: 16 },
  descriptionInput: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8 },
  suggestionText: { padding: 8, backgroundColor: '#f0f0f0', marginBottom: 4 },
});

export default EventDetails;
