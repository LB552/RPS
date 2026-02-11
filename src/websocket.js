const WebSocket = require("ws");
const { handleMatchmaking } = require("./matchmaking");

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });
  
  socket.onopen = () => {
  console.log("✅ WebSocket connected");
};

socket.onerror = (err) => {
  console.log("❌ WebSocket error", err);
};

  wss.on("connection", (ws) => {
    console.log("Player connected");
    handleMatchmaking(ws);
  });
}

module.exports = { initWebSocket };
