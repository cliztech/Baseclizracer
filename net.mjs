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
    carSkin: (typeof packet.carSkin === 'string') ? packet.carSkin : DEFAULT_COSMETICS.carSkin,
    color: (typeof packet.color === 'string') ? packet.color : DEFAULT_COSMETICS.color
  };
}

export function createSocket(url, onMessage) {
  const ws = new WebSocket(url);
  ws.addEventListener('message', ev => {
    const data = safeParse(ev.data);
    if (data && onMessage) onMessage(data);
  });
  return {
    send(data) {
      if (ws.readyState === WebSocket.OPEN) {
        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        ws.send(payload);
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
