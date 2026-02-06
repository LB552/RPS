const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });
console.log("WebSocket server running on ws://localhost:8080");

let queuedPlayer = null;

// Determine the winner of a round
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
//ws.opponent.score krävs ej för självet får alltid ws.score = 0 vid connection

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

  // Handle incoming messages
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "choice") {
      ws.choice = data.choice;

      // Only proceed if both players have made a choice
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

        // Send results to both players
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
          winner: winner === "you" ? "opponent" : winner === "opponent" ? "you" : null
        }));

        // Reset choices for next round if game isn't over
        if (!gameOver) {
          ws.choice = null;
          ws.opponent.choice = null;
        }
      }
    }
  });

  // Handle disconnects
  ws.on("close", () => {
    if (queuedPlayer === ws) queuedPlayer = null;

    if (ws.opponent) {
      ws.opponent.send(JSON.stringify({ type: "opponent_left" }));
      ws.opponent.opponent = null;
      ws.opponent = null;
    }
  });
});
