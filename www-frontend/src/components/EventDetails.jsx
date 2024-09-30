import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams(); // Obtener el ID del evento desde la URL
  const [event, setEvent] = useState(null);
  const [barName, setBarName] = useState(''); // Estado para guardar el nombre del bar
  const [barId, setBarId] = useState(null); // Estado para guardar el ID del bar
  const [attendees, setAttendees] = useState([]); // Lista de asistentes (nombres)
  const [friends, setFriends] = useState([]); // Lista de amigos del usuario autenticado
  const [eventPictures, setEventPictures] = useState([]); // Estado para guardar las imágenes del evento
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasConfirmed, setHasConfirmed] = useState(false); // Estado para asistencia confirmada
  const [selectedImage, setSelectedImage] = useState(null); // Estado para la imagen seleccionada
  const [uploadStatus, setUploadStatus] = useState(''); // Estado para mensajes de éxito/error en la subida
  const currentUserId = sessionStorage.getItem('userId'); // ID del usuario autenticado
  const [users, setUsers] = useState([]);

  // State for Modal
  const [openModal, setOpenModal] = useState(false);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // State for Autocomplete
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionOptions, setMentionOptions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(null);
  const inputRef = useRef(null);

  // Fetch Event Details
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

        if (attendeesData.includes(parseInt(currentUserId))) {
          setHasConfirmed(true);
        }

        const friendsResponse = await axios.get(`http://localhost:3001/api/v1/users/${currentUserId}/friendships`);
        setFriends(friendsResponse.data);

        const usersResponse = await axios.get(`http://localhost:3001/api/v1/users/search`);
        setUsers(usersResponse.data.users);

        // Fetch event pictures
        fetchEventPictures(selectedEvent.id); // Llama a la función para obtener las imágenes del evento
      } else {
        setEvent(null);
      }
      setLoading(false);
    } catch (error) {
      setError('Error fetching event details or attendees');
      setLoading(false);
    }
  };

  // Fetch Event Pictures
  const fetchEventPictures = async (eventId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/v1/events/${eventId}/event_pictures`);
      setEventPictures(response.data); // Guarda las imágenes del evento
      console.log('Flyer URLs:', response.data.map(picture => picture.flyer_urls).flat()); // Imprime los flyer_urls
    } catch (error) {
      console.error('Error fetching event pictures:', error);
      setError('Error fetching event pictures');
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const getUserHandle = (userId) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.handle : 'Unknown User';
  };

  const confirmAttendance = async () => {
    try {
      await axios.post(`http://localhost:3001/api/v1/attendances`, {
        event_id: id,
        user_id: currentUserId,
      });
      setHasConfirmed(true);
      fetchEventDetails();
    } catch (error) {
      console.error('Error confirming attendance:', error);
    }
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setDescription(''); // Reset description
    setSelectedImage(null); // Reset selected image
    setUploadStatus('');
    setMentionOpen(false);
    setMentionQuery('');
    setMentionOptions([]);
  };

  const extractMentions = (text) => {
    const mentionRegex = /@(\w+)$/;
    const match = text.match(mentionRegex);
    return match ? match[1] : '';
  };

  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    setDescription(text);
    setCursorPosition(cursorPos);

    // Check if the user has typed "@" before the cursor
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    if (lastAt !== -1) {
      const query = textBeforeCursor.substring(lastAt + 1, cursorPos);
      if (query.length > 0) {
        setMentionQuery(query);
        setMentionOpen(true);
        // Update mentionOptions based on query
        const filteredOptions = users.filter(user => user.handle.toLowerCase().includes(query.toLowerCase()));
        setMentionOptions(filteredOptions);
      } else {
        setMentionOpen(false);
        setMentionQuery('');
        setMentionOptions([]);
      }
    } else {
      setMentionOpen(false);
      setMentionQuery('');
      setMentionOptions([]);
    }
  };

  const handleMentionSelect = (event, value) => {
    if (value) {
      const textBeforeCursor = description.substring(0, cursorPosition);
      const textAfterCursor = description.substring(cursorPosition);
      const atIndex = textBeforeCursor.lastIndexOf('@');
      if (atIndex !== -1) {
        const newTextBefore = textBeforeCursor.substring(0, atIndex) + `@${value.handle} `;
        const updatedText = newTextBefore + textAfterCursor;
        setDescription(updatedText);
        setMentionOpen(false);
        setMentionQuery('');
        setMentionOptions([]);
        // Move cursor position after the inserted mention
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(newTextBefore.length, newTextBefore.length);
          }
        }, 0);
      }
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      setUploadStatus('Por favor selecciona una imagen.');
      return;
    }

    setIsUploading(true); // Start uploading

    // Lee el archivo seleccionado como base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;

      const data = {
        event_picture: {
          user_id: currentUserId,
          flyer_base64: base64Image,
          description: description, // Add description with mentions
        },
      };

      try {
        const response = await axios.post(`http://localhost:3001/api/v1/events/${id}/event_pictures`, data, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setUploadStatus('Imagen subida exitosamente.');
        fetchEventPictures(id); // Refresca las imágenes después de la subida
        console.log('URL de la imagen:', response.data.flyer_url); // Verifica si la imagen fue subida correctamente

        // Optionally, handle mentions (e.g., notify mentioned users)
        const mentions = extractMentions(description);
        if (mentions) {
          console.log('Mentions:', mentions); // Array of mentioned handles
          // Implement notification logic here if needed
        }

        // Close modal after successful upload
        setTimeout(() => {
          handleCloseModal();
        }, 2000);
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        setUploadStatus('Error al subir la imagen.');
      } finally {
        setIsUploading(false); 
        handleCloseModal();// Stop uploading
      }
    };

    reader.readAsDataURL(selectedImage); // Convierte el archivo a base64
  };

  const friendsAttending = attendees.filter((attendee) =>
    friends.some((friend) => friend.id === attendee.userId)
  );

  const otherAttendees = attendees.filter(
    (attendee) => !friendsAttending.some((friend) => friend.userId === attendee.userId)
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    event ? (
      <div className="show-event">
        <Card className="event-card" sx={{ maxWidth: 700, margin: 'auto', mt: 4, padding: 2, boxShadow: 3 }}>
          <Box className="event-card-container" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
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

              {/* Confirmar asistencia */}
              {hasConfirmed ? (
                <Typography variant="h6" color="green" sx={{ mt: 3 }}>
                  Has confirmado tu asistencia
                </Typography>
              ) : (
                <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={confirmAttendance}>
                  Confirmar Asistencia
                </Button>
              )}

              {/* Subir imagen */}
              <Typography variant="h6" sx={{ mt: 3 }}>
                Subir una foto del evento
              </Typography>
              <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleOpenModal}>
                Subir Imagen
              </Button>
              {uploadStatus && <Typography variant="body2" sx={{ mt: 1 }}>{uploadStatus}</Typography>}

              {/* Amigos que asisten */}
              <Typography variant="h6" sx={{ mt: 3 }}>
                Amigos que asisten:
              </Typography>
              {friendsAttending.length > 0 ? (
                friendsAttending.map((friend, index) => (
                  <Typography key={index} variant="body2" color="primary">
                    {friend.name} (Amigo)
                  </Typography>
                ))
              ) : (
                <Typography variant="body2">No tienes amigos asistiendo.</Typography>
              )}

              {/* Otros asistentes */}
              <Typography variant="h6" sx={{ mt: 3 }}>
                Otros asistentes:
              </Typography>
              {otherAttendees.length > 0 ? (
                otherAttendees.map((attendee, index) => (
                  <Typography key={index} variant="body2">
                    {attendee.name}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2">No hay otros asistentes confirmados.</Typography>
              )}

              {/* Renderiza las imágenes del evento */}
              <Typography variant="h6" sx={{ mt: 3 }}>
                Imágenes del Evento:
              </Typography>
              {eventPictures.length > 0 ? (
                <Box sx={{ width: 650, height: 450, overflowY: 'scroll' }}>
                  <ImageList variant="masonry" cols={2} gap={8}>
                    {eventPictures.map((picture) => (
                      <ImageListItem key={picture.id}>
                        <img
                          srcSet={`${picture.flyer_urls[0]}?w=248&fit=crop&auto=format&dpr=2 2x`}
                          src={`${picture.flyer_urls[0]}?w=248&fit=crop&auto=format`}
                          alt={`Flyer de la imagen ${picture.id}`}
                          loading="lazy"
                        />
                        <Box className="review-card" sx={{ borderRadius: 5, marginBottom: 5 }}>
                          <ImageListItemBar
                            className="review-text"
                            position="below"
                            title={`by: ${getUserHandle(picture.user_id) || "Autor no disponible"}`}
                          />
                          <Box className="review-text">
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#2E2E42",
                                fontSize: "1rem",
                                lineHeight: 1.4,
                                whiteSpace: "pre-wrap",
                                overflowWrap: "break-word", 
                              }}
                            >
                              {picture.description || ""}
                            </Typography>
                          </Box>
                        </Box>
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              ) : (
                <Typography variant="body2">No hay imágenes disponibles.</Typography>
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

        {/* Modal for Uploading Image with Description */}
        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle>Subir una foto del evento</DialogTitle>
          <DialogContent sx={{ position: 'relative' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              <Typography variant="subtitle1">Descripción:</Typography>
              <TextField
                inputRef={inputRef}
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Escribe una descripción y etiqueta a tus amigos usando @"
                multiline
                rows={4}
                variant="outlined"
                fullWidth
              />
              {mentionOpen && (
                <Autocomplete
                  freeSolo
                  open={mentionOpen}
                  options={mentionOptions}
                  getOptionLabel={(option) => option.handle}
                  onChange={handleMentionSelect}
                  renderInput={(params) => (
                    <TextField {...params} label="Selecciona un usuario" variant="outlined" />
                  )}
                  sx={{
                    position: 'absolute',
                    zIndex: 1300,
                    marginTop: '8px',
                    width: '90%',
                    backgroundColor: "#2E2E42",
                    color: "#FFFFFF"
                  }}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="secondary">
              Cancelar
            </Button>
            <Button
              onClick={uploadImage}
              color="primary"
              variant="contained"
              disabled={isUploading}
            >
              {isUploading ? 'Subiendo...' : 'Subir Imagen'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    ) : (
      <div>No se encontró el evento.</div>
    )
  );
};

export default EventDetails;

