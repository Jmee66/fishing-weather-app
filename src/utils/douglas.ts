import { DOUGLAS_SCALE } from '@/constants/weather.constants'
import type { DouglasScale } from '@/types'

export function getDouglasFromHeight(heightM: number): DouglasScale {
  for (const entry of DOUGLAS_SCALE) {
    if (heightM >= entry.height[0] && heightM <= entry.height[1]) {
      return entry.scale as DouglasScale
    }
  }
  return 9
}

export function getDouglasLabel(scale: DouglasScale): string {
  return DOUGLAS_SCALE[scale]?.label ?? 'Inconnue'
}

export function getDouglasColor(scale: DouglasScale): string {
  if (scale <= 1) return '#22c55e'
  if (scale <= 3) return '#84cc16'
  if (scale <= 4) return '#eab308'
  if (scale <= 5) return '#f97316'
  if (scale <= 6) return '#ef4444'
  return '#7f1d1d'
}
