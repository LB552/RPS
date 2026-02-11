const { send } = require("./utils");

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

function handleGame(ws) {
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

    send(ws, {
      type: "result",
      yourChoice: ws.choice,
      opponentChoice: opponent.choice,
      yourScore: ws.score,
      opponentScore: opponent.score,
      gameOver,
      winner
    });

    send(opponent, {
      type: "result",
      yourChoice: opponent.choice,
      opponentChoice: ws.choice,
      yourScore: opponent.score,
      opponentScore: ws.score,
      gameOver,
      winner:
        winner === "you"
          ? "opponent"
          : winner === "opponent"
          ? "you"
          : null
    });

    if (!gameOver) {
      ws.choice = null;
      opponent.choice = null;
    }
  });
}

module.exports = { handleGame };
