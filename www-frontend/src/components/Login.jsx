import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,  // No envolvemos email y password dentro de session
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Verificar que el token JWT esté en la respuesta
        if (data.status && data.status.data && data.status.data.token) {
          // Guardar el token JWT en sessionStorage
          sessionStorage.setItem('token', data.status.data.token);

          // Mostrar mensaje de éxito
          setSuccessMessage('Inicio de sesión exitoso');
          setErrorMessage('');

          // Redirigir a la página de cuenta o dashboard después del inicio de sesión
          setTimeout(() => {
            window.location.href = '/account'; // Cambia la redirección si es necesario
          }, 1500); // Espera 1.5 segundos antes de redirigir
        } else {
          throw new Error('No se recibió un token válido.');
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Error en el inicio de sesión');
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Ocurrió un error. Por favor, intenta de nuevo.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Iniciar sesión</h2>

        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          className="login-input"
          required
        />

        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="login-input"
          required
        />

        <button type="submit" className="login-button">Iniciar sesión</button>

        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && (
          <ul className="error-list">
            <li className="error-item">{errorMessage}</li>
          </ul>
        )}

        <p>
          ¿No tienes una cuenta?          
          <span className="redirect">
            <Link to="/signup">Regístrate aquí</Link>
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
