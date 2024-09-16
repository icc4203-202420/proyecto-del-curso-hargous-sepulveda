import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'; // Importa el componente de botón

const EventDetails = () => {
  const { id } = useParams(); // Obtener el ID del evento desde la URL
  const [event, setEvent] = useState(null);
  const [barName, setBarName] = useState(''); // Estado para guardar el nombre del bar
  const [barId, setBarId] = useState(null); // Estado para guardar el ID del bar
  const [attendees, setAttendees] = useState([]); // Lista de asistentes (nombres)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasConfirmed, setHasConfirmed] = useState(false); // Nuevo estado para asistencia confirmada

  const currentUserId = sessionStorage.getItem('userId'); // ID del usuario autenticado

  const fetchEventDetails = async () => {
    try {
      const eventResponse = await axios.get('http://localhost:3001/api/v1/events');
      const selectedEvent = eventResponse.data.events.find((e) => e.id.toString() === id);

      if (selectedEvent) {
        setEvent(selectedEvent);

        if (selectedEvent.bar_id) {
          const barResponse = await axios.get(`http://localhost:3001/api/v1/bars/${selectedEvent.bar_id}`);
          setBarName(barResponse.data.bar.name);
          setBarId(selectedEvent.bar_id);
        }

        const attendanceResponse = await axios.get(`http://localhost:3001/api/v1/attendances/event/${id}`);
        const attendeesData = attendanceResponse.data.attendees;

        const attendeesNamesPromises = attendeesData.map(async (userId) => {
          const userResponse = await axios.get(`http://localhost:3001/api/v1/users/${userId}`);
          return { userId, name: userResponse.data.user.name };
        });

        const attendeesNames = await Promise.all(attendeesNamesPromises);
        setAttendees(attendeesNames);

        // Verificar si el usuario actual ya confirmó asistencia
        if (attendeesData.includes(parseInt(currentUserId))) {
          setHasConfirmed(true);
        }
      } else {
        setEvent(null);
      }
      setLoading(false);
    } catch (error) {
      setError('Error fetching event details or attendees');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails(); // Llamar cuando se monta el componente
  }, [id]);

  const confirmAttendance = async () => {
    try {
      await axios.post(`http://localhost:3001/api/v1/attendances`, {
        event_id: id,
        user_id: currentUserId,
      });
      setHasConfirmed(true);
      fetchEventDetails(); // Volver a cargar los detalles después de confirmar
    } catch (error) {
      console.error('Error confirming attendance:', error);
    }
  };

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

            {/* Mostrar el botón o mensaje según la asistencia confirmada */}
            {hasConfirmed ? (
              <Typography variant="h6" color="green" sx={{ mt: 3 }}>
                Has confirmado tu asistencia
              </Typography>
            ) : (
              <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={confirmAttendance}>
                Confirmar Asistencia
              </Button>
            )}

            <Typography variant="h6" sx={{ mt: 3 }}>
              Asistentes:
            </Typography>
            {attendees.length > 0 ? (
              attendees.map((attendee, index) => (
                <Typography key={index} variant="body2">
                  {attendee.name}  
                </Typography>
              ))
            ) : (
              <Typography variant="body2">No hay asistentes confirmados.</Typography>
            )}
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
