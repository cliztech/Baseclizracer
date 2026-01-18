/* global WebSocket */
export function createSocket(url, onMessage) {
  const ws = new WebSocket(url);

  ws.addEventListener('message', ev => {
    try {
      const envelope = JSON.parse(ev.data);
      if (onMessage) onMessage(envelope);
    } catch {
      // ignore malformed packets
    }
  });

  return {
    send(type, data = {}) {
      if (ws.readyState === WebSocket.OPEN) {
        // If data is already an object, merge it. Otherwise, treat as payload.
        // Legacy support: if type is object, treat as old send(data)
        if (typeof type === 'object') {
          ws.send(JSON.stringify(type));
        } else {
          ws.send(JSON.stringify({ type, ...data }));
        }
      }
    }
  };
}
