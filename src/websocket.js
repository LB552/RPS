const WebSocket = require("ws");
const { handleMatchmaking } = require("./matchmaking");
socket.onopen = () => {
console.log("✅ WebSocket connected");
};

socket.onerror = (err) => {
console.log("❌ WebSocket error", err);

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });
  
};

  wss.on("connection", (ws) => {
    console.log("Player connected");
    handleMatchmaking(ws);
  });
}

module.exports = { initWebSocket };
