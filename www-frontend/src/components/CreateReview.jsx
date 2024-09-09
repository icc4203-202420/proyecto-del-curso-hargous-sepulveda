import React, { useState } from 'react';
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
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
            beer_id: id
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors || 'Hubo un problema con la red.');
      }

      // Review successfully submitted
      setSuccessMessage('Reseña enviada exitosamente!');
      setFormData({ text: '', rating: 1 }); // Reset form
      setTimeout(() => {
        navigate(`/beers/${id}`); // Redirect after a short delay
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'No se pudo enviar la reseña. Inténtalo de nuevo.' });
    }
  };

  return (
    <div className="container">
      <form className="review-form" onSubmit={handleSubmit}>
      <Typography component="legend" variant="h5" >Leave a Review</Typography>
      <Typography className = "leyendacampo"component="legend" variant="h7" >Review</Typography>
        <TextField
          id="outlined-multiline-static"
          label="Review"
          multiline
          rows={4}
          name="text"
          value={formData.text}
          onChange={handleChange}
          className="review-input"
        />
        {errors.text && <span className="error">{errors.text}</span>}
        
        <Typography className = "leyendacampo" component="legend">Rating</Typography>
        <Rating
          name="rating"
          value={formData.rating}
          onChange={handleRatingChange}
          precision={1}
          icon={<SportsBarIcon fontSize="inherit" />}
          emptyIcon={<SportsBarOutlinedIcon fontSize="inherit" />}
        />
        {errors.rating && <span className="error">{errors.rating}</span>}
        
        <button type="submit" className="review-button">Send review</button>
        {errors.submit && <span className="error">{errors.submit}</span>}
        
        {successMessage && <span className="success-message">{successMessage}</span>}
      </form>
    </div>
  );
};

export default CreateReview;

