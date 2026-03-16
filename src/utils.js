export function send(ws, payload) {
  ws.send(JSON.stringify(payload));
}