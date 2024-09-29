import React, { useState, useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Container } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import SportsBarIcon from '@mui/icons-material/SportsBar';
import NightlifeIcon from '@mui/icons-material/Nightlife';
import EventIcon from '@mui/icons-material/Event';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import { Link } from 'react-router-dom';
import './Footer.css'; // CSS actualizado
import Account from './Account.jsx';
import BeerList from './BeerList.jsx';
import BarList from './BarList.jsx';
import Events from './Events.jsx';
import Beer from './Beer.jsx';
import Bar from './Bar.jsx';
import UserList from './UserList.jsx';
import Signup from './Signup';
import Login from './Login.jsx';
import CreateReview from './CreateReview.jsx';
import PrivateRoute from './PrivateRoute'; 
import Home from './Home';
import EventDetails from './EventDetails.jsx';
import UserProfile from './UserProfile.jsx'
const Footer = ({ value, onChange }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(sessionStorage.getItem('jwtToken')));

  useEffect(() => {
    // Configura un intervalo para verificar el estado de autenticación cada segundo
    const interval = setInterval(() => {
      const token = Boolean(sessionStorage.getItem('jwtToken'));
      setIsAuthenticated(token);
    }, 1000); // Verificar cada segundo

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <Container sx={{ mt: 10 }}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} /> 

          <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
          <Route path="/events/:id" element={<PrivateRoute><EventDetails /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><UserList /></PrivateRoute>} />
          <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
          <Route path="/beers" element={<PrivateRoute><BeerList /></PrivateRoute>} />
          <Route path="/bars" element={<PrivateRoute><BarList /></PrivateRoute>} />
          <Route path="/bars/:id" element={<PrivateRoute><Bar /></PrivateRoute>} />
          <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
          <Route path="/beers/:id" element={<PrivateRoute><Beer /></PrivateRoute>} />
          <Route path="/users/:id" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
          <Route path="/beers/:id/review" element={<PrivateRoute><CreateReview /></PrivateRoute>} />
        </Routes>
      </Container>
      <BottomNavigation value={value} onChange={onChange} id="bottom-navigation">
        {/* Los botones invisibles y no clickeables si el usuario no está autenticado */}
        <BottomNavigationAction
          label="Beers"
          value="beers"
          icon={<SportsBarIcon />}
          component={Link}
          to="/beers"
          className={isAuthenticated ? 'visible-button' : 'invisible-button'}
        />
        <BottomNavigationAction
          label="Bars"
          value="bars"
          icon={<NightlifeIcon />}
          component={Link}
          to="/bars"
          className={isAuthenticated ? 'visible-button' : 'invisible-button'}
        />
        <BottomNavigationAction
          label="Home"
          value="home"
          icon={<HomeIcon />}
          component={Link}
          to="/"
          className={isAuthenticated ? 'visible-button' : 'invisible-button'}
        />
        <BottomNavigationAction
          label="Events"
          value="events"
          icon={<EventIcon />}
          component={Link}
          to="/events"
          className={isAuthenticated ? 'visible-button' : 'invisible-button'}
        />
        <BottomNavigationAction
          label="Account"
          value="account"
          icon={<AccountCircleIcon />}
          component={Link}
          to="/account"
          className={isAuthenticated ? 'visible-button' : 'invisible-button'}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default Footer;
