const { send } = require("./utils");

function determineScore(p1, p2)
  {
    if (p1 === p2) return "draw";
    if ( (p1 === "rock" && p2 === "scissors") || (p1 === "paper" && p2 === "rock") || (p1 === "scissors" && p2 === "paper") )
      return "win";
      return "lose";
  }


function handleGame(ws) {
  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }

    if (data.type !== "choice") return;

    ws.choice = data.choice;
    const opponent = ws.opponent;

    if (!opponent || !opponent.choice) return;

    const result = determineScore(ws.choice, opponent.choice);

    if (result === "win") ws.score++;
    if (result === "lose") opponent.score++;

    const gameOver = ws.score >= 3 || opponent.score >= 3;

    // Capture choices before resetting
    const playerChoice = ws.choice;
    const opponentChoice = opponent.choice;

    // Send results
    send(ws, buildResult(ws, opponent, playerChoice, opponentChoice, gameOver));
    send(opponent, buildResult(opponent, ws, opponent.choice, ws.choice, gameOver));

    // Reset choices for next round
    if (!gameOver) {
      ws.choice = null;
      opponent.choice = null;
    }
  });
}

function buildResult(player, opponent, playerChoice, opponentChoice, gameOver) {
  return {
    type: "result",
    yourChoice: playerChoice,
    opponentChoice: opponentChoice,
    yourScore: player.score,
    opponentScore: opponent.score,
    gameOver,
    winner: gameOver ? (player.score > opponent.score ? "you" : "opponent") : null
  };
}


module.exports = { handleGame };