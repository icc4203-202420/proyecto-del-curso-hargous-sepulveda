import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Button, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { BACKEND_URL } from '@env';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
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
  const [status, setStatus] = useState({ loading: true, error: null });
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [modalData, setModalData] = useState({ open: false, description: '', image: null, uploading: false });

  const inputRef = useRef(null);

  const fetchData = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Request failed, status: ${response.status}`);
    return await response.json();
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
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventData = await fetchData(`${BACKEND_URL}/api/v1/events`);
        const selectedEvent = eventData.events.find((e) => e.id === id);

        if (!selectedEvent) return setEvent(null);

        setEvent(selectedEvent);

        const [barData, attendanceData, friendsData] = await Promise.all([
          fetchData(`${BACKEND_URL}/api/v1/bars/${selectedEvent.bar_id}`),
          fetchData(`${BACKEND_URL}/api/v1/attendances/event/${id}`),
          fetchData(`${BACKEND_URL}/api/v1/users/${await SecureStore.getItemAsync('userId')}/friendships`),
        ]);

        setBarName(barData.bar.name);
        setBarId(selectedEvent.bar_id);
        setAttendees(attendanceData.attendees);
        setFriends(friendsData);

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
        setStatus({ ...status, error: 'Error fetching event pictures' });
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

  const handleImageChange = async (source) => {
    console.log('Iniciando selección de imagen...');
  
    // Verificar permisos para la cámara
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso Requerido', '¡Se requiere permiso para acceder a la cámara!');
      console.log('Permiso para la cámara denegado');
      return;
    }
  
    console.log(`Permiso para la cámara otorgado. Fuente seleccionada: ${source}`);
  
    // Abrir cámara o galería
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
  
    console.log('Resultado de ImagePicker:', result);
  
    // Verificar si se obtuvo un resultado y si `assets[0].uri` está definido
    if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
      const imageUri = result.assets[0].uri;
      console.log('Imagen seleccionada exitosamente, URI:', imageUri);
      try {
        const resizedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 720, height: 720 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        
  
        console.log('Imagen redimensionada exitosamente, nueva URI:', resizedImage.uri);
        setModalData({ ...modalData, image: resizedImage });
      } catch (error) {
        console.error('Error al manipular la imagen:', error);
        Alert.alert('Error', 'Hubo un problema al procesar la imagen seleccionada.');
      }
    } else {
      Alert.alert('Cancelado', 'No se seleccionó ninguna imagen.');
      console.log('La selección de imagen fue cancelada o el URI no está disponible');
    }
  };
  
  
  

  const uploadImage = async () => {
    if (!modalData.image || !modalData.image.base64) {
      Alert.alert('Estado de subida', 'Por favor, selecciona una imagen para subir.');
      return;
    }
  
    setModalData({ ...modalData, uploading: true });
    const data = {
      event_picture: {
        user_id: await SecureStore.getItemAsync('userId'),
        flyer_base64: `data:image/jpeg;base64,${modalData.image.base64}`,
        description: modalData.description,
      },
    };
  
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/events/${id}/event_pictures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
  
      const responseData = await response.json(); // Mostrar respuesta del servidor
      console.log('Respuesta del servidor:', responseData);
  
      if (!response.ok) throw new Error(`Failed to upload image, status: ${response.status}`);
  
      Alert.alert('Estado de subida', 'Imagen subida exitosamente.');
      await fetchEventPictures(id);
  
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Estado de subida', body: 'Imagen subida exitosamente.' },
        trigger: null,
      });
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      Alert.alert('Estado de subida', 'Error al subir la imagen.');
    } finally {
      setModalData({ open: false, description: '', image: null, uploading: false });
    }
  };
  
  if (status.loading) return <ActivityIndicator style={styles.loading} size="large" />;
  if (status.error) return <Text style={styles.errorText}>{status.error}</Text>;

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
          <Text>No Bar</Text>
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
      <Button title="Upload Event Picture" onPress={() => setModalData({ ...modalData, open: true })} />

      <Modal visible={modalData.open} onRequestClose={() => setModalData({ ...modalData, open: false })} transparent={true} animationType="slide">
        <View style={styles.modalContainerCentered}>
          <Text style={styles.modalTitle}>Upload Image</Text>
          <Button title="Take Picture" onPress={() => handleImageChange('camera')} />
          <Button title="Select from gallery" onPress={() => handleImageChange('gallery')} />
          {modalData.image && <Image source={{ uri: modalData.image.uri }} style={styles.selectedImage} />}
          <TextInput placeholder="Add a description..." value={modalData.description} onChangeText={(text) => setModalData({ ...modalData, description: text })} style={styles.input} />
          <Button title={modalData.uploading ? 'Uploading...' : 'Upload'} onPress={uploadImage} disabled={modalData.uploading} />
          <Button title="Cancel" onPress={() => setModalData({ ...modalData, open: false })} />
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
  container: { padding: 20, backgroundColor: '#f5f5f5' },
  eventTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  barName: { fontSize: 18, marginBottom: 10 },
  link: { color: 'blue' },
  description: { fontSize: 16, marginVertical: 10 },
  date: { fontSize: 16, marginBottom: 10 },
  bold: { fontWeight: 'bold' },
  confirmedText: { fontSize: 16, color: 'green', marginVertical: 10 },
  errorText: { color: 'red', fontSize: 16 },
  modalContainerCentered: { padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: '50%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, width: '100%' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  selectedImage: { width: 200, height: 200, marginVertical: 10 },
});

export default EventDetails;
