import React from 'react';
import './Header.css';  
const Header = () => {
  return (
    <header>
      <div className="header-content">
        <img src={reactLogo} alt="React Logo" className="logo" />
        <h1>BeerHub</h1>
      </div>
    </header>
  );
};

export default Header;
