import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3001/api/v1/events');
        const eventData = response.data.events;

        const eventsWithBarNames = await Promise.all(eventData.map(async (event) => {
          if (event.bar_id) {
            try {
              const barResponse = await axios.get(`http://localhost:3001/api/v1/bars/${event.bar_id}`);
              return { ...event, bar_name: barResponse.data.bar.name };
            } catch (barError) {
              console.error(`Error fetching bar data for bar_id: ${event.bar_id}`, barError);
              return { ...event, bar_name: 'Unknown Bar' };
            }
          } else {
            return { ...event, bar_name: 'No Bar' };
          }
        }));

        setEvents(eventsWithBarNames);
        setFilteredEvents(eventsWithBarNames); 
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Error fetching events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);


  useEffect(() => {
    if (!events.length) return;

    if (query && query.trim() !== '') {
      const lowerCaseQuery = query.toLowerCase();
      const filtered = events.filter((event) =>
        event.name.toLowerCase().includes(lowerCaseQuery) ||
        (event.bar_name && event.bar_name.toLowerCase().includes(lowerCaseQuery))
      );

      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events); 
    }
  }, [query, events]);

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

  const groupedEvents = groupByBar(filteredEvents);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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
                        {event.bar_name ? `Date: ${new Date(event.start_date).toLocaleString() }` : 'No Date'}
                      </Typography>
                    </CardContent>
                    <CardMedia
                      component="img"
                      sx={{ width: 140, maxWidth: '100%' }}
                      image={event.image || 'default-image.jpg'}
                      alt="no photo yet"
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
