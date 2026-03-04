import { useQuery } from '@tanstack/react-query'
import { fetchMarineWindGrid } from '@/services/api/openmeteo.service'
import type { WindGridData } from '@/services/api/openmeteo.service'
import type { Coordinates } from '@/types'

export function useWindGrid(coords?: Coordinates) {
  return useQuery<[WindGridData, WindGridData]>({
    queryKey: ['wind-grid', coords?.lat?.toFixed(2), coords?.lon?.toFixed(2)],
    queryFn: () => {
      if (!coords) throw new Error('Pas de position')
      return fetchMarineWindGrid(coords)
    },
    enabled: !!coords,
    staleTime: 15 * 60 * 1000, // 15 min
    retry: 1,
  })
}
