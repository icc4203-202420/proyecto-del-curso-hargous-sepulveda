import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import './Beer.css';

const Beer = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [beer, setBeer] = useState(null);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bars, setBars] = useState([]);

  useEffect(() => {
    const fetchBeerAndDetails = async () => {
      try {
        // Fetch beer details
        const beerResponse = await axios.get(`http://localhost:3001/api/v1/beers/${id}`);
        setBeer(beerResponse.data.beer);

        // Fetch bars where the beer is served
        const barsResponse = await axios.get(`http://localhost:3001/api/v1/beers/${id}/bars`);
        setBars(barsResponse.data.bars);

        // Fetch brand details if available
        if (beerResponse.data.beer.brand_id) {
          const brandResponse = await axios.get(`http://localhost:3001/api/v1/brands/${beerResponse.data.beer.brand_id}`);
          setBrand(brandResponse.data.name);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching beer details or bars:', error);
        setError('Error fetching beer details or bars');
        setLoading(false);
      }
    };

    fetchBeerAndDetails();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    beer && (
      <Card className="beer-card">
        <Box className="beer-card-container">
          <IconButton
            className="close-button"
            onClick={() => navigate(-1)} // Go back to the previous page
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
              Rating: {beer.avg_rating ? `${beer.avg_rating}/5` : 'N/A'}
            </Box>
          <CardContent className="beer-card-content">
            <Typography className="beer-card-title" variant="h4" component="div">
              {beer.name || 'N/A'}
            </Typography>
            <Typography className="beer-card-text">
              <span className="beer-card-strong">Brand Name:</span> {brand || 'N/A'}
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

          {/* Render bars where the beer is served */}
          <Box className="bars-section">
            <Typography variant="h5">Available At</Typography>
            <Typography variant="body2">*This will normally be a button to show bars on a map, but the map is not available yet*</Typography>
            {bars.length > 0 ? (
              bars.map(bar => (
                <Box key={bar.id} className="bar-card">
                  <Typography variant="h6">{bar.name}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2">No bars serving this beer.</Typography>
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

