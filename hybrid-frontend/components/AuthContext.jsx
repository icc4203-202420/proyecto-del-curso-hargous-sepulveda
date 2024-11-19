import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import initializeWebSocket from '../src/services/WebSockets'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null); 
  const [feedData, setFeedData] = useState([]); 

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('jwtToken');
        setIsAuthenticated(!!token);

        if (token) {
          const userId = await SecureStore.getItemAsync('userId');
          const socketInstance = initializeWebSocket(token, userId);

          socketInstance.onmessage = (event) => {
            const response = JSON.parse(event.data);
            if (response.message) {
              console.log('Mensaje recibido:', response.message);
              setFeedData((prevFeedData) => [response.message, ...prevFeedData]);
            }
          };

          setSocket(socketInstance);
        }
      } catch (error) {
        console.error('Error al configurar el WebSocket:', error);
      } finally {
        setLoading(false);
      }
    };

    checkToken();

    return () => {
      if (socket) socket.close();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, loading, feedData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
