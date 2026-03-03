import { useMemo } from 'react'
import { useLocationStore } from '@/stores/location.store'
import { getEphemeris } from '@/utils/ephemeris'
import type { Coordinates } from '@/types'

export function useEphemeris(date = new Date(), coordsOverride?: Coordinates) {
  const selectedLat = useLocationStore((s) => s.selectedLocation?.lat)
  const selectedLon = useLocationStore((s) => s.selectedLocation?.lon)
  const currentLat  = useLocationStore((s) => s.currentPosition?.lat)
  const currentLon  = useLocationStore((s) => s.currentPosition?.lon)
  const lat = coordsOverride?.lat ?? selectedLat ?? currentLat
  const lon = coordsOverride?.lon ?? selectedLon ?? currentLon


  const dateStr = date.toDateString()

  return useMemo(() => {
    if (lat == null || lon == null) return null
    return getEphemeris(date, lat, lon)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr, lat, lon])
}
