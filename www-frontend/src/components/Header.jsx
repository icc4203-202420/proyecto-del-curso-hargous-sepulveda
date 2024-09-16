import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
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
    // Verificar constantemente si el usuario está autenticado
    const interval = setInterval(() => {
      const token = Boolean(sessionStorage.getItem('jwtToken'));
      setIsAuthenticated(token);
    }, 1000); // Verificar cada segundo

    // Limpiar el intervalo cuando el componente se desmonte
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
  }, [query, navigate, location.pathname])

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" id='barra_fondo'>
        <Toolbar sx={{ justifyContent: 'center', position: 'relative' }}>
          {/* Logo en el centro de la barra */}
          <img
            src="/BeerHub_logo.png"  // Cambia esto a la ruta correcta de la imagen, dependiendo de dónde se encuentre
            alt="BeerHub Logo"
            style={{ height: '50px' }} // Ajusta el tamaño del logo según sea necesario
          />
          
          {/* Mostrar la barra de búsqueda solo si el usuario está autenticado */}
          {isAuthenticated && (
            <Search style={{alignSelf:"flex-end", transform: 'translateY(-20%)'}}> {/* Barra de búsqueda en la derecha */}
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
    </Box>
  );
}