const socket = new WebSocket("ws://localhost:8080");

const output = document.getElementById("output");

function write(text) {
  output.textContent += text + "\n";
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
  }
};
