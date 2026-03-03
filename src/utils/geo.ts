import type { Coordinates } from '@/types'

export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lon - a.lon) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const aa = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
  return R * c
}

export function getBoundingBox(center: Coordinates, radiusKm: number): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
  const latDelta = radiusKm / 111
  const lonDelta = radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180))
  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLon: center.lon - lonDelta,
    maxLon: center.lon + lonDelta,
  }
}

export function isCoastal(lat: number, lon: number): boolean {
  // Heuristique simple - peut être améliorée avec une vraie API
  return (lon < -0.5 && lat > 42 && lat < 51) || // Atlantique France
    (lon > 2 && lat > 42 && lat < 44) // Méditerranée
}
