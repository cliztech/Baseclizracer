/* global WebSocket */
export function createSocket(url, onMessage) {
  const ws = new WebSocket(url);
  const queue = [];

  ws.addEventListener('message', ev => {
    try {
      const envelope = JSON.parse(ev.data);
      if (onMessage) onMessage(envelope);
    } catch {
      // ignore malformed packets
    }
  });

  ws.addEventListener('open', () => {
    while (queue.length > 0) {
      ws.send(queue.shift());
    }
  });

  return {
    send(type, data = {}) {
      let payload;
      // Legacy support: if type is object, treat as old send(data)
      if (typeof type === 'object') {
        payload = JSON.stringify(type);
      } else {
        payload = JSON.stringify({ type, ...data });
      }

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      } else {
        queue.push(payload);
      }
    }
  };
}
