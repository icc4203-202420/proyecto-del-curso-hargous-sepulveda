import React, { useState, useEffect } from 'react';
import axios from 'axios'; //axios pa  hacer solicitudes http
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './BeerList.css';

const BeerList = () => {
  const [beers, setBeers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBeers = async () => {
      try {
        // la solicitud a la API
        const response = await axios.get('http://localhost:3001/api/v1/beers'); // hay que usar la url correcta
        setBeers(response.data.beers);  
      } catch (error) {
        console.error('Error fetching beers:', error);
      }
    };
    fetchBeers();
  }, []);

  // esto filtra cervezas según la búsqueda
  const filteredBeers = beers.filter(beer =>
    beer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='container' id='fondo'>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for a beer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ul>
        {filteredBeers.map(beer => (
          <li key={beer.id}>
            <Card sx={{ maxWidth: 345 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
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
                  sx={{ width: 140 }}
                  image={beer.image || 'default-image.jpg'} // pa tener una imagen por defecto
                  alt={beer.name}
                />
              </Box>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BeerList;
