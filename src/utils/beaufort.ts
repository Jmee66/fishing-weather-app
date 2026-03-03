import { BEAUFORT_SCALE } from '@/constants/weather.constants'
import type { BeaufortScale } from '@/types'

export function getBeaufortFromMs(windSpeedMs: number): BeaufortScale {
  for (const entry of BEAUFORT_SCALE) {
    if (windSpeedMs >= entry.ms[0] && windSpeedMs <= entry.ms[1]) {
      return entry.force as BeaufortScale
    }
  }
  return 12
}

export function getBeaufortFromKnots(knots: number): BeaufortScale {
  for (const entry of BEAUFORT_SCALE) {
    if (knots >= entry.knots[0] && knots <= entry.knots[1]) {
      return entry.force as BeaufortScale
    }
  }
  return 12
}

export function getBeaufortLabel(force: BeaufortScale): string {
  return BEAUFORT_SCALE[force]?.label ?? 'Inconnu'
}

export function getBeaufortColor(force: BeaufortScale): string {
  if (force <= 2) return '#22c55e'
  if (force <= 4) return '#84cc16'
  if (force <= 5) return '#eab308'
  if (force <= 6) return '#f97316'
  if (force <= 7) return '#ef4444'
  return '#7f1d1d'
}
