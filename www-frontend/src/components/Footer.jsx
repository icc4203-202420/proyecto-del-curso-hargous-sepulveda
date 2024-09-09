import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Container} from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SportsBarIcon from '@mui/icons-material/SportsBar';
import NightlifeIcon from '@mui/icons-material/Nightlife';
import EventIcon from '@mui/icons-material/Event';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from 'react-router-dom';
import './Footer.css';
import Account from './Account.jsx';
import BeerList from './BeerList.jsx';
import BarList from './BarList.jsx';
import Events from './Events.jsx';
import Beer from './Beer.jsx';
import Signup from './Signup'; // Usando ruta relativa
import Login from './Login.jsx';
import CreateReview from './CreateReview.jsx';
const Footer = ({ value, onChange }) => {
  return (
    
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <Container sx={{ mt: 10 }}> {/* Adjusted padding to avoid content being hidden */}
        <Routes>
          <Route path="/account" element={<Account />} />
          <Route path="/beers" element={<BeerList />} />
          <Route path="/bars" element={<BarList />} />
          <Route path="/events" element={<Events />} />
          <Route path="/beers/:id" element={<Beer />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/beers/:id/review" element={<CreateReview />} />
        </Routes>
      </Container>
      <BottomNavigation value={value} onChange={onChange} id="bottom-navigation">
        <BottomNavigationAction label="Beers" value="beers" icon={<SportsBarIcon />} component={Link} to="/beers" />
        <BottomNavigationAction label="Bars" value="bars" icon={<NightlifeIcon />} component={Link} to="/bars" />
        <BottomNavigationAction label="Events" value="events" icon={<EventIcon />} component={Link} to="/events" />
        <BottomNavigationAction label="Account" value="account" icon={<AccountCircleIcon />} component={Link} to="/account" />
      </BottomNavigation>
    </Paper>
  );
};

export default Footer;



