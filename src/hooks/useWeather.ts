import { useQuery } from '@tanstack/react-query'
import { useSettingsStore } from '@/stores/settings.store'
import { useLocationStore } from '@/stores/location.store'
import { getWeatherService } from '@/services/api'
import type { Coordinates } from '@/types'

export function useWeather(coordsOverride?: Coordinates) {
  const { weatherSource, weatherModel } = useSettingsStore()
  const selectedLat = useLocationStore((s) => s.selectedLocation?.lat)
  const selectedLon = useLocationStore((s) => s.selectedLocation?.lon)
  const currentLat  = useLocationStore((s) => s.currentPosition?.lat)
  const currentLon  = useLocationStore((s) => s.currentPosition?.lon)
  const lat = coordsOverride?.lat ?? selectedLat ?? currentLat
  const lon = coordsOverride?.lon ?? selectedLon ?? currentLon
  const coords: Coordinates | null = lat != null && lon != null ? { lat, lon } : null

  return useQuery({
    queryKey: ['weather', coords?.lat, coords?.lon, weatherSource, weatherModel],
    queryFn: async () => {
      if (!coords) throw new Error('Aucune position disponible')
      const service = getWeatherService()
      return service.getWeather(coords)
    },
    enabled: !!coords,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}
