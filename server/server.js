import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow all origins for testing, tighten for production!
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
    io.emit('chat message', msg); // broadcast to all clients
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Socket.IO server running at http://${HOST}:${PORT}/`);
});
