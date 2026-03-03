import type { FishActivityScore } from '@/types'

interface FishActivityInputs {
  pressureTrend: 'rising' | 'stable' | 'falling'
  pressureValue: number
  lunarPhase: number       // 0-1 (SunCalc)
  tidePhase?: 'high' | 'low' | 'rising' | 'falling'
  hoursFromTideEvent?: number
  windSpeedMs: number
  temperatureCelsius: number
  month: number            // 1-12
  minutesFromSunEvent?: number
}

function clamp(v: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, v))
}

export function calculateFishActivity(inputs: FishActivityInputs): FishActivityScore {
  const {
    pressureTrend, pressureValue, lunarPhase,
    hoursFromTideEvent, windSpeedMs, month, minutesFromSunEvent,
  } = inputs

  // --- Pressure score (0-10) ---
  let pressure = 5
  if (pressureTrend === 'rising') pressure = 7
  else if (pressureTrend === 'falling') pressure = 3
  if (pressureValue >= 1020) pressure = clamp(pressure + 1)
  else if (pressureValue < 1000) pressure = clamp(pressure - 2)

  // --- Lunar score (0-10) ---
  // New moon (0) and full moon (0.5) are best
  const lunarDist = Math.min(Math.abs(lunarPhase), Math.abs(lunarPhase - 0.5)) / 0.5
  const lunar = clamp(10 - lunarDist * 6)

  // --- Tide score (0-10) ---
  let tides = 5
  if (hoursFromTideEvent !== undefined) {
    if (hoursFromTideEvent <= 1) tides = 9
    else if (hoursFromTideEvent <= 2) tides = 7
    else if (hoursFromTideEvent <= 3) tides = 5
    else tides = 3
  }

  // --- Wind score (0-10) ---
  const windKmh = windSpeedMs * 3.6
  let wind: number
  if (windKmh < 5) wind = 6
  else if (windKmh < 15) wind = 9
  else if (windKmh < 25) wind = 7
  else if (windKmh < 35) wind = 4
  else if (windKmh < 50) wind = 2
  else wind = 0

  // --- Season score (0-10) ---
  const SEASON_BY_MONTH = [4, 5, 6, 7, 8, 9, 10, 10, 8, 7, 6, 4]
  const season = clamp(SEASON_BY_MONTH[month - 1] ?? 7)

  // --- Ephemeris score (0-10) ---
  let ephemeris = 5
  if (minutesFromSunEvent !== undefined) {
    if (minutesFromSunEvent <= 30) ephemeris = 9
    else if (minutesFromSunEvent <= 60) ephemeris = 7
  }

  const factors = {
    pressure: clamp(pressure),
    lunar: clamp(lunar),
    tides: clamp(tides),
    wind: clamp(wind),
    season: clamp(season),
    ephemeris: clamp(ephemeris),
  }

  const weights = { pressure: 0.2, lunar: 0.2, tides: 0.15, wind: 0.2, season: 0.15, ephemeris: 0.1 }
  const total = clamp(
    factors.pressure * weights.pressure +
    factors.lunar * weights.lunar +
    factors.tides * weights.tides +
    factors.wind * weights.wind +
    factors.season * weights.season +
    factors.ephemeris * weights.ephemeris
  )

  const label: FishActivityScore['label'] =
    total >= 8 ? 'excellent' :
    total >= 6 ? 'good' :
    total >= 4 ? 'average' :
    total >= 2 ? 'poor' : 'bad'

  const recommendations: Record<FishActivityScore['label'], string> = {
    excellent: 'Conditions excellentes — sortie très recommandée !',
    good: 'Bonnes conditions de pêche prévues.',
    average: 'Conditions moyennes — résultats variables.',
    poor: 'Conditions défavorables — peu de chance de prises.',
    bad: 'Conditions très mauvaises — à éviter.',
  }

  return { total, factors, label, recommendation: recommendations[label] }
}
