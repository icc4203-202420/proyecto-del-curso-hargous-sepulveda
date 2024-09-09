import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import qs from 'qs';
import useAxios from 'axios-hooks';
import axios from 'axios';
import './Login.css';

const validationSchema = Yup.object({
  email: Yup.string().email('Email no válido').required('El email es requerido'),
  password: Yup.string().required('La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const initialValues = {
  email: '',
  password: '',
};

// Configuración de axios con axios-hooks
axios.defaults.baseURL = "http://localhost:3001/api/v1/";

const Login = () => {
  const [serverError, setServerError] = useState(''); // Estado para manejar el error del servidor
  const navigate = useNavigate(); // Hook para manejar la navegación

  // Definir el hook para la petición POST
  const [{ data, loading, error }, executePost] = useAxios(
    {
      url: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    },
    { manual: true } // No ejecutar automáticamente, lo haremos manualmente al enviar el formulario
  );

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Anidar los valores bajo la clave user
      const response = await executePost({ data: qs.stringify({ user: values }) });
      
      // Si el status es 200, significa que el inicio de sesión fue exitoso
      if (response.status === 200) {
        const receivedToken = response.data.token;
        // Guardar el token directamente en sessionStorage o localStorage
        sessionStorage.setItem('jwtToken', receivedToken);
        setServerError(''); // Limpia el mensaje de error si el login es exitoso
        navigate('/account'); // Redirige a la página de cuenta
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setServerError('Correo electrónico o contraseña incorrectos.');
      } else {
        setServerError('Error en el servidor. Intenta nuevamente más tarde.');
      }
      console.error('Error en el envío del formulario:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="login-form">
            <h2>Iniciar sesión</h2>

            <Field
              as="input"
              type="email"
              name="email"
              placeholder="Correo electrónico"
              className={`login-input ${touched.email && errors.email ? 'input-error' : ''}`}
              required
            />
            {touched.email && errors.email && (
              <div className="error-message">{errors.email}</div>
            )}

            <Field
              as="input"
              type="password"
              name="password"
              placeholder="Contraseña"
              className={`login-input ${touched.password && errors.password ? 'input-error' : ''}`}
              required
            />
            {touched.password && errors.password && (
              <div className="error-message">{errors.password}</div>
            )}

            <button type="submit" className="login-button" disabled={isSubmitting || loading}>
              {loading ? 'Enviando...' : 'Iniciar sesión'}
            </button>

            {serverError && (
              <ul className="error-list">
                <li className="error-item">{serverError}</li>
              </ul>
            )}

            <p>
              ¿No tienes una cuenta?
              <span className="redirect">
                <Link to="/signup">Regístrate aquí</Link>
              </span>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
