const socket = new WebSocket("ws://localhost:8080");

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

    document.getElementById("game").style.display = "block";
  }

if (data.type === "result") {
  write(`You chose: ${data.yourChoice}`);
  write(`Opponent chose: ${data.opponentChoice}`);
  write(`Score: You ${data.yourScore} - ${data.opponentScore} Opponent`);

  if (data.gameOver) {
    write(`🏆 Winner: ${data.winner}`);
  }
}



    if (data.type === "opponent_left") {
    write("Opponent disconnected ");
    }
};
