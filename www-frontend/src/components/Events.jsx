import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importa Link para redirigir
import axios from 'axios';  
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
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
        const eventData = response.data.events;

        // Mapeamos los eventos con las llamadas para obtener el nombre del bar basado en `bar_id`
        const eventsWithBarNames = await Promise.all(eventData.map(async (event) => {
          if (event.bar_id) {
            try {
              const barResponse = await axios.get(`http://localhost:3001/api/v1/bars/${event.bar_id}`);
              return { ...event, bar_name: barResponse.data.bar.name };
            } catch (barError) {
              console.error(`Error fetching bar data for bar_id: ${event.bar_id}`, barError);
              return { ...event, bar_name: 'Unknown Bar' }; // En caso de error, muestra "Unknown Bar"
            }
          } else {
            return { ...event, bar_name: 'No Bar' };
          }
        }));

        setEvents(eventsWithBarNames); // Guardamos los eventos con el nombre del bar
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  // Group events by bar name
  const groupByBar = (events) => {
    return events.reduce((acc, event) => {
      const barName = event.bar_name || 'No Bar';
      if (!acc[barName]) {
        acc[barName] = [];
      }
      acc[barName].push(event);
      return acc;
    }, {});
  };

  // Filter events based on search term
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group filtered events by bar name
  const groupedEvents = groupByBar(filteredEvents);

  return (
    <div className="event-list-content">
      <div className="event-list">
        {Object.keys(groupedEvents).map(barName => (
          <div key={barName} className="event-group">
            <h2>{barName}</h2>
            {groupedEvents[barName].map(event => (
              <Link to={`/events/${event.id}`} key={event.id} className="event-link">
                <Card sx={{ maxWidth: 345 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <CardContent sx={{ flex: 1 }} id="card">
                      <Typography gutterBottom variant="h5" component="div">
                        {event.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {event.bar_name ? `Bar: ${event.bar_name}` : 'No Bar'}
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
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;