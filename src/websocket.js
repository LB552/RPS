const WebSocket = require("ws");
const { handleMatchmaking } = require("./matchmaking");

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Player connected");

    ws.choice = null;
    ws.score = 0;
    ws.opponent = null;

    handleMatchmaking(ws);
  });
}

module.exports = { initWebSocket };
