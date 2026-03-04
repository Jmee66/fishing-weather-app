/**
 * useMarineConsensus — requête 3 modèles en parallèle (mfwave, ecmwf_wam, gwam)
 * et calcule un indice de confiance basé sur l'écart entre modèles.
 *
 * Logique :
 *  - Écart-type normalisé sur wind_speed et wave_height (H0 à H12)
 *  - Score 0-100 : 100 = parfait accord, 0 = forte divergence
 *  - Seuils : ≥ 80 vert (bon accord), 60-79 jaune (modéré), < 60 rouge (divergent)
 */
import { useQuery } from '@tanstack/react-query'
import { fetchMarineSnapshot } from '@/services/api/openmeteo.service'
import type { MarineSnapshot } from '@/services/api/openmeteo.service'
import type { Coordinates } from '@/types'

export interface ConsensusResult {
  snapshots: MarineSnapshot[]
  // Valeurs moyennées entre les 3 modèles
  mean_wind_speed: number
  mean_wave_height: number
  // Écart-types
  std_wind_speed: number
  std_wave_height: number
  // Score de confiance 0-100
  confidence: number
  confidenceLabel: 'Bon accord' | 'Divergence modérée' | 'Forte divergence'
  confidenceColor: string
  // Tendance 12h : chaque heure, valeur moyenne + min + max sur les modèles
  trend: Array<{
    hour: number
    mean_wind: number
    min_wind: number
    max_wind: number
    mean_wave: number
    min_wave: number
    max_wave: number
  }>
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function computeConfidence(snapshots: MarineSnapshot[]): number {
  if (snapshots.length < 2) return 70 // une seule source = confiance partielle

  // Collecter les valeurs h0-h11 de tous les modèles
  const windValues = snapshots.map((s) => s.wind_speed)
  const waveValues = snapshots.map((s) => s.wave_height)

  // Moyenne pour normalisation
  const meanWind = windValues.reduce((a, b) => a + b, 0) / windValues.length || 1
  const meanWave = waveValues.reduce((a, b) => a + b, 0) / waveValues.length || 0.5

  // Coefficient de variation (std/mean) → plus c'est petit, plus les modèles s'accordent
  const cvWind = stdDev(windValues) / meanWind
  const cvWave = stdDev(waveValues) / meanWave

  // Aussi comparer les tendances sur 12h
  const trendCVs: number[] = []
  const nHours = Math.min(...snapshots.map((s) => s.hourly.length))
  for (let h = 0; h < nHours; h++) {
    const ws = snapshots.map((s) => s.hourly[h]?.wind_speed ?? s.wind_speed)
    const meanW = ws.reduce((a, b) => a + b, 0) / ws.length || 1
    trendCVs.push(stdDev(ws) / meanW)
  }
  const cvTrend = trendCVs.length > 0
    ? trendCVs.reduce((a, b) => a + b, 0) / trendCVs.length
    : 0

  // CV global (pondéré : vent 40%, vagues 30%, tendance 30%)
  const cvGlobal = cvWind * 0.4 + cvWave * 0.3 + cvTrend * 0.3

  // Convertir en score 0-100 : cv=0 → 100, cv=0.5 → 0 (linéaire, plafonné)
  const score = Math.max(0, Math.min(100, Math.round((1 - cvGlobal / 0.5) * 100)))
  return score
}

export function useMarineConsensus(coords?: Coordinates) {
  return useQuery<ConsensusResult>({
    queryKey: ['marine-consensus', coords?.lat, coords?.lon],
    queryFn: async () => {
      if (!coords) throw new Error('Pas de position')

      // 3 modèles en parallèle — on tolère les échecs individuels
      const results = await Promise.allSettled([
        fetchMarineSnapshot(coords, 'mfwave'),
        fetchMarineSnapshot(coords, 'ecmwf_wam'),
        fetchMarineSnapshot(coords, 'gwam'),
      ])

      const snapshots = results
        .filter((r): r is PromiseFulfilledResult<MarineSnapshot> => r.status === 'fulfilled')
        .map((r) => r.value)

      if (snapshots.length === 0) throw new Error('Tous les modèles ont échoué')

      const windValues = snapshots.map((s) => s.wind_speed)
      const waveValues = snapshots.map((s) => s.wave_height)

      const mean_wind_speed = windValues.reduce((a, b) => a + b, 0) / windValues.length
      const mean_wave_height = waveValues.reduce((a, b) => a + b, 0) / waveValues.length
      const std_wind_speed = stdDev(windValues)
      const std_wave_height = stdDev(waveValues)

      const confidence = computeConfidence(snapshots)

      const confidenceLabel: ConsensusResult['confidenceLabel'] =
        confidence >= 80 ? 'Bon accord'
        : confidence >= 60 ? 'Divergence modérée'
        : 'Forte divergence'

      const confidenceColor =
        confidence >= 80 ? '#4ade80'
        : confidence >= 60 ? '#fbbf24'
        : '#f87171'

      // Tendance 12h
      const nHours = Math.min(...snapshots.map((s) => s.hourly.length), 12)
      const trend = Array.from({ length: nHours }, (_, h) => {
        const ws = snapshots.map((s) => s.hourly[h]?.wind_speed ?? s.wind_speed)
        const wv = snapshots.map((s) => s.hourly[h]?.wave_height ?? s.wave_height)
        return {
          hour: h,
          mean_wind: ws.reduce((a, b) => a + b, 0) / ws.length,
          min_wind: Math.min(...ws),
          max_wind: Math.max(...ws),
          mean_wave: wv.reduce((a, b) => a + b, 0) / wv.length,
          min_wave: Math.min(...wv),
          max_wave: Math.max(...wv),
        }
      })

      return {
        snapshots,
        mean_wind_speed,
        mean_wave_height,
        std_wind_speed,
        std_wave_height,
        confidence,
        confidenceLabel,
        confidenceColor,
        trend,
      }
    },
    enabled: !!coords,
    staleTime: 15 * 60 * 1000, // 15min — les modèles ne changent pas souvent
    retry: 1,
  })
}
