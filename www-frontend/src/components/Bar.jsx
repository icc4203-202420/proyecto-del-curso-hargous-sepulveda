import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Importa Link para redirigir
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import './Bar.css'; // Agrega aquí tus estilos personalizados

const Bar = () => {
  const { id } = useParams(); // El id del bar
  const navigate = useNavigate();
  const [bar, setBar] = useState(null);
  const [beers, setBeers] = useState([]);
  const [events, setEvents] = useState([]); // Estado para los eventos
  const [country, setCountry] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false); // Estado para abrir/cerrar el modal

  useEffect(() => {
    const fetchBarAndBeers = async () => {
      try {
        const barResponse = await axios.get(`http://localhost:3001/api/v1/bars/${id}`);
        setBar(barResponse.data.bar);

        const beersResponse = await axios.get(`http://localhost:3001/api/v1/bars/${id}/beers`);
        setBeers(beersResponse.data);

        const addressResponse = await axios.get(`http://localhost:3001/api/v1/bars/${id}/addresses`);
        setAddress(addressResponse.data);

        const countryResponse = await axios.get(`http://localhost:3001/api/v1/bars/${id}/countrys`);
        setCountry(countryResponse.data.country);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bar details or beers:', error);
        setError('Error fetching bar details or beers');
        setLoading(false);
      }
    };

    fetchBarAndBeers();
  }, [id]);

  const fetchEvents = async () => {
    try {
      // Hacemos la petición usando el bar_id como query param
      const eventsResponse = await axios.get(`http://localhost:3001/api/v1/events`, {
        params: { bar_id: id }, // Enviar el bar_id como query parameter
      });
      setEvents(eventsResponse.data.events);
      setOpen(true); // Abre el modal al recibir los eventos
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Error fetching events');
    }
  };

  const handleClose = () => {
    setOpen(false); // Cierra el modal
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    bar && (
      <Card className="bar-card">
        <Box className="bar-card-container">
          <IconButton
            className="close-button"
            onClick={() => navigate(-1)}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Box className="bar-card-media-container">
            {bar.image_url ? (
              <CardMedia
                component="img"
                className="bar-card-img"
                image={bar.image_url}
                alt={`${bar.name} image`}
              />
            ) : (
              <Typography variant="body2">No image available</Typography>
            )}
          </Box>
          <CardContent className="bar-card-content">
            <Typography className="bar-card-title" variant="h4" component="div">
              {bar.name || 'N/A'}
            </Typography>
            <Typography className="bar-card-text">
              <span className="bar-card-strong">Country:</span> {country.name || 'N/A'}
            </Typography>
            <Typography className="bar-card-text">
              <span className="bar-card-strong">City:</span> {address.city || 'N/A'}
            </Typography>
            <Typography className="bar-card-text">
              <span className="bar-card-strong">Address:</span> {address.line1 || 'N/A'}, {address.line2 || 'N/A'}
            </Typography>
          </CardContent>

          {/* Botón para abrir el modal de eventos */}
          <Button
            variant="contained"
            color="primary"
            onClick={fetchEvents}
            className="event-button"
          >
            Ver Eventos
          </Button>

          {/* Render beers available at the bar */}
          <Box className="reviews-section">
            <Typography variant="h5">Beers Available</Typography>
            <Box className="reviews-section-sub">
              {Array.isArray(beers) && beers.length > 0 ? (
                beers.map((beer) => (
                  <Link to={`/beers/${beer.id}`} key={beer.id} className="review-card">
                    <Box key={beer.id} className="review-card">
                      <Typography variant="h6">{beer.name}</Typography>
                      {beer.image_url && (
                        <CardMedia
                          component="img"
                          className="beer-card-img"
                          image={beer.image_url}
                          alt={`${beer.name} image`}
                        />
                      )}
                      <Typography variant="body2">Rating: {beer.avg_rating || 'N/A'}</Typography>
                    </Box>
                  </Link>
                ))
              ) : (
                <Typography variant="body2">No beers available at this bar.</Typography>
              )}
            </Box>
          </Box>

          {/* Modal para mostrar los eventos */}
          <Dialog open={open} onClose={handleClose} className="event-modal">
            <DialogTitle>Eventos en {bar.name}</DialogTitle>
            <DialogContent>
              {events.length > 0 ? (
                events.map((event) => (
                  <Link to={`/events/${event.id}`} key={event.id}>
                    <Box className="event-card" sx={{ cursor: 'pointer' }}>
                      <Box className="event-details">
                        <Typography variant="h6" className="event-title">{event.name}</Typography>
                        <Typography variant="body2" className="event-type">
                          <strong>id del evento:</strong> {event.id || 'No disponible'}
                        </Typography>
                        <Typography variant="body2" className="event-description">
                          <strong>Descripción:</strong> {event.description || 'No disponible'}
                        </Typography>
                        <Typography variant="body2" className="event-dates">
                          <strong>Fecha de inicio:</strong> {new Date(event.start_date).toLocaleString() || 'No disponible'}
                        </Typography>
                        <Typography variant="body2" className="event-dates">
                          <strong>Fecha de fin:</strong> {new Date(event.end_date).toLocaleString() || 'No disponible'}
                        </Typography>
                      </Box>
                    </Box>
                  </Link>
                ))
              ) : (
                <Typography variant="body2">No hay eventos disponibles para este bar.</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>

        </Box>
      </Card>
    )
  );
};

export default Bar;