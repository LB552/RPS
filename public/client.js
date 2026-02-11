//making websocket connection.
const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const socket = new WebSocket(`${protocol}://${window.location.host}`);

socket.onopen = () => {
  console.log("Connected");
};

document.querySelectorAll(".choice").forEach(button => {
  button.addEventListener("click", () => {
    const choice = button.dataset.choice;

    console.log("Clicked:", choice);

    socket.send(JSON.stringify({
      type: "choice",
      choice
    }));
  });
});

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);

  if (data.type === "result") {
    document.getElementById("result").textContent =
      `You chose ${data.yourChoice}, opponent chose ${data.opponentChoice}`;
  }

  if (data.type === "pending") {
    document.getElementById("status").textContent = "Waiting for opponent...";
  }

  if (data.type === "start") {
    document.getElementById("status").textContent = "Game started!";
  }
};
