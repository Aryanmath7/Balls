import { Room } from "colyseus";
import * as CANNON from "cannon-es";

import * as BallPhysics from '../Physics/p_load_ball.js';
import * as PlatformPhysics from '../Physics/p_load_platform.js';

export class LobbyRoom extends Room {
  onCreate(options) {
    console.log("LobbyRoom created!");

    // Physics setup
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);

    // Load ball
    this.pBall = BallPhysics.loadPhysicsBall(this.world, 0.25);
    
    // Load platform
    const vBase = {
      position: new CANNON.Vec3(0, 0, 0),
      quaternion: new CANNON.Quaternion()
    };
    this.platformBody = PlatformPhysics.loadPhysicsPlatform(this.world, vBase, 7, 0.5, 12);

    const vPlayerPaddleShape = new CANNON.Box(new CANNON.Vec3(1 / 2, 1/2, 0.5 / 2));
    this.pPlayerPaddle = new CANNON.Body({
      shape: vPlayerPaddleShape,
      mass: 5,
      type: CANNON.Body.DYNAMIC,
      position: new CANNON.Vec3(
        0,
        1 / 2 + 0.05,
        0.5 / 2 ),
    });
    this.world.addBody(this.pPlayerPaddle);
    // Player storage
    this.connectedPlayers = {};

    // Handle movement messages
    this.onMessage("move", (client, data) => {
      const player = this.connectedPlayers[client.sessionId];
      if (!player) {
        console.warn(`Move received for unknown client ${client.sessionId}`);
        return;
      }
      console.log(`Received move from ${client.sessionId}: x=${data.x.toFixed(2)}, y=${data.y.toFixed(2)}, z=${data.z.toFixed(2)}`);
      // Update server-side position
      player.x_pos = data.x;
      player.y_pos = data.y;
      player.z_pos = data.z;
      const target = new CANNON.Vec3(data.x, data.y, data.z);
      const current = this.pPlayerPaddle.position;
      const diff = target.vsub(current);
      this.pPlayerPaddle.velocity.set(diff.x * 10, diff.y * 10, diff.z * 10);

      // Broadcast to all other clients
      this.broadcast("player_moved", {
        id: client.sessionId,
        x: data.x,
        y: data.y,
        z: data.z
      });
    });

    // Physics simulation
    this.setSimulationInterval(() => {
      this.world.step(1 / 60);
      const pos = this.pBall.position;
      console.log(`Ball position: x=${pos.x.toFixed(2)}, y=${pos.y.toFixed(2)}, z=${pos.z.toFixed(2)}`);
      // Broadcast ball position to clients
      this.broadcast("update_ball_position", {
        x: this.pBall.position.x,
        y: this.pBall.position.y,
        z: this.pBall.position.z
      });

      // For debugging
    }, 1000 / 60);
  }

  onJoin(client, options) {
    console.log(`Client joined: ${client.sessionId}`);

    // Add to player list
    this.connectedPlayers[client.sessionId] = {
      sessionId: client.sessionId,
      x_pos: options.x ?? 1,
      y_pos: options.y ?? 1,
      z_pos: options.z ?? 1,

      // Optional: for future paddle physics support
      // paddleBody: new CANNON.Body({ mass: 0 })
    };

    // Notify others
    this.broadcast("player_joined", { id: client.sessionId });

    // Send existing players to the newly joined client
    client.send("current_players", {
      players: Object.values(this.connectedPlayers)
    });
  }

  onLeave(client, consented) {
    console.log(`Client left: ${client.sessionId}`);
    delete this.connectedPlayers[client.sessionId];
    this.broadcast("player_left", { id: client.sessionId });
  }

  onDispose() {
    console.log("LobbyRoom disposed");
  }
}
