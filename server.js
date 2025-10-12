const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = 3000;

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('🟢 Nuevo cliente conectado');

  socket.on('paint', (data) => {
    console.log('🎨 Datos recibidos:', data);
    socket.broadcast.emit('paint', data); // retransmite a los demás
  });

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado');
  });
});

server.listen(port, () => {
  console.log(`🚀 Servidor en: http://localhost:${port}`);
});
