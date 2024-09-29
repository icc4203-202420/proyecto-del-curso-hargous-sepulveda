import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import './Header.css';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '40ch',
      '&:focus': {
        width: '60ch',
      },
    },
  },
}));

export default function Header() {
  const [query, setQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(sessionStorage.getItem('jwtToken')));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      const token = Boolean(sessionStorage.getItem('jwtToken'));
      setIsAuthenticated(token);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.pathname === '/beers') {
      if (query.trim()) {
        navigate(`/beers?q=${query}`);
      } else {
        navigate('/beers');
      }
    }
    if (location.pathname === '/bars') {
      if (query.trim()) {
        navigate(`/bars?q=${query}`);
      } else {
        navigate('/bars');
      }
    }
    if (location.pathname === '/users') {
      if (query.trim()) {
        navigate(`/users?q=${query}`);
      } else {
        navigate('/users');
      }
    }
    if (location.pathname === '/events') {
      if (query.trim()) {
        navigate(`/events?q=${query}`);
      } else {
        navigate('/events');
      }
    }
    if (location.pathname === '/') {
      if (query.trim()) {
        navigate(`/?q=${query}`);
      } else {
        navigate('/');
      }
    }
    
  }, [query, navigate, location.pathname])

  return (
    <Box sx={{ flexGrow: 1, zIndex: 1100 }}>
      <AppBar position="fixed" id='barra_fondo'>
        <Toolbar sx={{ justifyContent: 'center', position: 'relative' }}>
          <img
            src="/BeerHub_logo.png" 
            alt="BeerHub Logo"
            style={{ height: '50px' }} 
          />
          
          {isAuthenticated && (
            <Search style={{alignSelf:"flex-end", transform: 'translateY(-20%)'}}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                id='barra'
                placeholder="Search for Beers, Bars, Events or Users"
                inputProps={{ 'aria-label': 'search' }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Search>
          )}
        </Toolbar>
      </AppBar>
      <Box id="main-content">
      
      {location.pathname !== '/' && (
        <Box id="button-group-container" sx={{ display: 'flex', justifyContent: 'center', zIndex: 40}}>
          <ButtonGroup variant="outlined" aria-label="Basic button group">
            <Button onClick={() => navigate(`/beers?q=${query}`)}>Beers</Button>
            <Button onClick={() => navigate(`/bars?q=${query}`)}>Bars</Button>
            <Button onClick={() => navigate(`/events?q=${query}`)}>Events</Button>
            <Button onClick={() => navigate(`/users?q=${query}`)}>Users</Button>
          </ButtonGroup>
        </Box>
      )}

    </Box>

    </Box>
  );
}

