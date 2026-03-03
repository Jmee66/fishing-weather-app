import { useQuery } from '@tanstack/react-query'
import { useLocationStore } from '@/stores/location.store'
import { openMeteoService } from '@/services/api/openmeteo.service'
import type { Coordinates } from '@/types'

export function useMarineWeather(coordsOverride?: Coordinates) {
  const selectedLat = useLocationStore((s) => s.selectedLocation?.lat)
  const selectedLon = useLocationStore((s) => s.selectedLocation?.lon)
  const currentLat  = useLocationStore((s) => s.currentPosition?.lat)
  const currentLon  = useLocationStore((s) => s.currentPosition?.lon)
  const lat = coordsOverride?.lat ?? selectedLat ?? currentLat
  const lon = coordsOverride?.lon ?? selectedLon ?? currentLon
  const coords: Coordinates | null = lat != null && lon != null ? { lat, lon } : null

  return useQuery({
    queryKey: ['marine', coords?.lat, coords?.lon],
    queryFn: async () => {
      if (!coords) throw new Error('Aucune position disponible')
      return openMeteoService.getMarineForecast(coords)
    },
    enabled: !!coords,
    staleTime: 5 * 60 * 1000,
  })
}
