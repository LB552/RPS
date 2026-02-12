console.log("🔥 CLIENT FILE LOADED 🔥");

// WebSocket setup

const socket = new WebSocket(
  window.location.origin.replace("http", "ws")
);

socket.onopen = () => {
  console.log("Connected");
};

socket.onerror = (err) => {
  console.error("WebSocket error:", err);
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data); 
  console.log("Received:", data);


  // Pending (waiting)

  if (data.type === "pending") {
    setStatus("Waiting for opponent...");
  }

  // Start game
  
  if (data.type === "start") {
    setStatus("Game started! Make your move.");
  }

  // Result from server
  
  if (data.type === "result") {
    setStatus(
      `You: ${data.yourChoice} | Opponent: ${data.opponentChoice}`
    );

    setResult(data.winner);
    updateScore(data.yourScore, data.opponentScore);
  }
};

// DOM helpers

function ensureEl(id, tag = "p") {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement(tag);
    el.id = id;
    document.body.appendChild(el);
  }
  return el;
}

const statusEl = ensureEl("status");
const resultEl = ensureEl("result");
const scoreEl = ensureEl("score");

// UI update functions

function setStatus(text) {
  statusEl.textContent = text;
}

function setResult(text) {
  resultEl.textContent = "Result: " + text;
}

function updateScore(your, opponent) {
  scoreEl.textContent = `Score → You: ${your} | Opponent: ${opponent}`;
}

// Play button logic

function play(choice) {
  console.log("Clicked:", choice);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "choice",
        choice: choice,
      })
    );
  } else {
    console.log("WebSocket not ready.");
  }
}

// CPU mode

function playAgainstCPU() {
  const choices = ["rock", "paper", "scissors"];
  const cpuChoice = choices[Math.floor(Math.random() * 3)];

  setStatus("Playing against CPU...");

  window.play = (playerChoice) => {
    setStatus(`You: ${playerChoice} | CPU: ${cpuChoice}`);

    if (playerChoice === cpuChoice) {
      setResult("Draw");
    } else if (
      (playerChoice === "rock" && cpuChoice === "scissors") ||
      (playerChoice === "paper" && cpuChoice === "rock") ||
      (playerChoice === "scissors" && cpuChoice === "paper")
    ) {
      setResult("You win!");
    } else {
      setResult("CPU wins!");
    }
  };
}

// Make functions global

window.play = play;
window.playAgainstCPU = playAgainstCPU;

// Hook up choice buttons

document.querySelectorAll(".choice").forEach((button) => {
  button.addEventListener("click", () => {
    const choice = button.dataset.choice;
    play(choice);
  });
});

// CPU button
const cpuBtn = document.getElementById("cpuButton");
if (cpuBtn) {
  cpuBtn.addEventListener("click", playAgainstCPU);
}

// Reset button
const resetBtn = document.getElementById("resetButton");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    location.reload();
  });
}
