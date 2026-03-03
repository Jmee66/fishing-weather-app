import SunCalc from 'suncalc'
import { LUNAR_PHASES } from '@/constants/weather.constants'

export interface FishingOptimum {
  start: Date
  end: Date
  reason: string
}

export interface EphemerisData {
  sunrise: Date | null
  sunset: Date | null
  solarNoon: Date | null
  moonrise: Date | null
  moonset: Date | null
  moonPhase: number
  moonIllumination: number
  moonPhaseName: string
  moonPhaseEmoji: string
  fishingOptimums: FishingOptimum[]
  civilDawn: Date | null
  civilDusk: Date | null
  nauticalDawn: Date | null
  nauticalDusk: Date | null
  astronomicalDawn: Date | null
  astronomicalDusk: Date | null
}

function toDateOrNull(d: Date): Date | null {
  return d && !isNaN(d.getTime()) ? d : null
}

function addMinutes(d: Date | null, min: number): Date | null {
  if (!d) return null
  return new Date(d.getTime() + min * 60000)
}

export function getEphemeris(date: Date, lat: number, lon: number): EphemerisData {
  const sunTimes = SunCalc.getTimes(date, lat, lon)
  const moonTimes = SunCalc.getMoonTimes(date, lat, lon)
  const moonIllum = SunCalc.getMoonIllumination(date)

  const moonPhase = moonIllum.phase

  const phaseInfo = LUNAR_PHASES.find(
    (p) => moonPhase >= p.range[0] && moonPhase < p.range[1]
  ) ?? LUNAR_PHASES[0]

  const sunrise = toDateOrNull(sunTimes.sunrise)
  const sunset = toDateOrNull(sunTimes.sunset)
  const moonrise = toDateOrNull(moonTimes.rise as Date)
  const moonset = toDateOrNull(moonTimes.set as Date)

  const fishingOptimums: FishingOptimum[] = []
  const WINDOW = 30 // minutes

  const addWindow = (anchor: Date | null, reason: string) => {
    if (!anchor) return
    const start = addMinutes(anchor, -WINDOW)
    const end = addMinutes(anchor, WINDOW)
    if (start && end) fishingOptimums.push({ start, end, reason })
  }

  addWindow(sunrise, 'Lever soleil')
  addWindow(sunset, 'Coucher soleil')
  addWindow(moonrise, 'Lever lune')
  addWindow(moonset, 'Coucher lune')

  return {
    sunrise,
    sunset,
    solarNoon: toDateOrNull(sunTimes.solarNoon),
    moonrise,
    moonset,
    moonPhase,
    moonIllumination: moonIllum.fraction,
    moonPhaseName: phaseInfo.name,
    moonPhaseEmoji: phaseInfo.emoji,
    fishingOptimums,
    civilDawn: toDateOrNull(sunTimes.dawn),
    civilDusk: toDateOrNull(sunTimes.dusk),
    nauticalDawn: toDateOrNull(sunTimes.nauticalDawn),
    nauticalDusk: toDateOrNull(sunTimes.nauticalDusk),
    astronomicalDawn: toDateOrNull(sunTimes.nightEnd),
    astronomicalDusk: toDateOrNull(sunTimes.night),
  }
}
