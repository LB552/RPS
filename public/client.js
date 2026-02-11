const socket = new WebSocket(
  window.location.origin.replace("http", "ws")
);

socket.onopen = () => {
  console.log("Connected");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
};
