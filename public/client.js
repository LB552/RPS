console.log("🔥 CLIENT FILE LOADED 🔥");
// Kör först när DOM finns (oavsett var script-taggen ligger)
window.addEventListener("DOMContentLoaded", () => {
  // ✅ Skapa status/result om de inte finns i HTML
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

  // making websocket connection.
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${window.location.host}`);

  socket.onopen = () => {
    console.log("Connected");
    statusEl.textContent = "Connected";
  };

  // Koppla knappar (om de finns)
  document.querySelectorAll(".choice").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.choice;
      console.log("Clicked:", choice);

      socket.send(
        JSON.stringify({
          type: "choice",
          choice,
        })
      );
    });
  });

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
      resultEl.textContent = `You chose ${data.yourChoice}, opponent chose ${data.opponentChoice}`;
    }
  }

    if (data.type === "opponent_left") {
    document.getElementById("status").textContent =
      "Opponent left the game.";
  }


  socket.onerror = (err) => {
    console.log("❌ WebSocket error", err);
    statusEl.textContent = "WebSocket error (see console)";
  };
});
