import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import './Bar.css';

const Bar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bar, setBar] = useState(null);
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBarAndBeers = async () => {
      try {
        const barResponse = await axios.get(`http://localhost:3001/api/v1/bars/${id}`);
        console.log('Bar Response:', barResponse.data); 
        setBar(barResponse.data.bar);

        const beersResponse = await axios.get(`http://localhost:3001/api/v1/bars/${id}/beers`);
        console.log('Beers Response:', beersResponse.data); 
        setBeers(beersResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching bar details or beers:', error);
        setError('Error fetching bar details or beers');
        setLoading(false);
      }
    };

    fetchBarAndBeers();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    bar && (
      <Card className="bar-card">
        <Box className="bar-card-container">
          <IconButton
            className="close-button"
            onClick={() => navigate(-1)} 
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Box className="bar-card-media-container">
            {bar.image_url ? (
              <CardMedia
                component="img"
                className="bar-card-img"
                image={bar.image_url}
                alt={`${bar.name} image`}
              />
            ) : (
              <Typography variant="body2">No image available</Typography>
            )}
          </Box>
          <CardContent className="bar-card-content">
            <Typography className="bar-card-title" variant="h4" component="div">
              {bar.name || 'N/A'}
            </Typography>
            <Typography className="bar-card-text">
              <span className="bar-card-strong">Location:</span> {bar.location || 'N/A'}
            </Typography>
            <Typography className="bar-card-text">
              <span className="bar-card-strong">Address:</span> {bar.address || 'N/A'}
            </Typography>
            <Typography className="bar-card-text">
              <span className="bar-card-strong">Phone:</span> {bar.phone || 'N/A'}
            </Typography>
          </CardContent>

          {/* Render beers available at the bar */}
          
          
          <Box className="reviews-section">
          <Typography variant="h5">Beers Available</Typography>
          <Box className="reviews-section-sub">
          {Array.isArray(beers) && beers.length > 0 ? (
            beers.map(beer => (
              <Box key={beer.id} className="review-card">
                <Typography variant="h6">{beer.name}</Typography>
                {beer.image_url && (
                  <CardMedia
                    component="img"
                    className="beer-card-img"
                    image={beer.image_url}
                    alt={`${beer.name} image`}
                  />
                )}
                <Typography variant="body2">Rating: {beer.avg_rating || 'N/A'}</Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2">No beers available at this bar.</Typography>
          )}
        </Box>
        </Box>
        </Box>
      </Card>
    )
  );
};

export default Bar;


