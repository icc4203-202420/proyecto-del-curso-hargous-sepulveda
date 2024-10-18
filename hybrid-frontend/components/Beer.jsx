import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Button, TextInput } from 'react-native';
import { BACKEND_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon, Rating } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

const Beer = ({ route }) => {
  const { id } = route.params;
  const [beer, setBeer] = useState(null);
  const [brand, setBrand] = useState(null);
  const [bars, setBars] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchBeerAndDetails = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId'); 
        setCurrentUserId(parseInt(userId));

        const beerResponse = await fetch(`${BACKEND_URL}/api/v1/beers/${id}`);
        const beerData = await beerResponse.json(); 
        setBeer(beerData.beer);
        const barsResponse = await fetch(`${BACKEND_URL}/api/v1/beers/${id}/bars`);
        const barsData = await barsResponse.json(); 
        setBars(barsData.bars);
        
        if (beerData.beer.brand_id) {
          const brandResponse = await fetch(`${BACKEND_URL}/api/v1/brands/${beerData.beer.brand_id}`);
          const brandData = await brandResponse.json(); 
          setBrand(brandData.name);
        }
        
        const usersResponse = await fetch(`${BACKEND_URL}/api/v1/users/search`);
        const usersData = await usersResponse.json(); 
        setUsers(usersData.users);
        
        const reviewResponse = await fetch(`${BACKEND_URL}/api/v1/beers/${id}/reviews`);
        const reviewData = await reviewResponse.json(); 
        const reviews = reviewData.reviews;
  
        
        const currentUserReview = reviews.find(review => review.user_id === parseInt(userId, 10));
        const otherReviews = reviews.filter(review => review.user_id !== parseInt(userId, 10));
        const orderedReviews = currentUserReview ? [currentUserReview, ...otherReviews] : reviews;
  
        setReviews(orderedReviews);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching details:', error);
        setError('Error fetching details');
        setLoading(false);
      }
    };
  
    fetchBeerAndDetails();
  }, [id]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/beers/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          review: {
            text: review,
            rating: rating,
            beer_id: id,
            user_id: currentUserId,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          setError(errorData.errors.join(', '));
        } else {
          throw new Error('Network error.');
        }
        setIsSubmitting(false);
        return;
      }

      setReview('');
      setRating(1);
      setModalVisible(false);

     
      const updatedReviews = await fetch(`${BACKEND_URL}/api/v1/beers/${id}/reviews`);
      const updatedReviewData = await updatedReviews.json();
      setReviews(updatedReviewData.reviews);

    } catch (error) {
      console.error('Error:', error);
      setError('No se pudo enviar la reseña. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  return ( 
    <ScrollView style={styles.container}>
      <Text style={styles.beerName}>{beer.name}</Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>Marca:</Text>
        <Text style={styles.detailValue}>{brand || 'N/A'}</Text>
      </View>
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
        <Text style={styles.detailLabel}>Lúpulo:</Text>
        <Text style={styles.detailValue}>{beer.hop || 'N/A'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>Malta:</Text>
        <Text style={styles.detailValue}>{beer.malts || 'N/A'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>Levadura:</Text>
        <Text style={styles.detailValue}>{beer.yeast || 'N/A'}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>Calificación Promedio:</Text>
        <Text style={styles.detailValue}>{`${Math.round(beer.avg_rating * 10) / 10}/5` || 'N/A'}</Text>
      </View>

      {/* Horizontal scroll for bars */}
      <Text style={styles.barsTitle}>Bares:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {bars.length > 0 ? (
          bars.map((bar) => (
            <View key={bar.id} style={styles.barContainer}>
              <Text style={styles.barText}>{bar.name}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noBarsText}>Sin bares disponibles</Text>
        )}
      </ScrollView>

      {/* Horizontal scroll for reviews */}
      <Text style={styles.reviewsTitle}>Reseñas:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {reviews.length > 0 ? (
          reviews.map((item) => {
            // Find the reviewer by user_id
            const reviewer = users.find(user => user.id === item.user_id);
            return (
              <View key={item.id} style={styles.reviewContainer}>
                <Text style={styles.reviewText}>{item.text}</Text>
                <Text style={styles.reviewRating}>Calificación: {item.rating}</Text>
                <Text style={styles.reviewerHandle}>Autor: {reviewer ? reviewer.handle : 'Desconocido'}</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.noReviewsText}>Sin reseñas</Text>
        )}
      </ScrollView>

      
      <Button title="Dejar una Reseña" onPress={() => setModalVisible(true)} />
      <Modal
        animationType="fade"
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
            <Text style={styles.label}>Calificación: {rating}</Text>
            
            <Rating
              style={styles.rating}
              imageSize={30}
              startingValue={rating}
              fractions={0} 
              ratingImage="beer"
              onFinishRating={(value) => setRating(value)}
              minValue={0}
              maxValue={5}
            />
            
            <Button title="Enviar" onPress={handleSubmit} />
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
  barsTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginVertical: 10,
  },
  barContainer: {
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  barText: {
    fontWeight: 'bold',
  },
  noBarsText: {
    color: '#888',
  },
  reviewsTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginVertical: 10,
  },
  reviewContainer: {
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    maxWidth: 300,
  },
  reviewText: {
    marginBottom: 5,
    whiteSpace: 'pre-wrap',
  },
  reviewRating: {
    fontWeight: 'bold',
  },
  reviewerHandle: {
    fontStyle: 'italic',
    color: '#888',
  },
  noReviewsText: {
    color: '#888',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  iconsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default Beer;





