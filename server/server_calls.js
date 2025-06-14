const SERVER_URL = 'https://balls-zcyo.onrender.com';

const socket = io(SERVER_URL);

socket.on('connect', () => {
    console.log('Connected with id:', socket.id);
    socket.emit('chat message', 'Hello from client!');
});

socket.on('chat message', (msg) => {
    console.log('Message from server:', msg);
});

export function updatePlayerPosition(position) {
    socket.emit('updatePlayerPosition', position);
}

export function onPlayerPositionUpdate(callback) {
    socket.on('player position', (position) => {
        console.log('Updated player position:', position);
        callback(position);
    });
}
