export const BASE_CAR_PALETTE = {
  body: '#d81b1b',
  shadow: '#7c0f0f',
  trim: '#f4f4f4',
  decal: '#ffd447'
};

export const CAR_SKINS = {
  'factory-red': {
    label: 'Factory Red',
    palette: {
      body: '#d81b1b',
      shadow: '#7c0f0f',
      trim: '#f4f4f4',
      decal: '#ffd447'
    },
    hudColor: '#ff6b6b'
  },
  'midnight-cyan': {
    label: 'Midnight Cyan',
    palette: {
      body: '#0f172a',
      shadow: '#020617',
      trim: '#e2e8f0',
      decal: '#38bdf8'
    },
    hudColor: '#38bdf8'
  },
  'aurora-violet': {
    label: 'Aurora Violet',
    palette: {
      body: '#6b21a8',
      shadow: '#3b0764',
      trim: '#f5f3ff',
      decal: '#f97316'
    },
    hudColor: '#f97316'
  },
  'forest-surge': {
    label: 'Forest Surge',
    palette: {
      body: '#15803d',
      shadow: '#064e3b',
      trim: '#d1fae5',
      decal: '#bef264'
    },
    hudColor: '#22c55e'
  }
};

export function hexToRgb(hex) {
  const normalized = String(hex || '').replace('#', '');
  const bigint = parseInt(normalized, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

export function buildPaletteSwapTable(basePalette, skins) {
  const baseEntries = Object.entries(basePalette).map(([key, value]) => [key, hexToRgb(value)]);
  return Object.keys(skins).reduce((table, key) => {
    const skin = skins[key];
    table[key] = baseEntries.map(([slot, from]) => ({
      from,
      to: hexToRgb(skin.palette[slot] || basePalette[slot]),
      slot
    }));
    return table;
  }, {});
}

export function applyPaletteSwap(imageData, swapTable, tolerance = 12) {
  const data = imageData.data || imageData;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (!a) continue;
    const match = swapTable.find(swap => colorMatches(r, g, b, swap.from, tolerance));
    if (match) {
      data[i] = match.to.r;
      data[i + 1] = match.to.g;
      data[i + 2] = match.to.b;
    }
  }
  return imageData;
}

function colorMatches(r, g, b, target, tolerance) {
  return Math.abs(r - target.r) <= tolerance &&
         Math.abs(g - target.g) <= tolerance &&
         Math.abs(b - target.b) <= tolerance;
}
