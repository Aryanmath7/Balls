// colyseus.js@0.15.28
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var NodeWebSocket = require('ws');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var NodeWebSocket__default = /*#__PURE__*/_interopDefaultLegacy(NodeWebSocket);

var WebSocket = globalThis.WebSocket || NodeWebSocket__default["default"];
var WebSocketTransport = /** @class */ (function () {
    function WebSocketTransport(events) {
        this.events = events;
    }
    WebSocketTransport.prototype.send = function (data) {
        if (data instanceof ArrayBuffer) {
            this.ws.send(data);
        }
        else if (Array.isArray(data)) {
            this.ws.send((new Uint8Array(data)).buffer);
        }
    };
    /**
     * @param url URL to connect to
     * @param headers custom headers to send with the connection (only supported in Node.js. Web Browsers do not allow setting custom headers)
     */
    WebSocketTransport.prototype.connect = function (url, headers) {
        try {
            // Node or Bun environments (supports custom headers)
            this.ws = new WebSocket(url, { headers: headers, protocols: this.protocols });
        }
        catch (e) {
            // browser environment (custom headers not supported)
            this.ws = new WebSocket(url, this.protocols);
        }
        this.ws.binaryType = 'arraybuffer';
        this.ws.onopen = this.events.onopen;
        this.ws.onmessage = this.events.onmessage;
        this.ws.onclose = this.events.onclose;
        this.ws.onerror = this.events.onerror;
    };
    WebSocketTransport.prototype.close = function (code, reason) {
        this.ws.close(code, reason);
    };
    Object.defineProperty(WebSocketTransport.prototype, "isOpen", {
        get: function () {
            return this.ws.readyState === WebSocket.OPEN;
        },
        enumerable: false,
        configurable: true
    });
    return WebSocketTransport;
}());

exports.WebSocketTransport = WebSocketTransport;
//# sourceMappingURL=WebSocketTransport.js.map
