import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './BeerList.css';
import { Link } from 'react-router-dom';

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
    if (!acc[beer.style]) {
      acc[beer.style] = [];
    }
    acc[beer.style].push(beer);
    return acc;
  }, {});

  return (
    <div className="beer-list-content">
      {Object.keys(beersByType).map(style => (
        <div key={style} className="type-section" sx={{ minWidth: 200}}>
          <h6 className="type-title">{style}</h6>
          <div className="beer-list">
            {beersByType[style].map(beer => (
              <Link to={`/beers/${beer.id}`} key={beer.name} className="beer-card-link">
                <Card sx={{ maxWidth: 400, minWidth: 200}} className="beer-card">
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





