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

axios.defaults.baseURL = "http://localhost:3001/api/v1/";

const Login = () => {
  const [serverError, setServerError] = useState(''); 
  const [successMessage, setSuccessMessage] = useState(''); 
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();


  const [{ data, loading, error }, executePost] = useAxios(
    {
      url: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    },
    { manual: true } 
  );

  const handleSubmit = async (values, { setSubmitting }) => {
    try {

      const response = await executePost({ data: qs.stringify({ user: values }) });
  

      const user = response.data.status.data.user;
      console.log('Datos del usuario:', user);
      console.log('Mensaje del servidor:', response.data.status.message);
  
      if (response.status === 200) {
        setServerError('');
        setUserName(user.id); 
  
      
        const receivedToken = response.headers.authorization;
        sessionStorage.setItem('jwtToken', receivedToken); 
        sessionStorage.setItem('userId', user.id); 
        sessionStorage.setItem('userName', `${user.first_name} ${user.last_name}`); 
  
 
        setSuccessMessage('Has sido logueado exitosamente.');
  
        setTimeout(() => {
          navigate('/account'); 
        }, 200);
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

      
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}

       
            {!successMessage && userName && (
              <div className="user-message">Bienvenido, {userName}!</div>
            )}

            {serverError && (
              <ul className="error-list">
                <li className="error-item">{serverError}</li>
              </ul>
            )}

            <p>
              ¿No tienes una cuenta?
              <span className="redirect">
                <Link to="/signup"> Regístrate aquí</Link>
              </span>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;
