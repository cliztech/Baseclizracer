/* global WebSocket */
export const DEFAULT_COSMETICS = {
  carSkin: 'factory-red',
  color: '#ff6b6b'
};

export function serializePlayerState(state) {
  const packet = {
    id: state.id,
    x: state.x,
    z: state.z,
    speed: state.speed,
    carSkin: state.carSkin || DEFAULT_COSMETICS.carSkin,
    color: state.color || DEFAULT_COSMETICS.color
  };
  return JSON.stringify(packet);
}

export function deserializePlayerState(payload) {
  if (!payload) return null;
  const packet = typeof payload === 'string' ? safeParse(payload) : payload;
  if (!packet) return null;
  return {
    id: packet.id,
    x: Number(packet.x) || 0,
    z: Number(packet.z) || 0,
    speed: Number(packet.speed) || 0,
    carSkin: packet.carSkin || DEFAULT_COSMETICS.carSkin,
    color: packet.color || DEFAULT_COSMETICS.color
  };
}

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

      // If data is already an object, merge it. Otherwise, treat as payload.
      // Legacy support: if type is object, treat as old send(data)
      if (typeof type === 'object') {
        payload = JSON.stringify(type);
      } else {
        payload = JSON.stringify({ type, ...data });
      }

      if (ws.readyState === WebSocket.OPEN) {
        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        ws.send(payload);
        ws.send(payload);
      } else {
        queue.push(payload);
      }
    }
  };
}

function safeParse(payload) {
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
