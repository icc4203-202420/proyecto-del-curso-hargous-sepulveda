import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Account.css'; 

function Account() {
  const [hasToken, setHasToken] = useState(false); 
  const [userId, setUserId] = useState(''); 
  const [userName, setUserName] = useState(''); 
  const [friends, setFriends] = useState([]);  // Estado para almacenar amistades
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('jwtToken');
    const storedUserId = sessionStorage.getItem('userId'); 
    const storedUserName = sessionStorage.getItem('userName'); 

    if (token) {
      setHasToken(true);
      setUserId(storedUserId); 
      setUserName(storedUserName); 

      // Verifica si las amistades ya están en sessionStorage
      const storedFriends = sessionStorage.getItem('friends');
      if (storedFriends) {
        setFriends(JSON.parse(storedFriends));  // Cargar amistades desde sessionStorage
      } else {
        // Si no están en sessionStorage, obtener de la API
        fetchFriends(storedUserId);
      }
    } else {
      setHasToken(false); 
      navigate('/login'); 
    }
  }, [navigate]);

  // Función para obtener las amistades desde la API
  const fetchFriends = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/v1/users/${userId}/friendships`);
      setFriends(response.data);  // Guardar amistades en el estado
      sessionStorage.setItem('friends', JSON.stringify(response.data));  // Guardar amistades en sessionStorage
    } catch (error) {
      console.error('Error al obtener la lista de amigos:', error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('friends');  // Eliminar amistades de sessionStorage al cerrar sesión
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
            <h3>Tus amigos:</h3>
            {friends.length > 0 ? (
              <ul>
                {friends.map((friend) => (
                  <li key={friend.id}>{friend.first_name} {friend.last_name}</li>
                ))}
              </ul>
            ) : (
              <p>No tienes amigos agregados.</p>
            )}
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
