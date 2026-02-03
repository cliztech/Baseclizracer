export const CAR_LIBRARY = [
  {
    id: 'balanced',
    name: 'Balanced Coupe',
    spriteKeys: {
      left: 'PLAYER_LEFT',
      right: 'PLAYER_RIGHT',
      straight: 'PLAYER_STRAIGHT',
      uphillLeft: 'PLAYER_UPHILL_LEFT',
      uphillRight: 'PLAYER_UPHILL_RIGHT',
      uphillStraight: 'PLAYER_UPHILL_STRAIGHT'
    },
    trafficSpriteKey: 'CAR01',
    stats: { accel: 1.0, topSpeed: 1.0, grip: 1.0 }
  },
  {
    id: 'sprinter',
    name: 'Sprinter',
    spriteKeys: {
      left: 'CAR01',
      right: 'CAR01',
      straight: 'CAR01',
      uphillLeft: 'CAR01',
      uphillRight: 'CAR01',
      uphillStraight: 'CAR01'
    },
    trafficSpriteKey: 'CAR02',
    stats: { accel: 1.15, topSpeed: 0.98, grip: 0.95 }
  },
  {
    id: 'endurance',
    name: 'Endurance',
    spriteKeys: {
      left: 'CAR02',
      right: 'CAR02',
      straight: 'CAR02',
      uphillLeft: 'CAR02',
      uphillRight: 'CAR02',
      uphillStraight: 'CAR02'
    },
    trafficSpriteKey: 'CAR03',
    stats: { accel: 0.95, topSpeed: 1.08, grip: 1.05 }
  },
  {
    id: 'gripster',
    name: 'Gripster',
    spriteKeys: {
      left: 'CAR03',
      right: 'CAR03',
      straight: 'CAR03',
      uphillLeft: 'CAR03',
      uphillRight: 'CAR03',
      uphillStraight: 'CAR03'
    },
    trafficSpriteKey: 'CAR04',
    stats: { accel: 1.02, topSpeed: 0.96, grip: 1.15 }
  }
];

export const DEFAULT_CAR_ID = 'balanced';

export const LEVEL_ROTATION = [
  { id: 'coastal-run', label: 'Coastal Run' },
  { id: 'ridge-rally', label: 'Ridge Rally' },
  { id: 'sunset-sprint', label: 'Sunset Sprint' }
];

export function findCarById(carId) {
  return CAR_LIBRARY.find(car => car.id === carId) || CAR_LIBRARY.find(car => car.id === DEFAULT_CAR_ID);
}

export function createLevelRotation(startId = LEVEL_ROTATION[0].id) {
  const startIndex = Math.max(0, LEVEL_ROTATION.findIndex(level => level.id === startId));
  let pointer = startIndex;
  let primed = false;
  return {
    nextId() {
      if (!primed) {
        primed = true;
        return LEVEL_ROTATION[pointer].id;
      }
      pointer = (pointer + 1) % LEVEL_ROTATION.length;
      return LEVEL_ROTATION[pointer].id;
    },
    peek() {
      return LEVEL_ROTATION[pointer].id;
    }
  };
}
