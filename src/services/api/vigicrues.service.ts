import axios from 'axios'
import {
  VIGICRUES_SITES_URL,
  VIGICRUES_OBS_URL,
} from '@/constants/api.constants'
import type {
  HydrologyData,
  HydrologyStation,
  RiverObservation,
  VigicrueAlert,
} from '@/types'
import type { Coordinates } from '@/types'
import { haversineDistance } from '@/utils/geo'

interface SiteAPIResult {
  code_site: string
  libelle_site: string
  code_commune_site?: string
  libelle_commune?: string
  coordonnee_x: number
  coordonnee_y: number
  altitude_ref_alti?: number
}

interface ObsAPIResult {
  code_site: string
  date_obs: string
  resultat_obs: number
  code_statut: string
  libelle_statut: string
}

interface VigicrueAPIResult {
  ent_vigie?: string
  lbCoursEau?: string
  niv_colors?: string
  etatPrev?: string
}

export async function fetchNearestStations(
  coords: Coordinates
): Promise<HydrologyStation[]> {
  const bbox = `${coords.lon - 0.5},${coords.lat - 0.5},${coords.lon + 0.5},${coords.lat + 0.5}`

  const { data } = await axios.get(VIGICRUES_SITES_URL, {
    params: {
      format: 'json',
      bbox,
      fields: [
        'code_site',
        'libelle_site',
        'code_commune_site',
        'libelle_commune',
        'coordonnee_x',
        'coordonnee_y',
        'altitude_ref_alti',
      ].join(','),
      size: 20,
    },
  })

  const sites: SiteAPIResult[] = data.data ?? []

  return sites
    .map((s) => {
      const stationCoords = { lat: s.coordonnee_y, lon: s.coordonnee_x }
      return {
        code_site: s.code_site,
        libelle_site: s.libelle_site,
        code_commune_site: s.code_commune_site ?? '',
        libelle_commune: s.libelle_commune ?? '',
        coordonnee_x: s.coordonnee_x,
        coordonnee_y: s.coordonnee_y,
        altitude_ref_alti: s.altitude_ref_alti ?? 0,
        distance: haversineDistance(coords, stationCoords),
      }
    })
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    .slice(0, 5)
}

export async function fetchStationObservations(
  codeSite: string,
  hours = 72
): Promise<RiverObservation[]> {
  const since = new Date()
  since.setHours(since.getHours() - hours)

  const { data } = await axios.get(VIGICRUES_OBS_URL, {
    params: {
      code_entite: codeSite,
      grandeur_hydro: 'H', // H = hauteur (height)
      date_debut_obs: since.toISOString(),
      size: 500,
      sort: 'asc',
      fields: 'code_site,date_obs,resultat_obs,code_statut,libelle_statut',
    },
  })

  const obs: ObsAPIResult[] = data.data ?? []
  return obs.map((o) => ({
    code_site: o.code_site,
    date_obs: o.date_obs,
    resultat_obs: o.resultat_obs / 1000, // mm → m
    code_statut: o.code_statut,
    libelle_statut: o.libelle_statut,
  }))
}

async function fetchVigicrueAlert(codeSite: string): Promise<VigicrueAlert | undefined> {
  try {
    const { data } = await axios.get(
      `https://www.vigicrues.gouv.fr/services/station.json/${codeSite}/`,
      { timeout: 5000 }
    )

    const info: VigicrueAPIResult = data?.Obs?.[0] ?? {}
    if (!info.niv_colors) return undefined

    const colorMap: Record<string, { id: 1 | 2 | 3 | 4; label: string }> = {
      '1': { id: 1, label: 'Vert' },
      '2': { id: 2, label: 'Jaune' },
      '3': { id: 3, label: 'Orange' },
      '4': { id: 4, label: 'Rouge' },
    }

    const colorInfo = colorMap[info.niv_colors]
    if (!colorInfo) return undefined

    return {
      territory_code: codeSite,
      territory_label: info.lbCoursEau ?? codeSite,
      color_id: colorInfo.id,
      color_label: colorInfo.label,
      short_label: colorInfo.label,
      qualification: info.etatPrev ?? '',
    }
  } catch {
    return undefined
  }
}

function computeTrend(observations: RiverObservation[]): 'rising' | 'stable' | 'falling' {
  if (observations.length < 3) return 'stable'

  const recent = observations.slice(-6)
  const first = recent[0].resultat_obs
  const last = recent[recent.length - 1].resultat_obs
  const diff = last - first

  if (diff > 0.05) return 'rising'
  if (diff < -0.05) return 'falling'
  return 'stable'
}

export async function fetchHydrologyData(
  coords: Coordinates
): Promise<HydrologyData[]> {
  const stations = await fetchNearestStations(coords)
  if (stations.length === 0) return []

  const results: HydrologyData[] = await Promise.all(
    stations.slice(0, 3).map(async (station) => {
      const [observations, vigilance] = await Promise.all([
        fetchStationObservations(station.code_site, 72).catch(() => [] as RiverObservation[]),
        fetchVigicrueAlert(station.code_site),
      ])

      const currentHeight =
        observations.length > 0
          ? observations[observations.length - 1].resultat_obs
          : undefined

      const trend = computeTrend(observations)

      return {
        station,
        currentHeight,
        observations,
        trend,
        vigilance,
      }
    })
  )

  return results
}

export const vigicruesService = {
  getNearestStations: fetchNearestStations,
  getObservations: fetchStationObservations,
  getHydrologyData: fetchHydrologyData,
}