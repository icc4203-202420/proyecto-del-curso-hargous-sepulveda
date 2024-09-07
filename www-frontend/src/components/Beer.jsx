import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './Beer.css';

const Beer = () => {
  const { id } = useParams();
  const [beer, setBeer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBeerAndReviews = async () => {
      try {
        // Fetch beer details
        const beerResponse = await axios.get(`http://localhost:3001/api/v1/beers/${id}`);
        setBeer(beerResponse.data.beer);

        // Fetch reviews for the beer
        const reviewsResponse = await axios.get(`http://localhost:3001/api/v1/beers/${id}/reviews`);
        setReviews(reviewsResponse.data.reviews || []);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching beer details or reviews:', error);
        setError('Error fetching beer details or reviews');
        setLoading(false);
      }
    };

    fetchBeerAndReviews();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    beer && (
      <Card className="beer-card">
        <Box className="beer-card-container">
          {beer.image_url && (
            <CardMedia
              component="img"
              className="beer-card-img"
              image={beer.image_url}
              alt={`${beer.name} image`}
            />
          )}
          <CardContent className="beer-card-content">
            <Typography className="beer-card-title" variant="h4" component="div">
              {beer.name || 'N/A'}
            </Typography>
            <Typography className="beer-card-text">
              <span className="beer-card-strong">Type:</span> {beer.beer_type ?? 'N/A'}
            </Typography>
            <Typography className="beer-card-text">
              <span className="beer-card-strong">Brand ID:</span> {beer.brand_id ?? 'N/A'}
            </Typography>
            <Typography className="beer-card-text">
              <span className="beer-card-strong">Style:</span> {beer.style ?? 'N/A'}
            </Typography>
            <Typography className="beer-card-text">
              <span className="beer-card-strong">Hop:</span> {beer.hop ?? 'N/A'}
            </Typography>
            <Typography className="beer-card-text">
              <span className="beer-card-strong">Yeast:</span> {beer.yeast ?? 'N/A'}
            </Typography>
            <Typography className="beer-card-text">
              <span className="beer-card-strong">Malts:</span> {beer.malts ?? 'N/A'}
            </Typography>
            <Typography className="beer-card-text">
              <span className="beer-card-strong">IBU:</span> {beer.ibu ?? 'N/A'}
            </Typography>
            <Typography className="beer-card-text">
              <span className="beer-card-strong">Alcohol:</span> {beer.alcohol ?? 'N/A'}
            </Typography>
            <Typography className="beer-card-text">
              <span className="beer-card-strong">BLG:</span> {beer.blg ?? 'N/A'}
            </Typography>
          </CardContent>

          {/* Reviews Section */}
          <Box className="reviews-section" sx={{ marginTop: '20px', width: '100%' }}>
            <Typography variant="h5" component="div" sx={{ marginBottom: '16px' }}>
              Reviews
            </Typography>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Box key={review.id} className="review-card" sx={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <Typography variant="body1" className="review-text">
                    {review.text}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Rating:</strong> {review.rating}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>By:</strong> {review.reviewer_name}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No reviews available for this beer.
              </Typography>
            )}
          </Box>
        </Box>
      </Card>
    )
  );
};

export default Beer;


//<Card className="beer-review-card">
//<Box className="beer-review-card-container">
//  <CardContent className="beer-review-card-content">
//    <Typography className="beer-review-card-title" variant="h4" component="div">
//      {review.rating}
//    </Typography>
//    <Typography className="beer-review-card-text">
//      {review.text}
//    </Typography>
//  </CardContent>
//</Box>
//</Card>    

