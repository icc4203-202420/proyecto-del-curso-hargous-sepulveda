import React, { useState, useEffect, useReducer } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import './UserProfile.css';

// Initial state for reviews and events
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

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState(null);
  const [reviewState, dispatch] = useReducer(reviewReducer, initialReviewState);
  const [isFriend, setIsFriend] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  const [eventSuggestions, setEventSuggestions] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true); // State for loading events
  const [eventError, setEventError] = useState(null); // State for event error

  const currentUserId = sessionStorage.getItem('userId');
  useEffect(() => {
    const fetchUserDetailsAndReviews = async () => {
      try {
        const userResponse = await axios.get(`http://localhost:3001/api/v1/users/${id}`);
        setUser(userResponse.data.user);
        setLoadingUser(false);

        const friendshipResponse = await axios.get(`http://localhost:3001/api/v1/users/${id}/friendships`);
        const isFriend = friendshipResponse.data.some(friend => friend.id === currentUserId);
        setIsFriend(isFriend);

        dispatch({ type: 'FETCH_INIT' });
        const reviewResponse = await axios.get(`http://localhost:3001/api/v1/users/${id}/reviews`);
        let reviews = reviewResponse.data.reviews;

        if (reviews.length > 0) {
          const beerIds = [...new Set(reviews.map(review => review.beer_id))];
          const beerPromises = beerIds.map(beerId =>
            axios.get(`http://localhost:3001/api/v1/beers/${beerId}`)
          );
          const beersResponses = await Promise.all(beerPromises);
          const beers = beersResponses.map(response => response.data.beer);
          const beerMap = {};
          beers.forEach(beer => {
            beerMap[beer.id] = beer;
          });
          reviews = reviews.map(review => ({
            ...review,
            beer: beerMap[review.beer_id] || { id: null, name: 'Unknown Beer' },
          }));
        }

        dispatch({ type: 'FETCH_SUCCESS', payload: reviews });

        // Fetch events for the suggestions
        const eventsResponse = await axios.get(`http://localhost:3001/api/v1/events`);
        setEventSuggestions(eventsResponse.data.events);
        setLoadingEvents(false); // Set loading to false after fetching
      } catch (error) {
        console.error('Error fetching user details or reviews:', error);
        if (loadingUser) {
          setErrorUser('Error fetching user details');
          setLoadingUser(false);
        } else {
          dispatch({ type: 'FETCH_FAILURE', payload: 'Error fetching reviews' });
        }
      }
    };

    fetchUserDetailsAndReviews();
  }, [id, loadingUser]);

  const handleAddFriend = () => {
    setDialogOpen(true);
  };

  const handleConfirmAddFriend = async () => {
    const token = sessionStorage.getItem('jwtToken');
    try {
      await axios.post(
        `http://localhost:3001/api/v1/users/${id}/friendships`,
        { friend_id: currentUserId, event_id: selectedEventTitle }, // Use selected event title
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFriend(true);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      const token = sessionStorage.getItem('jwtToken');
      await axios.delete(`http://localhost:3001/api/v1/users/${id}/friendships`, {
        data: { friend_id: currentUserId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsFriend(false);
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const { loading: reviewLoading, error: reviewError, reviews } = reviewState;

  if (loadingUser) {
    return (
      <div className="loading">
        <CircularProgress />
      </div>
    );
  }

  if (errorUser) {
    return <Alert severity="error">{errorUser}</Alert>;
  }

  return (
    <div className="show-profile">
      <div className="mid">
        <Card className="profile-card">
          <Box className="profile-card-container">
            <IconButton
              className="close-button"
              onClick={() => navigate(-1)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <CardContent className="profile-card-content">
              <Typography className="profile-card-title" variant="h4" component="div">
                @{user.handle}
              </Typography>
              <IconButton
                className="add-person-button"
                onClick={isFriend ? handleRemoveFriend : handleAddFriend}
                aria-label={isFriend ? "remove friend" : "add friend"}
              >
                {isFriend ? <PersonRemoveIcon /> : <PersonAddIcon />}
              </IconButton>
              <Typography className="profile-card-text">
                <span className="profile-card-strong">Name:</span> {user.name || 'N/A'}
              </Typography>
              {user.bio && (
                <Typography className="profile-card-text">
                  <span className="profile-card-strong">Bio:</span> {user.bio}
                </Typography>
              )}
            </CardContent>

            <Box className="reviews-section">
              <Typography variant="h5">Reviews</Typography>
              <Box className="reviews-section_sub">
                {reviewLoading ? (
                  <Box className="loading">
                    <CircularProgress />
                  </Box>
                ) : reviewError ? (
                  <Alert severity="error">{reviewError}</Alert>
                ) : reviews.length > 0 ? (
                  reviews.map(review => (
                    <Card key={review.id} className="review-card">
                      <Box className="review-header">
                        <div className='rating'>
                          <Typography className="rating-text" variant="body2">Rating: {review.rating}/5</Typography>
                        </div>
                        <Typography className="beer-text" variant="body2">
                          Beer:{' '}
                          {review.beer.id ? (
                            <Link to={`/beers/${review.beer.id}`}>{review.beer.name}</Link>
                          ) : (
                            'Unknown Beer'
                          )}
                        </Typography>
                      </Box>
                      <Typography className="review-text" variant="body2">
                        {review.text}
                      </Typography>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2">{user.handle} hasn't left any reviews yet.</Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Card>
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add Friend</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={eventSuggestions}
            getOptionLabel={(option) => option.name} // Assuming the event object has a title field
            onChange={(event, newValue) => setSelectedEventTitle(newValue?.id || '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Event"
                variant="outlined"
                error={!selectedEventTitle} // Add validation feedback
              />
            )}
          />
          {loadingEvents && <CircularProgress size={24} />}
          {eventError && <Alert severity="error">{eventError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmAddFriend}
            disabled={!selectedEventTitle} // Disable button if no event is selected
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserProfile;





