import { useQuery } from '@tanstack/react-query'
import { fetchMarineWindGrid } from '@/services/api/openmeteo.service'
import type { WindGridData, WindModelId } from '@/services/api/openmeteo.service'
import type { Coordinates } from '@/types'

export function useWindGrid(coords?: Coordinates, windModel: WindModelId = 'arome_france_hd') {
  return useQuery<[WindGridData, WindGridData]>({
    queryKey: ['wind-grid', coords?.lat?.toFixed(2), coords?.lon?.toFixed(2), windModel],
    queryFn: () => {
      if (!coords) throw new Error('Pas de position')
      return fetchMarineWindGrid(coords, 5, 1.0, windModel)
    },
    enabled: !!coords,
    staleTime: 15 * 60 * 1000, // 15 min
    retry: 1,
  })
}
