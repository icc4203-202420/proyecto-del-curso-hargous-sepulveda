import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    handle: '',
    password: '',
    passwordConfirmation: '',
    // age: '' // Campo opcional
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(''); // Nuevo estado para el mensaje de éxito
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'El nombre es obligatorio.';
      return newErrors;
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'El apellido es obligatorio.';
      return newErrors;
    }

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        newErrors.email = 'Introduce un correo electrónico válido.';
        return newErrors;
      }
    }

    if (!formData.handle) {
      newErrors.handle = 'El nombre de usuario es obligatorio.';
      return newErrors;
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria.';
      return newErrors;
    }
    if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
      return newErrors;
    }

    if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Las contraseñas no coinciden.';
      return newErrors;
    }

    // if (formData.age && (formData.age < 18 || formData.age > 99)) {
    //   newErrors.age = 'La edad debe estar entre 18 y 99 años.';
    //   return newErrors;
    // }
    
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
      const response = await fetch('http://localhost:3001/api/v1/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            handle: formData.handle,
            password: formData.password,
            password_confirmation: formData.passwordConfirmation,
            // age: formData.age
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors || 'Hubo un problema con la red.');
      }

      // Registro exitoso
      const result = await response.json();
      console.log('Registro exitoso:', result);

      // Mostrar mensaje de éxito
      setSuccessMessage('Registro exitoso. Serás redirigido al inicio de sesión.');
      
      // Redirigir después de 2 segundos al login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'No se pudo registrar. Inténtalo de nuevo.' });
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="firstName"
        placeholder="Nombre"
        value={formData.firstName}
        onChange={handleChange}
        className="signup-input"
      />
      {errors.firstName && <span className="error">{errors.firstName}</span>}
      
      <input
        type="text"
        name="lastName"
        placeholder="Apellido"
        value={formData.lastName}
        onChange={handleChange}
        className="signup-input"
      />
      {errors.lastName && <span className="error">{errors.lastName}</span>}
      
      <input
        type="email"
        name="email"
        placeholder="Correo electrónico"
        value={formData.email}
        onChange={handleChange}
        className="signup-input"
      />
      {errors.email && <span className="error">{errors.email}</span>}
      
      <input
        type="text"
        name="handle"
        placeholder="Nombre de usuario"
        value={formData.handle}
        onChange={handleChange}
        className="signup-input"
      />
      {errors.handle && <span className="error">{errors.handle}</span>}
      
      <input
        type="password"
        name="password"
        placeholder="Contraseña"
        value={formData.password}
        onChange={handleChange}
        className="signup-input"
      />
      {errors.password && <span className="error">{errors.password}</span>}
      
      <input
        type="password"
        name="passwordConfirmation"
        placeholder="Confirmar contraseña"
        value={formData.passwordConfirmation}
        onChange={handleChange}
        className="signup-input"
      />
      {errors.passwordConfirmation && <span className="error">{errors.passwordConfirmation}</span>}
      
      {/* <input
        type="number"
        name="age"
        placeholder="Edad (opcional)"
        value={formData.age}
        onChange={handleChange}
        className="signup-input"
        min="18" max="99"
      />
      {errors.age && <span className="error">{errors.age}</span>} */}
      
      <button type="submit" className="signup-button">Registrarse</button>
      {errors.submit && <span className="error">{errors.submit}</span>}

      {/* Mostrar mensaje de éxito */}
      {successMessage && <span className="success-message">{successMessage}</span>}
  
      <p>¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link></p>
    </form>
  );
};

export default Signup;
