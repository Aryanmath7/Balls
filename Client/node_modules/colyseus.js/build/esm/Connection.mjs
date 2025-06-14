// colyseus.js@0.15.28
import { WebSocketTransport } from './transport/WebSocketTransport.mjs';

class Connection {
    transport;
    events = {};
    constructor() {
        this.transport = new WebSocketTransport(this.events);
    }
    send(data) {
        this.transport.send(data);
    }
    connect(url, options) {
        this.transport.connect(url, options);
    }
    close(code, reason) {
        this.transport.close(code, reason);
    }
    get isOpen() {
        return this.transport.isOpen;
    }
}

export { Connection };
//# sourceMappingURL=Connection.mjs.map
