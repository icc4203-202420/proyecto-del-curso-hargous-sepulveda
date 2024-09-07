import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
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
    <div className="bar-list-content">  
      <div className="bar-list">
        {filteredBars.map(bar => (
          <div key={bar.name} className="bar-card">
            <Card sx={{ maxWidth: 345 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <CardContent sx={{ flex: 1 }}id = "card">
                  <Typography gutterBottom variant="h5" component="div">
                    {bar.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {bar.address_id ? `Address id:${bar.address_id}` : 'No Address'}
                  </Typography>
                </CardContent>
                <CardMedia
                  component="img"
                  sx={{ width: 140, maxWidth: '100%' }}
                  image={bar.image || 'default-image.jpg'}
                  alt='no photo yet'
                />
              </Box>
            </Card>
          </div>
        ))}
        </div>
      </div>
  );
};

export default BarList;


