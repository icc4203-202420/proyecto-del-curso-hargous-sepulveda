import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './BeerList.css';
import { Link, useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
const BeerList = () => {
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchBeers = async () => {
      setLoading(true);
      try {
        const response = query 
          ? await axios.get(`http://localhost:3001/api/v1/beers/search?q=${query}`)
          : await axios.get('http://localhost:3001/api/v1/beers');

        setBeers(response.data.beers);
      } catch (error) {
        console.error('Error fetching beers:', error);
        setError('Error fetching beers');
      } finally {
        setLoading(false);
      }
    };

    fetchBeers();
  }, [query]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const beersByType = beers.reduce((acc, beer) => {
    if (!acc[beer.style]) {
      acc[beer.style] = [];
    }
    acc[beer.style].push(beer);
    return acc;
  }, {});

  return (
    <div className="beer-list-content">
      {Object.keys(beersByType).map(style => (
        <div key={style} className="type-section" sx={{ minWidth: 200 }}>
          <h6 className="type-title">{style}</h6>
          <div className="beer-list">
            {beersByType[style].map(beer => (
              <Link to={`/beers/${beer.id}`} key={beer.id} className="beer-card-link">
                <Card sx={{ maxWidth: 400, minWidth: 200 }} className="beer-card">
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <CardContent sx={{ flex: 1 }} id="card">
                      <Typography gutterBottom variant="h5" component="div">
                        {beer.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {beer.avg_rating ? `${beer.avg_rating}/5` : 'No rating'}
                      </Typography>
                    </CardContent>
                    <CardMedia
                      component="img"
                      sx={{ width: 140, maxWidth: '100%' }}
                      image={beer.thumbnail_url || 'default-image.jpg'}
                      alt='no photo yet'
                    />
                  </Box>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BeerList;






