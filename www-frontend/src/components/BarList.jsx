import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './BarList.css'

const BarList = () => {
  const [bars, setBars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('')
  useEffect(() => {  
    const fetchBars = async () => {
      try {
        const response = await axios.get('/api/v1/bars');
        setBars(response.data.bars);
      } catch (error) {
        console.error('Error fetching bars:', error);
      }
    }
    fetchBars();
  }, [])
  const filteredBars = bars.filter(bar =>
    bar.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div class='container' id='fondo' disableGutters maxWidth={false}>
            <Card className="bar-card" sx={{ maxWidth: 345 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <CardContent className="bar-card-content" sx={{ flex: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    Test Bar
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Address:
                  </Typography>
                  </CardContent>
              <Box sx={{ width: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Here goes the photo of the bar</p>
          </Box>
        </Box>
      </Card>
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
                  image={bar.image}
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
