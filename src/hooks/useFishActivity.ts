import { useMemo } from 'react'
import { useWeather } from './useWeather'
import { useTides } from './useTides'
import { useEphemeris } from './useEphemeris'
import { calculateFishActivity } from '@/utils/fishActivity'
import type { FishActivityScore } from '@/types'

export function useFishActivity(): FishActivityScore | null {
  const { data: weather } = useWeather()
  const { data: tides } = useTides()
  const ephemeris = useEphemeris()

  return useMemo(() => {
    if (!weather?.current) return null

    const now = Date.now()
    const nextTideEvent = tides?.events?.find((e: { dt: number }) => e.dt * 1000 > now - 2 * 3600000)
    const hoursFromTideEvent = nextTideEvent ? Math.abs((nextTideEvent.dt * 1000 - now) / 3600000) : undefined

    const nextSunEvent = ephemeris
      ? [ephemeris.sunrise, ephemeris.sunset].find((t) => t != null && Math.abs(t.getTime() - now) < 30 * 60000) ?? null
      : undefined
    const minutesFromSunEvent = nextSunEvent ? Math.abs(nextSunEvent.getTime() - now) / 60000 : undefined

    const month = new Date().getMonth() + 1
    const pressureHistory = weather.hourly?.slice(0, 6).map((h) => h.pressure) ?? []
    const pressureDiff = pressureHistory.length >= 2 ? pressureHistory[pressureHistory.length - 1] - pressureHistory[0] : 0
    const pressureTrend = pressureDiff > 2 ? 'rising' : pressureDiff < -2 ? 'falling' : 'stable'

    return calculateFishActivity({
      pressureTrend,
      pressureValue: weather.current.pressure,
      lunarPhase: ephemeris?.moonPhase ?? 0,
      tidePhase: nextTideEvent?.type === 'PM' ? 'high' : nextTideEvent?.type === 'BM' ? 'low' : undefined,
      hoursFromTideEvent,
      windSpeedMs: weather.current.wind_speed,
      temperatureCelsius: weather.current.temp,
      month,
      minutesFromSunEvent,
    })
  }, [weather, tides, ephemeris])
}
