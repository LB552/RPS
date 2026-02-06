const socket = new WebSocket("ws://localhost:8080");

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "pending") {
        console.log("Waiting for opponent...");
    }

    if (data.type ==="start") {
        console.log("Opponent found! Game starting...");
    }
};