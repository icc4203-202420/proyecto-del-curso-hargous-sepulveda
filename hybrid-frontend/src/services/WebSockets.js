// src/services/WebSockets.js
import { BACKEND_URL } from '@env';

const initializeWebSocket = (userToken, userId) => {
    const wsUrl = BACKEND_URL.startsWith("https") 
    ? BACKEND_URL.replace("https", "wss") 
    : BACKEND_URL.replace("http", "ws");
  
  const socket = new WebSocket(`${wsUrl}/cable?token=${encodeURIComponent(userToken)}`);

  socket.onopen = () => {
    console.log('WebSocket conectado');
    socket.send(
      JSON.stringify({
        command: 'subscribe',
        identifier: JSON.stringify({
          channel: 'FeedChannel',
          user_id: userId,
        }),
      })
    );
  };

  socket.onmessage = (event) => {
    const response = JSON.parse(event.data);
    if (response.message) {
    //   console.log('Mensaje recibido:', response.message);
    }
  };

  socket.onerror = (error) => {
    console.error('Error en WebSocket:', error);
  };

  socket.onclose = () => {
    console.log('WebSocket desconectado');
  };

  return socket;
};

export default initializeWebSocket;
