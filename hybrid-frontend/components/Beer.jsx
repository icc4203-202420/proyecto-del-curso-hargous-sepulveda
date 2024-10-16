import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Button, TextInput, FlatList } from 'react-native';
import { BACKEND_URL } from '@env';

const Beer = ({ route }) => {
  const { id } = route.params;
  const [beer, setBeer] = useState(null);
  const [reviews, setReviews] = useState([]); // Para almacenar reseñas
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(''); // Para almacenar la calificación

  useEffect(() => {
    const fetchBeerDetails = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/beers/${id}`);
        const data = await response.json();
        setBeer(data.beer);
        
        // Obtener reseñas
        const reviewsResponse = await fetch(`${BACKEND_URL}/api/v1/beers/${id}/reviews`);
        const reviewsData = await reviewsResponse.json();
        console.log('Fetched reviews:', reviewsData);
        setReviews(reviewsData.reviews || []); // Asegúrate de acceder a reviews
      } catch (error) {
        console.error('Error fetching beer details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBeerDetails();
  }, [id]);

  const handleReviewSubmit = () => {
    // Lógica para manejar la reseña (guardar en base de datos, etc.)
    console.log('Review submitted:', review, 'Rating:', rating);
    setReview('');
    setRating(''); // Limpiar la calificación
    setModalVisible(false); // Cierra el modal después de enviar la reseña
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando detalles de la cerveza...</Text>
      </View>
    );
  }

  if (!beer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se encontraron detalles de la cerveza.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.beerName}>{beer.name}</Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>Estilo:</Text>
        <Text style={styles.detailValue}>{beer.style || 'N/A'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>IBU:</Text>
        <Text style={styles.detailValue}>{beer.ibu || 'N/A'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>Alcohol:</Text>
        <Text style={styles.detailValue}>{beer.alcohol || 'N/A'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>Calificación Promedio:</Text>
        <Text style={styles.detailValue}>{beer.avg_rating || 'N/A'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>Malts:</Text>
        <Text style={styles.detailValue}>{beer.malts || 'N/A'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>Hop:</Text>
        <Text style={styles.detailValue}>{beer.hop || 'N/A'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>Yeast:</Text>
        <Text style={styles.detailValue}>{beer.yeast || 'N/A'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>BLG:</Text>
        <Text style={styles.detailValue}>{beer.blg || 'N/A'}</Text>
      </View>
      <Button title="Dejar una Reseña" onPress={() => setModalVisible(true)} />
      
      {/* Mostrar reseñas */}
      <Text style={styles.reviewsTitle}>Reseñas:</Text>
      {reviews.length > 0 ? (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id.toString()} // Asume que cada reseña tiene un id único
          renderItem={({ item }) => (
            <View style={styles.reviewContainer}>
              <Text style={styles.reviewText}>{item.text}</Text> {/* Mostrar el texto de la reseña */}
              <Text style={styles.reviewRating}>Calificación: {item.rating}</Text> {/* Mostrar la calificación */}
            </View>
          )}
        />
      ) : (
        <Text style={styles.noReviewsText}>Sin contenido</Text>
      )}
      
      {/* Modal para dejar una reseña */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Dejar una Reseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu reseña aquí..."
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={4}
            />
            <TextInput
              style={styles.input}
              placeholder="Escribe tu calificación aquí..."
              value={rating}
              onChangeText={setRating}
              keyboardType="numeric"
            />
            <Button title="Enviar" onPress={handleReviewSubmit} />
            <Button title="Cancelar" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
  },
  beerName: {
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  detailValue: {
    color: '#333',
  },
  reviewsTitle: {
    fontWeight: 'bold',
    fontSize: 22,
    marginVertical: 20,
    textAlign: 'left',
    color: '#333',
  },
  reviewContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reviewText: {
    color: '#444',
  },
  reviewRating: {
    fontStyle: 'italic',
    color: '#666',
  },
  noReviewsText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});

export default Beer;
