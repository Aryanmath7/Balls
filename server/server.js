import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { LobbyRoom } from "./Rooms/LobbyRoom.js";
import http from "http";

const port = 3000;
const server = http.createServer();

const gameServer = new Server({
  transport: new WebSocketTransport({ server })
});

// Define the room
gameServer.define("lobby", LobbyRoom);

server.listen(port, () => {
  console.log(`Server listening on ws://localhost:${port}`);
});
