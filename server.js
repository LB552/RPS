const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;

app.use(express.static("public"));

let queuedPlayer = null;

/* ----------------------------
   GAME LOGIC
-----------------------------*/

function determineScore(p1, p2) {
  if (p1 === p2) return "draw";

  if (
    (p1 === "rock" && p2 === "scissors") ||
    (p1 === "paper" && p2 === "rock") ||
    (p1 === "scissors" && p2 === "paper")
  ) {
    return "p1";
  }

  return "p2";
}

function send(ws, payload) {
  ws.send(JSON.stringify(payload));
}

function startMatch(p1, p2) {
  p1.opponent = p2;
  p2.opponent = p1;

  send(p1, { type: "start" });
  send(p2, { type: "start" });
}

function sendResult(p1, p2, gameOver, winner) {
  send(p1, {
    type: "result",
    yourChoice: p1.choice,
    opponentChoice: p2.choice,
    yourScore: p1.score,
    opponentScore: p2.score,
    gameOver,
    winner
  });

  send(p2, {
    type: "result",
    yourChoice: p2.choice,
    opponentChoice: p1.choice,
    yourScore: p2.score,
    opponentScore: p1.score,
    gameOver,
    winner:
      winner === "you"
        ? "opponent"
        : winner === "opponent"
        ? "you"
        : null
  });
}

function resetRound(p1, p2) {
  p1.choice = null;
  p2.choice = null;
}

/* ----------------------------
   CONNECTION HANDLING
-----------------------------*/

wss.on("connection", (ws) => {
  console.log("Player connected");

  ws.choice = null;
  ws.score = 0;
  ws.opponent = null;

  if (queuedPlayer) {
    startMatch(ws, queuedPlayer);
    queuedPlayer = null;
  } else {
    queuedPlayer = ws;
    send(ws, { type: "pending" });
  }

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type !== "choice") return;

    ws.choice = data.choice;

    const opponent = ws.opponent;
    if (!opponent || !opponent.choice) return;

    const result = determineScore(ws.choice, opponent.choice);

    if (result === "p1") ws.score++;
    if (result === "p2") opponent.score++;

    let gameOver = false;
    let winner = null;

    if (ws.score >= 3) {
      gameOver = true;
      winner = "you";
    } else if (opponent.score >= 3) {
      gameOver = true;
      winner = "opponent";
    }

    sendResult(ws, opponent, gameOver, winner);

    if (!gameOver) {
      resetRound(ws, opponent);
    }
  });

  ws.on("close", () => {
    console.log("Player disconnected");

    if (queuedPlayer === ws) queuedPlayer = null;

    if (ws.opponent) {
      send(ws.opponent, { type: "opponent_left" });
      ws.opponent.opponent = null;
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
