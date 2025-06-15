import { Room } from "colyseus";

import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

import * as BallPhysics from '../Physics/p_load_ball.js';
import * as PlatformPhysics from '../Physics/p_load_platform.js';

export class LobbyRoom extends Room {
  onCreate(options) {
    console.log("LobbyRoom created!");

    // 1. Create a physics world
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);

    // 2. Instantiate physics bodies
    this.pBall = BallPhysics.loadPhysicsBall(this.world, 1); // radius = 1

    // vBase is a simple object with position and quaternion for platform
    const vBase = { 
      position: new CANNON.Vec3(), 
      quaternion: new CANNON.Quaternion() 
    };

    this.platformBody = PlatformPhysics.loadPhysicsPlatform(this.world, vBase, 7, 0.5, 12);

    // Store connected players (keyed by sessionId)
    this.connectedPlayers = {};
    this.ballPosition = { x: 0, y: 0, z: 0 };

    // Handle "move" requests from clients
    this.onMessage("move", (client, data) => {
      const player = this.connectedPlayers[client.sessionId];
      if (!player) {
        console.warn(`Move received for unknown client ${client.sessionId}`);
        return;
      }
      console.log(`Player ${client.sessionId} moved to x:${data.x}, y:${data.y}, z:${data.z}`);

      //Broadcast updated position to other clients
      this.broadcast("player_moved", {
        id: client.sessionId,
        x: data.x,
        y: data.y,
        z: data.z
      });
    });


    // Step the physics world and broadcast ball position 30 times per second
    this.setSimulationInterval(() => {
      this.world.step(1 / 60);
      // Optionally, broadcast ball position to clients
      this.broadcast("update_ball_position", {
      x: this.pBall.position.x,
      y: this.pBall.position.y,
      z: this.pBall.position.z
      });
      console.log(`Ball position: x:${this.pBall.position.x}, y:${this.pBall.position.y}, z:${this.pBall.position.z}`);
    }, 1000 / 60);


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
