import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        // Redirige a la página de inicio de sesión si no hay token
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/v1/current_user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Asegúrate de que el token esté incluido
          },
        });
        

        if (response.ok) {
          const result = await response.json();
          setUser(result.user);
        } else {
          // Si la respuesta no es ok, borra el token y redirige al login
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (err) {
        setError('An error occurred while fetching user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="container">
      <p>Welcome, {user ? user.first_name : 'User'}!</p>
    </div>
  );
}

export default Account;
