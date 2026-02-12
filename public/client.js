const socket = new WebSocket(
  window.location.origin.replace("http", "ws")
);

socket.onopen = () => console.log("WebSocket connected!");
socket.onerror = (err) => console.error("WebSocket error:", err);

// DOM elements
const output = document.getElementById("output");
const gameDiv = document.getElementById("game");
const offlineDiv = document.getElementById("offline");
const disconnectDiv = document.getElementById("disconnect");
const resetButton = document.getElementById("resetButton");
const cpuButton = document.getElementById("cpuButton");

// CPU game state
let cpuMode = false;
let playerScore = 0;
let cpuScore = 0;

// Write messages to output (same as old version)
function write(text) {
  output.textContent += text + "\n";
  output.scrollTop = output.scrollHeight;
}

// Same logic as old CPU version
function determineScore(p1Choice, p2Choice) {
  if (p1Choice === p2Choice) return "draw";
  else if (
    (p1Choice === "rock" && p2Choice === "scissors") ||
    (p1Choice === "paper" && p2Choice === "rock") ||
    (p1Choice === "scissors" && p2Choice === "paper")
  ) return "p1";
  else return "p2";
}

// Play button handler (used by HTML buttons)
function play(choice) {
  if (cpuMode) {
    const cpuChoices = ["rock", "paper", "scissors"];
    const cpuChoice = cpuChoices[Math.floor(Math.random() * 3)];

    const result = determineScore(choice, cpuChoice);

    if (result === "p1") playerScore++;
    else if (result === "p2") cpuScore++;

    write(`You chose: ${choice}`);
    write(`CPU chose: ${cpuChoice}`);
    write(`Score: You ${playerScore} - ${cpuScore} CPU`);

    if (playerScore >= 3 || cpuScore >= 3) {
      const winner = playerScore >= 3 ? "You" : "CPU";
      write(`Winner: ${winner}`);
      write("Click any button to rematch against CPU...");
      playerScore = 0;
      cpuScore = 0;
    }
  } else {
    socket.send(JSON.stringify({ type: "choice", choice }));
  }
}

// CPU button
cpuButton.addEventListener("click", () => {
  cpuMode = true;
  gameDiv.style.display = "block";
  offlineDiv.style.display = "none";
  write("Playing against CPU while waiting for opponent...");
});

// WebSocket messages
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "pending") {
    write("Waiting for opponent...");
  }

  if (data.type === "start") {
    write("Opponent found! Game starting...");

    cpuMode = false;
    playerScore = 0;
    cpuScore = 0;

    offlineDiv.style.display = "none";
    gameDiv.style.display = "block";
    disconnectDiv.style.display = "none";
  }

  if (data.type === "result") {
    write(`You chose: ${data.yourChoice}`);
    write(`Opponent chose: ${data.opponentChoice}`);
    write(`Score: You ${data.yourScore} - ${data.opponentScore} Opponent`);

    if (data.gameOver) {
      write(`Winner: ${data.winner}`);
      gameDiv.style.display = "none";
      disconnectDiv.style.display = "block";
    }
  }

  if (data.type === "opponent_left") {
    write("Opponent disconnected");
    gameDiv.style.display = "none";
    disconnectDiv.style.display = "block";
  }
};

// Reset button
resetButton.addEventListener("click", () => {
  window.location.reload();
});
