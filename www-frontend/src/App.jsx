import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './components/Home.jsx'
import Header from './components/Header.jsx'
function App() {

  return (
    <>
      <div>
        <Header/>
        <Home/> 
      </div>
    </>
  )
}


export default App
