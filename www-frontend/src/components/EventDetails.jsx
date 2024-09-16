import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Importa Link para redirigir
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';

const EventDetails = () => {
  const { id } = useParams(); // Obtener el ID del evento desde la URL
  const [event, setEvent] = useState(null);
  const [barName, setBarName] = useState(''); // Estado para guardar el nombre del bar
  const [barId, setBarId] = useState(null); // Estado para guardar el ID del bar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // Llamada a la API para obtener todos los eventos
        const response = await axios.get('http://localhost:3001/api/v1/events');
        
        // Filtrar el evento por el `id` de los parámetros de la URL
        const selectedEvent = response.data.events.find((e) => e.id.toString() === id);
        
        // Si el evento existe, buscamos el nombre del bar
        if (selectedEvent) {
          setEvent(selectedEvent);
          
          if (selectedEvent.bar_id) {
            try {
              // Llamada para obtener el nombre del bar basado en `bar_id`
              const barResponse = await axios.get(`http://localhost:3001/api/v1/bars/${selectedEvent.bar_id}`);
              setBarName(barResponse.data.bar.name);
              setBarId(selectedEvent.bar_id); // Guarda el ID del bar
            } catch (barError) {
              console.error('Error fetching bar details:', barError);
              setBarName('Unknown Bar');
            }
          }
        } else {
          setEvent(null);
        }
        setLoading(false);
      } catch (error) {
        setError('Error fetching event details');
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    event ? (
      <Card sx={{ maxWidth: 600, margin: 'auto', mt: 4, padding: 2, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <CardContent sx={{ flex: 1 }}>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {event.name}
            </Typography>
            <Typography variant="h6" sx={{ color: 'gray', mb: 2 }}>
              Bar: {
                barId ? (
                  <Link to={`/bars/${barId}`} style={{ textDecoration: 'none', color: 'blue' }}>
                    {barName}
                  </Link>
                ) : 'No Bar'
              }
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Descripción:</strong> {event.description || 'No disponible'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Fecha de inicio:</strong> {new Date(event.start_date).toLocaleString() || 'No disponible'}
            </Typography>
            <Typography variant="body1">
              <strong>Fecha de fin:</strong> {new Date(event.end_date).toLocaleString() || 'No disponible'}
            </Typography>
          </CardContent>
          {event.thumbnail_url && (
            <CardMedia
              component="img"
              sx={{ width: 200, borderRadius: 2 }}
              image={event.thumbnail_url || 'default-image.jpg'}
              alt="event image"
            />
          )}
        </Box>
      </Card>
    ) : (
      <div>No se encontró el evento.</div>
    )
  );
};

export default EventDetails;
