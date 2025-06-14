import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  console.log('✅ New client connected');

  ws.on('message', (message) => {
    console.log(`📩 Received: ${message}`);

    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(`Server echoes: ${message}`);
      }
    });
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
  });
});

console.log(`🚀 WebSocket server running at ws://localhost:${PORT}`);
