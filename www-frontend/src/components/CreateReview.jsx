import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CreateReview.css'; 
import Typography from '@mui/material/Typography';
import SportsBarIcon from '@mui/icons-material/SportsBar';
import TextField from '@mui/material/TextField';
import { Rating } from '@mui/material'; 
import SportsBarOutlinedIcon from '@mui/icons-material/SportsBarOutlined';

const CreateReview = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    text: '',
    rating: 1,
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Control del envío

  const storedUserId = sessionStorage.getItem('userId');

  // Redirige si no hay userId
  useEffect(() => {
    if (!storedUserId) {
      navigate('/login'); // Redirige al login si no hay userId
    }
  }, [storedUserId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRatingChange = (event, newValue) => {
    setFormData({
      ...formData,
      rating: newValue
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.text) {
      newErrors.text = 'El texto de la reseña es obligatorio.';
    } else if (formData.text.length > 500) {
      newErrors.text = 'La reseña no puede tener más de 500 caracteres.';
    }

    if (!formData.rating) {
      newErrors.rating = 'La calificación es obligatoria.';
    } else if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'La calificación debe estar entre 1 y 5.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Deshabilita el botón mientras se envía

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/v1/beers/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          review: {
            text: formData.text,
            rating: formData.rating,
            beer_id: id,
            user_id: storedUserId,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors({
            submit: errorData.errors.join(', ') // Muestra todos los errores del backend
          });
        } else {
          throw new Error('Hubo un problema con la red.');
        }
        setIsSubmitting(false); // Habilita el botón nuevamente
        return;
      }

      // Reseña enviada exitosamente
      setSuccessMessage('Reseña enviada exitosamente!');
      setFormData({ text: '', rating: 1 }); // Resetea el formulario
      setTimeout(() => {
        navigate(`/beers/${id}`); // Redirige después de 2 segundos
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'No se pudo enviar la reseña. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false); // Habilita el botón nuevamente
    }
  };

  return (
    <div className="container">
      <form className="review-form" onSubmit={handleSubmit}>
        <Typography component="legend" variant="h5">Deja una Reseña</Typography>

        <Typography className="leyendacampo" component="legend" variant="h7">Reseña</Typography>
        <TextField
          id="outlined-multiline-static"
          label="Escribe tu reseña"
          multiline
          rows={4}
          name="text"
          value={formData.text}
          onChange={handleChange}
          className="review-input"
        />
        {errors.text && <span className="error">{errors.text}</span>}

        <Typography className="leyendacampo" component="legend">Calificación</Typography>
        <Rating
          name="rating"
          value={formData.rating}
          onChange={handleRatingChange}
          precision={1}
          icon={<SportsBarIcon fontSize="inherit" />}
          emptyIcon={<SportsBarOutlinedIcon fontSize="inherit" />}
        />
        {errors.rating && <span className="error">{errors.rating}</span>}

        <button type="submit" className="review-button" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
        </button>
        {errors.submit && <span className="error">{errors.submit}</span>}

        {successMessage && <span className="success-message">{successMessage}</span>}
      </form>
    </div>
  );
};

export default CreateReview;
