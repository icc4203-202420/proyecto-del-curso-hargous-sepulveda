import React, { useState, useEffect } from 'react';
import axios from 'axios';  
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './BarList.css';

const BarList = () => {
  const [bars, setBars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBars = async () => {
      try {
         
        const response = await axios.get('http://localhost:3001/api/v1/bars');  
        setBars(response.data.bars);  
      } catch (error) {
        console.error('Error fetching bars:', error);
      }
    };
    fetchBars();
  }, []);

 
  const filteredBars = bars.filter(bar =>
    bar.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='container' id='fondo'>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for a bar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ul>
        {filteredBars.map(bar => (
          <li key={bar.id}>
            <Card sx={{ maxWidth: 345 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {bar.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {bar.address}
                  </Typography>
                </CardContent>
                <CardMedia
                  component="img"
                  sx={{ width: 140 }}
                  image={bar.image || 'default-image.jpg'}  
                  alt={bar.name}
                />
              </Box>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BarList;
