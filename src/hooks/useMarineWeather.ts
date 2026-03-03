import { useQuery } from '@tanstack/react-query'
import { useLocationStore } from '@/stores/location.store'
import { openMeteoService } from '@/services/api/openmeteo.service'
import type { Coordinates } from '@/types'

export function useMarineWeather(coordsOverride?: Coordinates) {
  const getActiveLocation = useLocationStore((s) => s.getActiveLocation)
  const coords = coordsOverride ?? getActiveLocation()

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
