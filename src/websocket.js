const WebSocket = require("ws");
const { handleMatchmaking } = require("./matchmaking");

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Player connected");
    handleMatchmaking(ws);
  });
}

module.exports = { initWebSocket };
