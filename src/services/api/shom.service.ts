import axios from 'axios'
import { SHOM_TIDES_URL } from '@/constants/api.constants'
import type { TideData, TideEvent, TidePrediction, SHOMHarbour, Coordinates } from '@/types'
import { haversineDistance } from '@/utils/geo'

// Reference harbours (SHOM port codes)
const SHOM_HARBOURS: SHOMHarbour[] = [
  { code: 'BREST', name: 'Brest', lat: 48.383, lon: -4.495, timezone: 'Europe/Paris' },
  { code: 'CHERBOURG', name: 'Cherbourg', lat: 49.647, lon: -1.621, timezone: 'Europe/Paris' },
  { code: 'SAINT-MALO', name: 'Saint-Malo', lat: 48.644, lon: -2.009, timezone: 'Europe/Paris' },
  { code: 'LE-HAVRE', name: 'Le Havre', lat: 49.491, lon: 0.107, timezone: 'Europe/Paris' },
  { code: 'DUNKERQUE', name: 'Dunkerque', lat: 51.036, lon: 2.367, timezone: 'Europe/Paris' },
  { code: 'CALAIS', name: 'Calais', lat: 50.969, lon: 1.852, timezone: 'Europe/Paris' },
  { code: 'DIEPPE', name: 'Dieppe', lat: 49.924, lon: 1.083, timezone: 'Europe/Paris' },
  { code: 'CAEN', name: 'Caen (Ouistreham)', lat: 49.281, lon: -0.249, timezone: 'Europe/Paris' },
  { code: 'GRANVILLE', name: 'Granville', lat: 48.833, lon: -1.6, timezone: 'Europe/Paris' },
  { code: 'SAINT-NAZAIRE', name: 'Saint-Nazaire', lat: 47.268, lon: -2.197, timezone: 'Europe/Paris' },
  { code: 'LA-ROCHELLE', name: 'La Rochelle', lat: 46.156, lon: -1.151, timezone: 'Europe/Paris' },
  { code: 'ARCACHON', name: 'Arcachon', lat: 44.659, lon: -1.168, timezone: 'Europe/Paris' },
  { code: 'BAYONNE', name: 'Bayonne', lat: 43.494, lon: -1.476, timezone: 'Europe/Paris' },
  { code: 'MARSEILLE', name: 'Marseille', lat: 43.296, lon: 5.381, timezone: 'Europe/Paris' },
  { code: 'TOULON', name: 'Toulon', lat: 43.124, lon: 5.928, timezone: 'Europe/Paris' },
  { code: 'NICE', name: 'Nice', lat: 43.697, lon: 7.266, timezone: 'Europe/Paris' },
  { code: 'LORIENT', name: 'Lorient', lat: 47.749, lon: -3.364, timezone: 'Europe/Paris' },
  { code: 'NANTES', name: 'Nantes', lat: 47.218, lon: -1.553, timezone: 'Europe/Paris' },
]

function findNearestHarbour(coords: Coordinates): SHOMHarbour & { distance: number } {
  let nearest = SHOM_HARBOURS[0]
  let minDist = haversineDistance(coords, { lat: nearest.lat, lon: nearest.lon })

  for (const harbour of SHOM_HARBOURS.slice(1)) {
    const dist = haversineDistance(coords, { lat: harbour.lat, lon: harbour.lon })
    if (dist < minDist) {
      minDist = dist
      nearest = harbour
    }
  }

  return { ...nearest, distance: minDist }
}

// Approximate coefficient (0-120) from PM/BM height range
function estimateCoefficient(pmHeight: number, bmHeight: number): number {
  const range = pmHeight - bmHeight
  // Brest reference: max range ~7.2m = coeff 120, min range ~2.0m = coeff 20
  const coeff = Math.round(((range - 2.0) / (7.2 - 2.0)) * 100 + 20)
  return Math.max(20, Math.min(120, coeff))
}

function buildWPSRequest(harbourCode: string, startDate: Date, days: number): string {
  const end = new Date(startDate)
  end.setDate(end.getDate() + days)
  const fmt = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, 'Z')

  return `<?xml version="1.0" encoding="UTF-8"?>
<wps:Execute xmlns:wps="http://www.opengis.net/wps/1.0.0"
             xmlns:ows="http://www.opengis.net/ows/1.1"
             service="WPS" version="1.0.0" language="fr">
  <ows:Identifier>GetTidalHarmonic</ows:Identifier>
  <wps:DataInputs>
    <wps:Input>
      <ows:Identifier>PORT</ows:Identifier>
      <wps:Data><wps:LiteralData>${harbourCode}</wps:LiteralData></wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>START_DATETIME</ows:Identifier>
      <wps:Data><wps:LiteralData>${fmt(startDate)}</wps:LiteralData></wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>END_DATETIME</ows:Identifier>
      <wps:Data><wps:LiteralData>${fmt(end)}</wps:LiteralData></wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>TEMPORAL_RESOLUTION</ows:Identifier>
      <wps:Data><wps:LiteralData>60</wps:LiteralData></wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>UNIT</ows:Identifier>
      <wps:Data><wps:LiteralData>CM</wps:LiteralData></wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>DATUM</ows:Identifier>
      <wps:Data><wps:LiteralData>LAT</wps:LiteralData></wps:Data>
    </wps:Input>
    <wps:Input>
      <ows:Identifier>GRAPH_ENCODING</ows:Identifier>
      <wps:Data><wps:LiteralData>json</wps:LiteralData></wps:Data>
    </wps:Input>
  </wps:DataInputs>
  <wps:ResponseForm>
    <wps:RawDataOutput>
      <ows:Identifier>DATA</ows:Identifier>
    </wps:RawDataOutput>
  </wps:ResponseForm>
</wps:Execute>`
}

function parseSHOMResponse(
  responseText: string,
  harbourCode: string,
  harbourName: string,
  lat: number,
  lon: number,
  distance: number
): TideData {
  let parsed: { predictions?: { time: string; vh: number }[] }
  try {
    parsed = JSON.parse(responseText)
  } catch {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { predictions: [] }
  }

  const rawPredictions = parsed.predictions ?? []

  const predictions: TidePrediction[] = rawPredictions.map((p) => ({
    dt: Math.floor(new Date(p.time).getTime() / 1000),
    height: p.vh / 100, // cm → m
  }))

  // Detect local extrema as tide events
  const events: TideEvent[] = []
  for (let i = 1; i < predictions.length - 1; i++) {
    const prev = predictions[i - 1].height
    const curr = predictions[i].height
    const next = predictions[i + 1].height

    if (curr > prev && curr > next) {
      events.push({ dt: predictions[i].dt, type: 'PM', height: curr })
    } else if (curr < prev && curr < next) {
      events.push({ dt: predictions[i].dt, type: 'BM', height: curr })
    }
  }

  // Add coefficients to PM events
  for (let i = 0; i < events.length; i++) {
    if (events[i].type === 'PM') {
      const prevBM = events.slice(0, i).reverse().find((e) => e.type === 'BM')
      const nextBM = events.slice(i + 1).find((e) => e.type === 'BM')
      const bmHeight = prevBM?.height ?? nextBM?.height ?? 0
      events[i] = { ...events[i], coefficient: estimateCoefficient(events[i].height, bmHeight) }
    }
  }

  const now = Math.floor(Date.now() / 1000)
  const nearestPred = predictions.reduce((a, b) =>
    Math.abs(a.dt - now) < Math.abs(b.dt - now) ? a : b
  )
  const currentHeight = nearestPred?.height

  const nextEvent = events.find((e) => e.dt > now)
  let currentPhase: TideData['currentPhase']
  if (nextEvent) {
    currentPhase = nextEvent.type === 'PM' ? 'rising' : 'falling'
  }

  const latestPM = events.filter((e) => e.type === 'PM' && e.dt <= now).pop()

  return {
    harbourCode,
    harbourName,
    lat,
    lon,
    distance,
    events,
    predictions,
    currentHeight,
    currentPhase,
    nextEvent,
    coefficient: latestPM?.coefficient,
  }
}

export async function fetchSHOMTides(coords: Coordinates): Promise<TideData> {
  const harbour = findNearestHarbour(coords)
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)

  const requestBody = buildWPSRequest(harbour.code, startDate, 7)

  const { data } = await axios.post(SHOM_TIDES_URL, requestBody, {
    headers: { 'Content-Type': 'application/xml' },
    responseType: 'text',
  })

  return parseSHOMResponse(data, harbour.code, harbour.name, harbour.lat, harbour.lon, harbour.distance)
}

export const shomService = {
  getTides: fetchSHOMTides,
  getNearestHarbour: findNearestHarbour,
  harbours: SHOM_HARBOURS,
}