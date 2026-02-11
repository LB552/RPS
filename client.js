const socket = new WebSocket("wss://rps-xcg9.onrender.com");

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

// Write messages to output
function write(text) {
  output.textContent += text + "\n";
}

// Local CPU game logic
function determineScore(p1Choice, p2Choice) {
  if (p1Choice === p2Choice) return "draw";
  else if (
    (p1Choice === "rock" && p2Choice === "scissors") ||
    (p1Choice === "paper" && p2Choice === "rock") ||
    (p1Choice === "scissors" && p2Choice === "paper")
  ) return "p1";
  else return "p2";
}

// Handle player move
function play(choice) {
  if (cpuMode) {
    // CPU picks randomly
    const cpuChoices = ["rock", "paper", "scissors"];
    const cpuChoice = cpuChoices[Math.floor(Math.random() * 3)];

    const result = determineScore(choice, cpuChoice);

    if (result === "p1") playerScore++;
    else if (result === "p2") cpuScore++;

    write(`You chose: ${choice}`);
    write(`CPU chose: ${cpuChoice}`);
    write(`Score: You ${playerScore} - ${cpuScore} CPU`);

    // Check for CPU game over
    if (playerScore >= 3 || cpuScore >= 3) {
      const winner = playerScore >= 3 ? "You" : "CPU";
      write(`Winner: ${winner}`);
      write("Click any button to rematch against CPU...");

      // Reset scores automatically for rematch
      playerScore = 0;
      cpuScore = 0;
    }
  } else {
    // Online mode: send choice to server
    socket.send(JSON.stringify({ type: "choice", choice }));
  }
}

// Handle CPU button click
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

    // Stop CPU mode immediately
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

      // Reset button reloads page for online match
      resetButton.onclick = () => window.location.reload();
    }
  }

  if (data.type === "opponent_left") {
    write("Opponent disconnected");
    gameDiv.style.display = "none";
    disconnectDiv.style.display = "block";

    resetButton.onclick = () => window.location.reload();
  }
};

// Reset button (default reload)
resetButton.addEventListener("click", () => {
  window.location.reload();
});
