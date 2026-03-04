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

async function fetchStationFlow(
  codeSite: string,
): Promise<number | undefined> {
  try {
    const since = new Date()
    since.setHours(since.getHours() - 6) // only need recent obs to get current flow

    const { data } = await axios.get(VIGICRUES_OBS_URL, {
      params: {
        code_entite: codeSite,
        grandeur_hydro: 'Q', // Q = débit (flow)
        date_debut_obs: since.toISOString(),
        size: 20,
        sort: 'desc', // most recent first
        fields: 'code_site,date_obs,resultat_obs,code_statut,libelle_statut',
      },
      timeout: 5000,
    })

    const obs: ObsAPIResult[] = data.data ?? []
    if (obs.length === 0) return undefined

    // resultat_obs for Q is in L/s → convert to m³/s
    return obs[0].resultat_obs / 1000
  } catch {
    return undefined
  }
}

/** GeoJSON feature properties from InfoVigiCru.geojson */
interface InfoVigiCruFeature {
  NivInfViCr?: number   // 1=Vert, 2=Jaune, 3=Orange, 4=Rouge
  lbentcru?: string
  acroentcru?: string
  geometry?: { coordinates: number[][] | number[][][] }
}

const VIGINIV_MAP: Record<number, { id: 1 | 2 | 3 | 4; label: string }> = {
  1: { id: 1, label: 'Vert' },
  2: { id: 2, label: 'Jaune' },
  3: { id: 3, label: 'Orange' },
  4: { id: 4, label: 'Rouge' },
}

// Simple cache: GeoJSON loaded once per session (341 tronçons, ~100 KB)
let vigilanceCachePromise: Promise<InfoVigiCruFeature[]> | null = null

function loadVigilanceGeoJSON(): Promise<InfoVigiCruFeature[]> {
  if (!vigilanceCachePromise) {
    vigilanceCachePromise = axios
      .get<{ features: { properties: InfoVigiCruFeature; geometry: { type: string; coordinates: number[][][] } }[] }>(
        'https://www.vigicrues.gouv.fr/services/1/InfoVigiCru.geojson',
        { timeout: 8000 }
      )
      .then(({ data }) =>
        data.features.map((f) => ({
          ...f.properties,
          geometry: f.geometry,
        }))
      )
      .catch(() => [])
  }
  return vigilanceCachePromise
}

async function fetchVigicrueAlert(
  _codeSite: string,
  stationLat?: number,
  stationLon?: number,
): Promise<VigicrueAlert | undefined> {
  try {
    const features = await loadVigilanceGeoJSON()
    if (features.length === 0 || stationLat == null || stationLon == null) return undefined

    // Find the tronçon whose first coordinate is closest to the station
    let bestDist = Infinity
    let bestFeature: InfoVigiCruFeature | null = null

    for (const feat of features) {
      const coords = (feat.geometry as any)?.coordinates
      if (!coords) continue
      // MultiLineString: coords is number[][][]
      const firstPt: number[] | undefined =
        Array.isArray(coords[0]) && Array.isArray(coords[0][0])
          ? (coords as number[][][])[0][0]
          : Array.isArray(coords[0])
            ? (coords as number[][])[0]
            : undefined
      if (!firstPt) continue
      const dLat = firstPt[1] - stationLat
      const dLon = firstPt[0] - stationLon
      const dist = dLat * dLat + dLon * dLon
      if (dist < bestDist) { bestDist = dist; bestFeature = feat }
    }

    if (!bestFeature) return undefined
    const niv = bestFeature.NivInfViCr ?? 1
    const colorInfo = VIGINIV_MAP[niv] ?? VIGINIV_MAP[1]

    return {
      territory_code: bestFeature.acroentcru ?? _codeSite,
      territory_label: bestFeature.lbentcru ?? _codeSite,
      color_id: colorInfo.id,
      color_label: colorInfo.label,
      short_label: colorInfo.label,
      qualification: '',
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
      const [observations, vigilance, currentFlow] = await Promise.all([
        fetchStationObservations(station.code_site, 72).catch(() => [] as RiverObservation[]),
        fetchVigicrueAlert(station.code_site, station.coordonnee_y, station.coordonnee_x),
        fetchStationFlow(station.code_site),
      ])

      const currentHeight =
        observations.length > 0
          ? observations[observations.length - 1].resultat_obs
          : undefined

      const trend = computeTrend(observations)

      return {
        station,
        currentHeight,
        currentFlow,
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