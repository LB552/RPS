const http = require("http");
const WebSocket = require("ws");

const port = process.env.PORT || 8080;

// Create HTTP server (required for Render)
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("WebSocket server is running");
});

// Attach WebSocket to HTTP server
const wss = new WebSocket.Server({ server });

console.log("WebSocket server initializing...");

let queuedPlayer = null;

function determineScore(p1Choice, p2Choice) {
  if (p1Choice === p2Choice) return "draw";
  else if (
    (p1Choice === "rock" && p2Choice === "scissors") ||
    (p1Choice === "paper" && p2Choice === "rock") ||
    (p1Choice === "scissors" && p2Choice === "paper")
  ) {
    return "p1";
  } else {
    return "p2";
  }
}

wss.on("connection", (ws) => {
  ws.choice = null;
  ws.opponent = null;
  ws.score = 0;

  console.log("Player connected");

  // Matchmaking
  if (queuedPlayer) {
    ws.opponent = queuedPlayer;
    queuedPlayer.opponent = ws;

    ws.send(JSON.stringify({ type: "start" }));
    queuedPlayer.send(JSON.stringify({ type: "start" }));

    queuedPlayer = null;
  } else {
    queuedPlayer = ws;
    ws.send(JSON.stringify({ type: "pending" }));
  }

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "choice") {
      ws.choice = data.choice;

      if (ws.choice && ws.opponent && ws.opponent.choice) {
        const result = determineScore(ws.choice, ws.opponent.choice);

        if (result === "p1") ws.score += 1;
        else if (result === "p2") ws.opponent.score += 1;

        let gameOver = false;
        let winner = null;

        if (ws.score >= 3) {
          gameOver = true;
          winner = "you";
        } else if (ws.opponent.score >= 3) {
          gameOver = true;
          winner = "opponent";
        }

        ws.send(JSON.stringify({
          type: "result",
          yourChoice: ws.choice,
          opponentChoice: ws.opponent.choice,
          yourScore: ws.score,
          opponentScore: ws.opponent.score,
          gameOver,
          winner
        }));

        ws.opponent.send(JSON.stringify({
          type: "result",
          yourChoice: ws.opponent.choice,
          opponentChoice: ws.choice,
          yourScore: ws.opponent.score,
          opponentScore: ws.score,
          gameOver,
          winner:
            winner === "you"
              ? "opponent"
              : winner === "opponent"
              ? "you"
              : null
        }));

        if (!gameOver) {
          ws.choice = null;
          ws.opponent.choice = null;
        }
      }
    }
  });

  ws.on("close", () => {
    console.log("Player disconnected");

    if (queuedPlayer === ws) queuedPlayer = null;

    if (ws.opponent) {
      ws.opponent.send(JSON.stringify({ type: "opponent_left" }));
      ws.opponent.opponent = null;
      ws.opponent = null;
    }
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
