import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Account() {
  const [hasToken, setHasToken] = useState(false); // Estado para saber si hay token o no
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('jwtToken');

    if (token) {
      setHasToken(true); // Si hay token, actualizar el estado a true
    } else {
      setHasToken(false); // Si no hay token, actualizar el estado a false
      navigate('/login'); // Redirigir al login si no hay token
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('jwtToken'); // Eliminar el token de sessionStorage
    setHasToken(false); // Actualizar el estado para reflejar que el usuario ha cerrado sesión
    navigate('/login'); // Redirigir al login
  };

  return (
    <div>
      <h2>Cuenta</h2>
      {hasToken ? (
        <>
          <p>Tienes un token válido en sessionStorage.</p>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </>
      ) : (
        <p>No tienes un token válido. Por favor, inicia sesión.</p>
      )}
    </div>
  );
}

export default Account;
