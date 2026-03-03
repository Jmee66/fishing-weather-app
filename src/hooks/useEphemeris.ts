import { useMemo } from 'react'
import { useLocationStore } from '@/stores/location.store'
import { getEphemeris } from '@/utils/ephemeris'
import type { Coordinates } from '@/types'

export function useEphemeris(date = new Date(), coordsOverride?: Coordinates) {
  const getActiveLocation = useLocationStore((s) => s.getActiveLocation)
  const coords = coordsOverride ?? getActiveLocation()

  return useMemo(() => {
    if (!coords) return null
    return getEphemeris(date, coords.lat, coords.lon)
  }, [date.toDateString(), coords?.lat, coords?.lon])
}
