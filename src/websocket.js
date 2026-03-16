import { WebSocketServer } from "ws";
import { handleMatchmaking } from "./matchmaking.js";

export function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Player connected");
    handleMatchmaking(ws);
  });
}