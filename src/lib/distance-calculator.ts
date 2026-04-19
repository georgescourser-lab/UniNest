/**
 * Haversine formula to calculate distance between two geographic points
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

/**
 * KU Gates Coordinates (Approximate)
 */
export const KU_GATES = {
  GATE_A: { lat: 1.9437, lng: 36.881, name: 'Gate A (Main)' },
  GATE_B: { lat: 1.9467, lng: 36.885, name: 'Gate B' },
  GATE_C: { lat: 1.941, lng: 36.888, name: 'Gate C' },
};

/**
 * Calculate distance from property to nearest KU gate
 * @param propertyLat - Property latitude
 * @param propertyLng - Property longitude
 * @returns Object with nearest gate and distance in km
 */
export function calculateDistanceToKU(
  propertyLat: number,
  propertyLng: number
): {
  nearestGate: string;
  distanceKm: number;
  walkingTimeMinutes: number;
  allGates: Array<{ name: string; distanceKm: number }>;
} {
  const distances = {
    gateA: calculateHaversineDistance(
      propertyLat,
      propertyLng,
      KU_GATES.GATE_A.lat,
      KU_GATES.GATE_A.lng
    ),
    gateB: calculateHaversineDistance(
      propertyLat,
      propertyLng,
      KU_GATES.GATE_B.lat,
      KU_GATES.GATE_B.lng
    ),
    gateC: calculateHaversineDistance(
      propertyLat,
      propertyLng,
      KU_GATES.GATE_C.lat,
      KU_GATES.GATE_C.lng
    ),
  };

  const minDistance = Math.min(distances.gateA, distances.gateB, distances.gateC);
  let nearestGate = '';

  if (minDistance === distances.gateA) {
    nearestGate = KU_GATES.GATE_A.name;
  } else if (minDistance === distances.gateB) {
    nearestGate = KU_GATES.GATE_B.name;
  } else {
    nearestGate = KU_GATES.GATE_C.name;
  }

  // Average walking speed: 5 km/h ≈ 1 km in 12 minutes
  const walkingTimeMinutes = Math.ceil((minDistance / 5) * 60);

  return {
    nearestGate,
    distanceKm: parseFloat(minDistance.toFixed(2)),
    walkingTimeMinutes,
    allGates: [
      { name: KU_GATES.GATE_A.name, distanceKm: parseFloat(distances.gateA.toFixed(2)) },
      { name: KU_GATES.GATE_B.name, distanceKm: parseFloat(distances.gateB.toFixed(2)) },
      { name: KU_GATES.GATE_C.name, distanceKm: parseFloat(distances.gateC.toFixed(2)) },
    ],
  };
}

/**
 * Format distance for display
 * @param distanceKm - Distance in kilometers
 * @returns Formatted string (e.g., "2.5 km" or "500 m")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Format walking time for display
 * @param minutes - Time in minutes
 * @returns Formatted string (e.g., "12 min walk")
 */
export function formatWalkingTime(minutes: number): string {
  if (minutes < 1) return 'Walking distance';
  if (minutes === 1) return '1 min walk';
  return `${minutes} min walk`;
}
