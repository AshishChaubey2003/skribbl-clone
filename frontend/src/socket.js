// socket.js
// WebSocket connection to FastAPI backend

let socket = null;
let listeners = {};

export function connectSocket(roomId, playerName) {
  socket = new WebSocket(`ws://localhost:8000/ws/${roomId}/${playerName}`);

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const type = message.type;
    if (listeners[type]) {
      listeners[type].forEach((cb) => cb(message));
    }
  };

  socket.onopen = () => console.log("Connected to server");
  socket.onclose = () => console.log("Disconnected from server");
}

export function sendMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

export function onMessage(type, callback) {
  if (!listeners[type]) listeners[type] = [];
  listeners[type].push(callback);
}

export function offMessage(type, callback) {
  if (listeners[type]) {
    listeners[type] = listeners[type].filter((cb) => cb !== callback);
  }
}

export function closeSocket() {
  if (socket) socket.close();
}
