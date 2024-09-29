import React, { useState, useEffect, useReducer } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import './Beer.css';

const initialReviewState = {
  loading: false,
  error: null,
  reviews: [],
};

const reviewReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, reviews: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const Beer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [beer, setBeer] = useState(null);
  const [brand, setBrand] = useState(null);
  const [brewery, setBrewery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bars, setBars] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviewState, dispatch] = useReducer(reviewReducer, initialReviewState);
  
  const currentUserId = sessionStorage.getItem('userId'); 
  console.log(currentUserId)
  useEffect(() => {
    const fetchBeerAndDetails = async () => {
      try {
        const beerResponse = await axios.get(`http://localhost:3001/api/v1/beers/${id}`);
        setBeer(beerResponse.data.beer);

        const barsResponse = await axios.get(`http://localhost:3001/api/v1/beers/${id}/bars`);
        setBars(barsResponse.data.bars);

        if (beerResponse.data.beer.brand_id) {
          const brandResponse = await axios.get(`http://localhost:3001/api/v1/brands/${beerResponse.data.beer.brand_id}`);
          setBrand(brandResponse.data.name);
        }
        if (beerResponse.data.beer.brewery_id) {
          const breweryResponse = await axios.get(`http://localhost:3001/api/v1/brewery/${beerResponse.data.beer.brewery_id}`);
          setBrewery(breweryResponse.data.name);
        }

        const usersResponse = await axios.get(`http://localhost:3001/api/v1/users/search`);
        setUsers(usersResponse.data.users);

        dispatch({ type: 'FETCH_INIT' });
        const reviewResponse = await axios.get(`http://localhost:3001/api/v1/beers/${id}/reviews`);

        const reviews = reviewResponse.data.reviews;
        const currentUserReview = reviews.find(review => review.user_id === currentUserId);
        const otherReviews = reviews.filter(review => review.user_id !== currentUserId);
        const orderedReviews = currentUserReview ? [currentUserReview, ...otherReviews] : reviews;

        dispatch({ type: 'FETCH_SUCCESS', payload: orderedReviews });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching beer details or bars:', error);
        setError('Error fetching beer details or bars');
        setLoading(false);
        dispatch({ type: 'FETCH_FAILURE', payload: 'Error fetching reviews' });
      }
    };

    fetchBeerAndDetails();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const { loading: reviewLoading, error: reviewError, reviews } = reviewState;

  const getUserHandle = (userId) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.handle : 'Unknown User';
  };

  return (
    beer && (
      <div className="show-beer">
        <div className='mid'>
          <Card className="beer-card">
            <Box className="beer-card-container">
              <IconButton
                className="close-button"
                onClick={() => navigate(-1)} 
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
              <Box className="beer-card-media-container">
                {beer.image_url ? (
                  <CardMedia
                    component="img"
                    className="beer-card-img"
                    image={beer.image_url}
                    alt={`${beer.name} image`}
                  />
                ) : (
                  <Typography variant="body2">No image available</Typography>
                )}
              </Box>
              <Box className="average-rating-bubble">
                Rating: {beer.avg_rating ? `${Math.round(beer.avg_rating * 10) / 10}/5` : 'N/A'}
              </Box>
              <CardContent className="beer-card-content">
                <Typography className="beer-card-title" variant="h4" component="div">
                  {beer.name || 'N/A'}
                </Typography>
                <Typography className="beer-card-text">
                  <span className="beer-card-strong">Brand:</span> {brand || 'N/A'}
                </Typography>
                <Typography className="beer-card-text">
                  <span className="beer-card-strong">Brewery:</span> {brewery || 'N/A'}
                </Typography>
                <Typography className="beer-card-text">
                  <span className="beer-card-strong">Style:</span> {beer.style || 'N/A'}
                </Typography>
                <Typography className="beer-card-text">
                  <span className="beer-card-strong">Hop:</span> {beer.hop || 'N/A'}
                </Typography>
                <Typography className="beer-card-text">
                  <span className="beer-card-strong">Yeast:</span> {beer.yeast || 'N/A'}
                </Typography>
                <Typography className="beer-card-text">
                  <span className="beer-card-strong">Malts:</span> {beer.malts || 'N/A'}
                </Typography>
                <Typography className="beer-card-text">
                  <span className="beer-card-strong">IBU:</span> {beer.ibu || 'N/A'}
                </Typography>
                <Typography className="beer-card-text">
                  <span className="beer-card-strong">Alcohol:</span> {beer.alcohol || 'N/A'}
                </Typography>
                <Typography className="beer-card-text">
                  <span className="beer-card-strong">BLG:</span> {beer.blg || 'N/A'}
                </Typography>
              </CardContent>

              <Box className="bar-section">
                <Typography variant="h5">Available At</Typography>
                <Box className="bar-section-sub">
                  {Array.isArray(bars) && bars.length > 0 ? (
                    bars.map(bar => (
                      <Link to={`/bars/${bar.id}`} key={bar.id} className=".review-card">
                        <Box key={bar.id} className="review-card">
                          <Typography variant="h6">{bar.name}</Typography>
                          {bar.image_url && (
                            <CardMedia
                              component="img"
                              className="bar-card-img"
                              image={bar.image_url}
                              alt={`${bar.name} image`}
                            />
                          )}
                          <Typography variant="body2">
                            Address: {`${bar.line1}, ${bar.city}, ${bar.country}` || 'N/A'}
                          </Typography>
                        </Box>
                      </Link>
                    ))
                  ) : (
                    <Typography variant="body2">No bars serving this beer.</Typography>
                  )}
                </Box>
              </Box>

              <Box className="reviews-section">
                <Typography variant="h5">Reviews</Typography>
                <Box className="reviews-section_sub">
                  {reviewLoading ? (
                    <Typography variant="body2">Loading reviews...</Typography>
                  ) : reviewError ? (
                    <Typography variant="body2">{reviewError}</Typography>
                  ) : reviews.length > 0 ? (
                    reviews.map(review => (
                      <Card key={review.id} className="review-card">
                        <div className='rating'>
                          <Typography className="rating-text" variant="body2">Rating: {review.rating}/5</Typography>
                        </div>
                        <Typography className="reviewer-text" variant="body2">
                          Reviewer: {getUserHandle(review.user_id)}
                        </Typography>
                        <Typography className="review-text" variant="body2">{review.text}</Typography>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body2">No reviews available.</Typography>
                  )}
                </Box>
              </Box>

              <Button
                variant="contained"
                onClick={() => navigate(`/beers/${id}/review`)} 
              >
                Leave a Review
              </Button>
            </Box>
          </Card>
        </div>
      </div>
    )
  );
};

export default Beer;


