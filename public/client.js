const socket = new WebSocket(window.location.origin.replace("http", "ws"));

socket.onopen = () => { console.log("Connected"); };

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);

  if (data.type === "start") {
    document.getElementById("offline").style.display = "none";
    document.getElementById("game").style.display = "block";
  }

  if (data.type === "pending") {
    document.getElementById("offline").style.display = "block";
  }

  if (data.type === "result") {
    document.getElementById("output").innerText = 
      `You chose ${data.yourChoice}, opponent chose ${data.opponentChoice}. Your score: ${data.yourScore}, Opponent score: ${data.opponentScore}`;
    
    if (data.gameOver) {
      alert(`Game over! Winner: ${data.winner}`);
    }
  }

  if (data.type === "opponent_left") {
    alert("Your opponent disconnected. Returning to queue.");
    document.getElementById("game").style.display = "none";
    document.getElementById("offline").style.display = "block";
  }
};

// Multiplayer play function
function play(choice) {
  socket.send(JSON.stringify({ type: "choice", choice }));
}

// CPU button fallback (unchanged)
document.getElementById("cpuButton").addEventListener("click", () => {
  const choices = ["rock", "paper", "scissors"];
  const playerChoice = prompt("Choose rock, paper, or scissors");
  const cpuChoice = choices[Math.floor(Math.random() * 3)];

  const result =
    playerChoice === cpuChoice
      ? "draw"
      : (playerChoice === "rock" && cpuChoice === "scissors") ||
        (playerChoice === "paper" && cpuChoice === "rock") ||
        (playerChoice === "scissors" && cpuChoice === "paper")
      ? "win"
      : "lose";

  document.getElementById("output").innerText =
    `You chose ${playerChoice}, CPU chose ${cpuChoice}. Result: ${result}`;
});

// Optional: reset button for disconnected opponent
document.getElementById("resetButton")?.addEventListener("click", () => {
  location.reload();
});
