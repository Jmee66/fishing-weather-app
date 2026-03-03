import type { UnitSystem } from '@/types'

export function msToKnots(ms: number): number {
  return ms * 1.94384
}

export function msToKmh(ms: number): number {
  return ms * 3.6
}

export function kmToNauticalMiles(km: number): number {
  return km / 1.852
}

export function metersToFeet(m: number): number {
  return m * 3.28084
}

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32
}

export function formatWindSpeed(ms: number, units: UnitSystem = 'metric'): string {
  if (units === 'nautical') return `${msToKnots(ms).toFixed(0)} kn`
  if (units === 'imperial') return `${(ms * 2.237).toFixed(0)} mph`
  return `${msToKmh(ms).toFixed(0)} km/h`
}

export function formatTemperature(celsius: number, units: UnitSystem = 'metric'): string {
  if (units === 'imperial') return `${celsiusToFahrenheit(celsius).toFixed(0)}°F`
  return `${celsius.toFixed(0)}°C`
}

export function formatDistance(km: number, units: UnitSystem = 'metric'): string {
  if (units === 'nautical') return `${kmToNauticalMiles(km).toFixed(1)} nm`
  if (units === 'imperial') return `${(km * 0.621371).toFixed(1)} mi`
  return km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`
}

export function formatHeight(meters: number, units: UnitSystem = 'metric'): string {
  if (units === 'imperial') return `${metersToFeet(meters).toFixed(1)} ft`
  return `${meters.toFixed(1)} m`
}

const WIND_DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO',
]

export function getWindDirectionLabel(degrees: number): string {
  const index = Math.round(degrees / 22.5) % 16
  return WIND_DIRECTIONS[index]
}
