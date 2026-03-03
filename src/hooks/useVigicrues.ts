import { useQuery } from '@tanstack/react-query'
import { useLocationStore } from '@/stores/location.store'
import { vigicruesService } from '@/services/api/vigicrues.service'
import type { Coordinates } from '@/types'

export function useVigicrues(coordsOverride?: Coordinates) {
  const selectedLat = useLocationStore((s) => s.selectedLocation?.lat)
  const selectedLon = useLocationStore((s) => s.selectedLocation?.lon)
  const currentLat  = useLocationStore((s) => s.currentPosition?.lat)
  const currentLon  = useLocationStore((s) => s.currentPosition?.lon)
  const lat = coordsOverride?.lat ?? selectedLat ?? currentLat
  const lon = coordsOverride?.lon ?? selectedLon ?? currentLon
  const coords: Coordinates | null = lat != null && lon != null ? { lat, lon } : null

  return useQuery({
    queryKey: ['vigicrues', coords?.lat, coords?.lon],
    queryFn: () => {
      if (!coords) throw new Error('Aucune position disponible')
      return vigicruesService.getHydrologyData(coords)
    },
    enabled: !!coords,
    staleTime: 15 * 60 * 1000,
  })
}
