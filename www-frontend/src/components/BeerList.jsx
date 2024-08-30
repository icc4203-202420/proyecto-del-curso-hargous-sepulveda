import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './BeerList.css'

const BeerList = () => {
  const [beers, setBeers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('')
  useEffect(() => {  
    const fetchBeers = async () => {
      try {
        const response = await axios.get('/api/v1/beers');
        setBeers(response.data.beers);
      } catch (error) {
        console.error('Error fetching beers:', error);
      }
    }
    fetchBeers();
  }, [])
  const filteredBeers = beers.filter(beer =>
    beer.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div class='container' id='fondo' disableGutters maxWidth={false}>
            <Card className="beer-card" sx={{ maxWidth: 345 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <CardContent className="beer-card-content" sx={{ flex: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    Test Beer
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    4.5/5
                  </Typography>
                  </CardContent>
              <Box sx={{ width: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Here goes the photo of the beer</p>
          </Box>
        </Box>
      </Card>
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
                    {beer.avg_rating}
                  </Typography>
                </CardContent>
                <CardMedia
                  component="img"
                  sx={{ width: 140 }}
                  image={beer.image}
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
