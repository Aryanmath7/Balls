import { Client } from 'https://esm.sh/colyseus.js';

const client = new Client("ws://localhost:3000");
let room = null;
const remotePlayers = {}; // id → paddle mesh or position vector

// Connect to room
export async function connectToServer() {
  room = await client.joinOrCreate("lobby");
  console.log("Connected to room with session ID:", room.sessionId);

  room.onMessage("player_moved", (message) => {
    if (onPlayerMovedCallback) {
      onPlayerMovedCallback(message);
    }
  });

  room.onMessage("player_joined", (message) => {
    console.log("Player joined", message.id);
  });

  room.onMessage("player_left", (message) => {
    console.log("Player left", message.id);
  });
}

// Send player's move to server
export function sendPlayerMove(position) {
  if (!room) return;
  room.send("move", {
    x: position.x,
    y: position.y,
    z: position.z
  });
}

// Event subscriptions
let onPlayerMovedCallback = null;

export function onPlayerMoved(callback) {
  onPlayerMovedCallback = callback;
}
