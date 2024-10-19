import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './UserList.css';
import { Link, useLocation } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');
  
  const currentUserId = sessionStorage.getItem('userId'); // Obtener el ID del usuario logueado

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = query 
          ? await axios.get(`http://localhost:3001/api/v1/users/search?q=${query}`)
          : await axios.get('http://localhost:3001/api/v1/users/search');

        // Filtrar el usuario logueado de la lista de usuarios
        const filteredUsers = response.data.users.filter(user => user.id !== parseInt(currentUserId));

        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [query, currentUserId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="user-list-content">
      <div className="user-list">
        {users.map(user => (
          <Link to={`/users/${user.id}`} key={user.id} className="user-card-link">
            <Card sx={{ maxWidth: 400, minWidth: 200 }} className="user-card">
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Typography gutterBottom variant="h5" sx={{ color: 'text.secondary' }}>
                    @{user.handle}
                  </Typography>
                </CardContent>
              </Box>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UserList;
