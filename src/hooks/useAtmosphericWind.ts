import { useQuery } from '@tanstack/react-query'
import { fetchAtmosphericWind } from '@/services/api/openmeteo.service'
import type { Coordinates } from '@/types'
import type { WindModelId } from '@/services/api/openmeteo.service'

/**
 * Données vent issues de l'API atmosphérique (api.open-meteo.com).
 * Supporte AROME HD (1.3 km), AROME (2.5 km), ARPEGE, ECMWF, GFS.
 * Utilisé dans les onglets Vent et Voile de MarinePage pour une précision maximale.
 */
export function useAtmosphericWind(coords?: Coordinates, windModel: WindModelId = 'arome_france_hd') {
  return useQuery({
    queryKey: ['atmo-wind', coords?.lat?.toFixed(3), coords?.lon?.toFixed(3), windModel],
    queryFn: () => fetchAtmosphericWind(coords!, windModel),
    enabled: !!coords,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount) => failureCount < 2,
  })
}
