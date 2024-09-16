import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const [attendees, setAttendees] = useState([]); // Lista de asistentes (nombres)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // Llamada para obtener los detalles del evento
        const eventResponse = await axios.get('http://localhost:3001/api/v1/events');
        const selectedEvent = eventResponse.data.events.find((e) => e.id.toString() === id);

        // Si se encuentra el evento, obtenemos los detalles del bar y los asistentes
        if (selectedEvent) {
          setEvent(selectedEvent);

          // Obtener el nombre del bar si existe un bar asociado
          if (selectedEvent.bar_id) {
            try {
              const barResponse = await axios.get(`http://localhost:3001/api/v1/bars/${selectedEvent.bar_id}`);
              setBarName(barResponse.data.bar.name);
              setBarId(selectedEvent.bar_id);
            } catch (barError) {
              console.error('Error fetching bar details:', barError);
              setBarName('Unknown Bar');
            }
          }

          // Llamada para obtener la lista de asistentes del evento
          const attendanceResponse = await axios.get(`http://localhost:3001/api/v1/attendances/event/${id}`);
          const attendeesData = attendanceResponse.data.attendees;

          // Para cada asistente (user ID), obtener su nombre
          const attendeesNamesPromises = attendeesData.map(async (userId) => {
            try {
              const userResponse = await axios.get(`http://localhost:3001/api/v1/users/${userId}`);
              return userResponse.data.user.name; // Obtener el nombre del usuario
            } catch (userError) {
              console.error(`Error fetching user ${userId} details:`, userError);
              return 'Unknown User'; // Si falla la petición
            }
          });

          const attendeesNames = await Promise.all(attendeesNamesPromises); // Espera a que todas las promesas se resuelvan
          setAttendees(attendeesNames); // Actualizar con los nombres
        } else {
          setEvent(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event details or attendees:', error);
        setError('Error fetching event details or attendees');
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

            {/* Mostrar la lista de nombres de los asistentes */}
            <Typography variant="h6" sx={{ mt: 3 }}>
              Asistentes:
            </Typography>
            {attendees.length > 0 ? (
              attendees.map((userName, index) => (
                <Typography key={index} variant="body2">
                  {userName}
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
