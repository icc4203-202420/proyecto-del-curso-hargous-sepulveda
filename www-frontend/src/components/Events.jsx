import React, { useState, useEffect } from 'react';
import axios from 'axios';  
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        
        const response = await axios.get('http://localhost:3001/api/v1/events');  
        setEvents(response.data.events);  
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);
 
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="event-list-content">  
      <div className="event-list">
        {filteredEvents.map(event => (
          <div key={event.name} className="event-card">
            <Card sx={{ maxWidth: 345 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <CardContent sx={{ flex: 1 }}id = "card">
                  <Typography gutterBottom variant="h5" component="div">
                    {event.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {event.bar_id ? `Bar id: ${event.bar_id}` : 'No Bar'}
                  </Typography>
                </CardContent>
                <CardMedia
                  component="img"
                  sx={{ width: 140, maxWidth: '100%' }}
                  image={event.image || 'default-image.jpg'}
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

export default Events;
