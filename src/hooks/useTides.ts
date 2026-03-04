import { useQuery } from '@tanstack/react-query'
import { useLocationStore } from '@/stores/location.store'
import { shomService } from '@/services/api/shom.service'
import type { Coordinates } from '@/types'

export function useTides(coordsOverride?: Coordinates) {
  const selectedLat = useLocationStore((s) => s.selectedLocation?.lat)
  const selectedLon = useLocationStore((s) => s.selectedLocation?.lon)
  const currentLat  = useLocationStore((s) => s.currentPosition?.lat)
  const currentLon  = useLocationStore((s) => s.currentPosition?.lon)
  const lat = coordsOverride?.lat ?? selectedLat ?? currentLat
  const lon = coordsOverride?.lon ?? selectedLon ?? currentLon
  const coords: Coordinates | null = lat != null && lon != null ? { lat, lon } : null

  const harbour = coords ? shomService.getNearestHarbour(coords) : null

  return useQuery({
    queryKey: ['tides', harbour?.code, coords?.lat, coords?.lon],
    queryFn: () => {
      if (!coords) throw new Error('Aucune position disponible')
      return shomService.getTides(coords)
    },
    enabled: !!coords,
    staleTime: 60 * 60 * 1000,
  })
}
