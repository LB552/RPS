console.log("🔥 CLIENT FILE LOADED 🔥");

/* ==========================
   WebSocket setup
========================== */

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

  if (data.type === "pending") {
    statusEl.textContent = "Waiting for opponent...";
  }

  if (data.type === "start") {
    statusEl.textContent = "Game started!";
  }

  if (data.type === "result") {
    resultEl.textContent =
      `You chose ${data.yourChoice}, opponent chose ${data.opponentChoice}`;
  }

  if (data.type === "opponent_left") {
    statusEl.textContent = "Opponent left the game.";
  }
};


    setResult(
      `Opponent chose: ${data.opponentChoice.toUpperCase()} 
→ Winner: ${data.winner.toUpperCase()}`
    );

    updateScore(data.yourScore, data.opponentScore);
    enableChoices();
  }
};

/* ==========================
   DOM Helpers
========================== */

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

/* ==========================
   UI Update Functions
========================== */

function setStatus(text) {
  statusEl.textContent = text;
}

function setResult(text) {
  resultEl.textContent = text;
}

function updateScore(your, opponent) {
let maxWins = 3;

function updateScore(your, opponent) {
  scoreEl.textContent = `Score → You: ${your} | Opponent: ${opponent}`;

  if (your >= maxWins) {
    setResult("🔥 YOU WON THE MATCH (Best of 5) 🔥");
    disableChoices();
  }

  if (opponent >= maxWins) {
    setResult("💀 OPPONENT WON THE MATCH (Best of 5) 💀");
    disableChoices();
  }
}

/* ==========================
   Choice Highlight
========================== */

function highlightChoice(choice) {
  document.querySelectorAll(".choice").forEach(btn => {
    btn.style.backgroundColor = "";
    btn.style.color = "";
  });

  const btn = document.querySelector(`[data-choice="${choice}"]`);
  if (btn) {
    btn.style.backgroundColor = "#1e90ff";
    btn.style.color = "white";
  }
}

/* ==========================
   Enable / Disable Buttons
========================== */

function disableChoices() {
  document.querySelectorAll(".choice").forEach(btn => {
    btn.disabled = true;
  });
}

function enableChoices() {
  document.querySelectorAll(".choice").forEach(btn => {
    btn.disabled = false;
  });
}

/* ==========================
   Multiplayer Play
========================== */

function play(choice) {
  console.log("Clicked:", choice);

  highlightChoice(choice);
  disableChoices();

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "choice",
        choice: choice,
      })
    );
  }
}

/* ==========================
   CPU Mode
========================== */

function playAgainstCPU() {
  setStatus("Playing against CPU...");
  enableChoices();

  window.play = (playerChoice) => {

    highlightChoice(playerChoice);

    const choices = ["rock", "paper", "scissors"];
    const cpuChoice =
      choices[Math.floor(Math.random() * 3)];

    disableChoices();

    setStatus(`You chose: ${playerChoice.toUpperCase()}`);

    if (playerChoice === cpuChoice) {
      setResult(
        `CPU chose: ${cpuChoice.toUpperCase()} → DRAW`
      );
    } else if (
      (playerChoice === "rock" && cpuChoice === "scissors") ||
      (playerChoice === "paper" && cpuChoice === "rock") ||
      (playerChoice === "scissors" && cpuChoice === "paper")
    ) {
      setResult(
        `CPU chose: ${cpuChoice.toUpperCase()} → YOU WIN`
      );
    } else {
      setResult(
        `CPU chose: ${cpuChoice.toUpperCase()} → CPU WINS`
      );
    }

    setTimeout(enableChoices, 800);
  };
}

/* ==========================
   Button Event Listeners
========================== */

document.querySelectorAll(".choice").forEach((button) => {
  button.addEventListener("click", () => {
    const choice = button.dataset.choice;
    play(choice);
  });
});

const cpuBtn = document.getElementById("cpuButton");
if (cpuBtn) {
  cpuBtn.addEventListener("click", playAgainstCPU);
}

const resetBtn = document.getElementById("resetButton");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    location.reload();
  });
}

/* ==========================
   Default Mode
========================== */

window.play = play;
window.playAgainstCPU = playAgainstCPU;
