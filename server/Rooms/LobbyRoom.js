import { Room } from "colyseus";

export class LobbyRoom extends Room {
  onCreate(options) {
    console.log("LobbyRoom created!");

    // Store connected players (keyed by sessionId)
    this.connectedPlayers = {};

    // Handle "move" requests from clients
    this.onMessage("move", (client, data) => {
      const player = this.connectedPlayers[client.sessionId];
      if (!player) {
        console.warn(`Move received for unknown client ${client.sessionId}`);
        return;
      }

      // Update position
      player.x_pos = data.x;
      player.y_pos = data.y;
      player.z_pos = data.z;

      console.log(
        `Player ${client.sessionId} moved to x:${data.x}, y:${data.y}, z:${data.z}`
      );

      // Optionally: broadcast updated position to other clients
      this.broadcast("player_moved", {
        id: client.sessionId,
        x: data.x,
        y: data.y,
        z: data.z
      });
    });

  }

  onJoin(client, options) {
    console.log(`Client joined: ${client.sessionId}`);

    // Use the parameters sent from the client (options)
    this.connectedPlayers[client.sessionId] = {
        sessionId: client.sessionId,
        x_pos: options.x ?? 1,
        y_pos: options.y ?? 1,
        z_pos: options.z ?? 1,
    };

    // Broadcast to everyone
    this.broadcast("player_joined", { id: client.sessionId });

    // Optional: send current player list to the newly joined client
    client.send("current_players", {
      players: Object.values(this.connectedPlayers)
    });
  }

  onLeave(client, consented) {
    console.log(`Client left: ${client.sessionId}`);

    // Remove from connected players
    delete this.connectedPlayers[client.sessionId];

    // Notify others
    this.broadcast("player_left", { id: client.sessionId });
  }

  onDispose() {
    console.log("LobbyRoom disposed");
  }
  
}
