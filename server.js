const express = require("express");
const http = require("http");
const { initWebSocket } = require("./src/websocket");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;

app.use(express.static("public"));

initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
