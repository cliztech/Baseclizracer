/* global WebSocket */
export function createSocket(url, onMessage) {
  const ws = new WebSocket(url);
  ws.addEventListener('message', ev => {
    try {
      const data = JSON.parse(ev.data);
      if (onMessage) onMessage(data);
    } catch {
      // ignore malformed packets
    }
  });
  return {
    send(data) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    }
  };
}
