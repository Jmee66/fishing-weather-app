import { useQuery } from '@tanstack/react-query'
import { useLocationStore } from '@/stores/location.store'
import { vigicruesService } from '@/services/api/vigicrues.service'
import type { Coordinates } from '@/types'

export function useVigicrues(coordsOverride?: Coordinates) {
  const getActiveLocation = useLocationStore((s) => s.getActiveLocation)
  const coords = coordsOverride ?? getActiveLocation()

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
