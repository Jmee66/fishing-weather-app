import axios from 'axios'
import type { TideData, TideEvent, TidePrediction, SHOMHarbour, Coordinates } from '@/types'
import { haversineDistance } from '@/utils/geo'

// Ports de référence (affichage uniquement — calcul via open-meteo marine)
const SHOM_HARBOURS: SHOMHarbour[] = [
  { code: 'BREST',         name: 'Brest',                lat: 48.383, lon: -4.495,  timezone: 'Europe/Paris' },
  { code: 'CHERBOURG',     name: 'Cherbourg',             lat: 49.647, lon: -1.621,  timezone: 'Europe/Paris' },
  { code: 'SAINT-MALO',    name: 'Saint-Malo',            lat: 48.644, lon: -2.009,  timezone: 'Europe/Paris' },
  { code: 'LE-HAVRE',      name: 'Le Havre',              lat: 49.491, lon:  0.107,  timezone: 'Europe/Paris' },
  { code: 'DUNKERQUE',     name: 'Dunkerque',             lat: 51.036, lon:  2.367,  timezone: 'Europe/Paris' },
  { code: 'CALAIS',        name: 'Calais',                lat: 50.969, lon:  1.852,  timezone: 'Europe/Paris' },
  { code: 'DIEPPE',        name: 'Dieppe',                lat: 49.924, lon:  1.083,  timezone: 'Europe/Paris' },
  { code: 'CAEN',          name: 'Caen (Ouistreham)',     lat: 49.281, lon: -0.249,  timezone: 'Europe/Paris' },
  { code: 'GRANVILLE',     name: 'Granville',             lat: 48.833, lon: -1.600,  timezone: 'Europe/Paris' },
  { code: 'SAINT-NAZAIRE', name: 'Saint-Nazaire',         lat: 47.268, lon: -2.197,  timezone: 'Europe/Paris' },
  { code: 'LA-ROCHELLE',   name: 'La Rochelle',           lat: 46.156, lon: -1.151,  timezone: 'Europe/Paris' },
  { code: 'ARCACHON',      name: 'Arcachon',              lat: 44.659, lon: -1.168,  timezone: 'Europe/Paris' },
  { code: 'BAYONNE',       name: 'Bayonne',               lat: 43.494, lon: -1.476,  timezone: 'Europe/Paris' },
  { code: 'MARSEILLE',     name: 'Marseille',             lat: 43.296, lon:  5.381,  timezone: 'Europe/Paris' },
  { code: 'TOULON',        name: 'Toulon',                lat: 43.124, lon:  5.928,  timezone: 'Europe/Paris' },
  { code: 'NICE',          name: 'Nice',                  lat: 43.697, lon:  7.266,  timezone: 'Europe/Paris' },
  { code: 'LORIENT',       name: 'Lorient',               lat: 47.749, lon: -3.364,  timezone: 'Europe/Paris' },
  { code: 'NANTES',        name: 'Nantes',                lat: 47.218, lon: -1.553,  timezone: 'Europe/Paris' },
]

function findNearestHarbour(coords: Coordinates): SHOMHarbour & { distance: number } {
  let nearest = SHOM_HARBOURS[0]
  let minDist = haversineDistance(coords, { lat: nearest.lat, lon: nearest.lon })
  for (const harbour of SHOM_HARBOURS.slice(1)) {
    const dist = haversineDistance(coords, { lat: harbour.lat, lon: harbour.lon })
    if (dist < minDist) { minDist = dist; nearest = harbour }
  }
  return { ...nearest, distance: minDist }
}

// Coefficient approximatif depuis l'amplitude PM/BM (référence Brest)
function estimateCoefficient(pmHeight: number, bmHeight: number): number {
  const range = pmHeight - bmHeight
  const coeff = Math.round(((range - 2.0) / (7.2 - 2.0)) * 100 + 20)
  return Math.max(20, Math.min(120, coeff))
}

// Détecte les PM/BM depuis un tableau de prédictions horaires
function detectEvents(predictions: TidePrediction[]): TideEvent[] {
  // Lissage simple sur 3 points pour réduire le bruit
  const smoothed = predictions.map((p, i) => {
    const prev = predictions[Math.max(0, i - 1)].height
    const next = predictions[Math.min(predictions.length - 1, i + 1)].height
    return { dt: p.dt, height: (prev + p.height + next) / 3 }
  })

  const raw: TideEvent[] = []
  for (let i = 1; i < smoothed.length - 1; i++) {
    const prev = smoothed[i - 1].height
    const curr = smoothed[i].height
    const next = smoothed[i + 1].height
    if (curr > prev && curr > next) raw.push({ dt: smoothed[i].dt, type: 'PM', height: curr })
    else if (curr < prev && curr < next) raw.push({ dt: smoothed[i].dt, type: 'BM', height: curr })
  }

  // Filtrer les faux extrema trop proches (< 3h d'écart)
  const filtered: TideEvent[] = []
  for (const ev of raw) {
    const last = filtered[filtered.length - 1]
    if (!last || ev.dt - last.dt > 3 * 3600) {
      filtered.push(ev)
    } else if (
      (ev.type === 'PM' && ev.height > last.height) ||
      (ev.type === 'BM' && ev.height < last.height)
    ) {
      filtered[filtered.length - 1] = ev
    }
  }

  // Ajouter les coefficients aux PM
  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i].type === 'PM') {
      const prevBM = filtered.slice(0, i).reverse().find((e) => e.type === 'BM')
      const nextBM = filtered.slice(i + 1).find((e) => e.type === 'BM')
      const bmHeight = prevBM?.height ?? nextBM?.height ?? 0
      filtered[i] = { ...filtered[i], coefficient: estimateCoefficient(filtered[i].height, bmHeight) }
    }
  }

  return filtered
}

// ── Fetch via open-meteo marine (gratuit, sans clé, CORS OK) ─────────────────
export async function fetchSHOMTides(coords: Coordinates): Promise<TideData> {
  const harbour = findNearestHarbour(coords)

  const url = new URL('https://marine-api.open-meteo.com/v1/marine')
  url.searchParams.set('latitude',      String(coords.lat))
  url.searchParams.set('longitude',     String(coords.lon))
  url.searchParams.set('hourly',        'sea_level_height_msl')
  url.searchParams.set('forecast_days', '7')
  url.searchParams.set('timezone',      'Europe/Paris')

  const { data } = await axios.get(url.toString())

  const times: string[] = data?.hourly?.time ?? []
  const wls:   number[] = data?.hourly?.sea_level_height_msl ?? []

  if (times.length === 0 || wls.length === 0) {
    throw new Error('Aucune donnée de marée disponible')
  }

  const predictions: TidePrediction[] = times
    .map((t, i) => ({
      dt:     Math.floor(new Date(t).getTime() / 1000),
      height: wls[i] as number | null,
    }))
    .filter((p): p is TidePrediction => p.height != null && Number.isFinite(p.height as number))

  const events = detectEvents(predictions)

  const now = Math.floor(Date.now() / 1000)
  const nearestPred = predictions.reduce((a, b) =>
    Math.abs(a.dt - now) < Math.abs(b.dt - now) ? a : b
  )
  const currentHeight = nearestPred?.height

  const nextEvent = events.find((e) => e.dt > now)
  let currentPhase: TideData['currentPhase']
  if (nextEvent) currentPhase = nextEvent.type === 'PM' ? 'rising' : 'falling'

  const latestPM = events.filter((e) => e.type === 'PM' && e.dt <= now).pop()

  return {
    harbourCode:  harbour.code,
    harbourName:  harbour.name,
    lat:          harbour.lat,
    lon:          harbour.lon,
    distance:     harbour.distance,
    events,
    predictions,
    currentHeight,
    currentPhase,
    nextEvent,
    coefficient: latestPM?.coefficient,
  }
}

export const shomService = {
  getTides:          fetchSHOMTides,
  getNearestHarbour: findNearestHarbour,
  harbours:          SHOM_HARBOURS,
}
