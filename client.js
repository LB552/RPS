const socket = new WebSocket("wss://rps-xcg9.onrender.com");

const output = document.getElementById("output");

function write(text) {
  output.textContent += text + "\n";
}

function play(choice){
  socket.send(JSON.stringify({
    type: "choice",
    choice
  }));
}

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "pending") {
    console.log("Waiting for opponent...");
    write("Waiting for opponent...");
  }

  if (data.type === "start") {
    console.log("Opponent found! Game starting...");
    write("Opponent found! Game starting...");

    document.getElementById("offline").style.display = "none";
    document.getElementById("game").style.display = "block";
  }

if (data.type === "result") {
  write(`You chose: ${data.yourChoice}`);
  write(`Opponent chose: ${data.opponentChoice}`);
  write(`Score: You ${data.yourScore} - ${data.opponentScore} Opponent`);

  if (data.gameOver) {
    write(`Winner: ${data.winner}`);

    document.getElementById("game").style.display = "none";
    document.getElementById("disconnect").style.display = "block";
  }
}



    if (data.type === "opponent_left") {
    write("Opponent disconnected ");

    document.getElementById("disconnect").style.display = "block";
    }
};

document.getElementById("resetButton").addEventListener("click", () => {
  // Reload the page to reset the game
  window.location.reload();
});