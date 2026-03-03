import { useQuery } from '@tanstack/react-query'
import { useLocationStore } from '@/stores/location.store'
import { shomService } from '@/services/api/shom.service'
import type { Coordinates } from '@/types'

export function useTides(coordsOverride?: Coordinates) {
  const getActiveLocation = useLocationStore((s) => s.getActiveLocation)
  const coords = coordsOverride ?? getActiveLocation()

  const harbour = coords ? shomService.getNearestHarbour(coords) : null

  return useQuery({
    queryKey: ['tides', harbour?.code],
    queryFn: () => {
      if (!coords) throw new Error('Aucune position disponible')
      return shomService.getTides(coords)
    },
    enabled: !!coords,
    staleTime: 60 * 60 * 1000,
  })
}
