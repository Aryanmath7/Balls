import { Room } from "colyseus";
import { Schema, MapSchema, type } from "@colyseus/schema";

class Vector2 extends Schema {
  constructor() {
    super();
    this.x = 0;
    this.y = 0;
  }
}
Vector2.schema = {
  x: "number",
  y: "number"
};

class Player extends Schema {
  constructor() {
    super();
    this.id = "";
    this.position = new Vector2();
  }
}
Player.schema = {
  id: "string",
  position: Vector2
};

class GameState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
  }
}

GameState.schema = {
  players: { map: Player }
};

export class AirHockeyRoom extends Room {
  maxClients = 2;

  onCreate(options) {
    this.state = new GameState();
  }

  onJoin(client, options) {
    if (!this.state) {
      console.error("❌ ERROR: Room state not initialized before onJoin");
      return;
    }
  }

  onLeave(client, consented) {
    this.state.players.delete(client.sessionId);
    console.log(`${client.sessionId} left.`);
  }

  onDispose() {
    console.log("AirHockeyRoom disposed.");
  }
}
