import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './BeerList.css';

const BeerList = () => {
  const [beers, setBeers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBeers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/v1/beers');
        setBeers(response.data.beers);
      } catch (error) {
        console.error('Error fetching beers:', error);
      }
    };
    fetchBeers();
  }, []);

  const filteredBeers = beers.filter(beer =>
    beer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const beersByType = filteredBeers.reduce((acc, beer) => {
    if (!acc[beer.type]) {
      acc[beer.type] = [];
    }
    acc[beer.type].push(beer);
    return acc;
  }, {});

  return (
    <div className="beer-list-content">
      {Object.keys(beersByType).map(type => (
        <div key={type} className="type-section">
          <h6 className="type-title">{type}</h6>
          <div className="beer-list">
            {beersByType[type].map(beer => (
              <div key={beer.name} className="beer-card">
                <Card sx={{ maxWidth: 345 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <CardContent sx={{ flex: 1 }}>
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
                      image={beer.image || 'default-image.jpg'}
                      alt={beer.name}
                    />
                  </Box>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BeerList;




