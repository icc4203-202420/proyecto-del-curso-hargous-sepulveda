import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Account.css'; 

function Account() {
  const [hasToken, setHasToken] = useState(false); 
  const [userId, setUserId] = useState(''); 
  const [userName, setUserName] = useState(''); 
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('jwtToken');
    const storedUserId = sessionStorage.getItem('userId'); 
    const storedUserName = sessionStorage.getItem('userName'); 

    if (token) {
      setHasToken(true);
      setUserId(storedUserId); 
      setUserName(storedUserName); 
    } else {
      setHasToken(false); 
      navigate('/login'); 
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    setHasToken(false); 
    navigate('/login');
  };

  return (
    <div className="account-container">
      <div className="account-card">
        <h2>Cuenta</h2>
        {hasToken ? (
          <>
            <p>Bienvenido, {userName}.</p> 
            <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
          </>
        ) : (
          <p>Contraseña o Email no válidos. Por favor, inicia sesión.</p>
        )}
      </div>
    </div>
  );
}

export default Account;
