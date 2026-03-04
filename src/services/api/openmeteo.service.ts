import axios from 'axios'
import { OPENMETEO_BASE_URL, OPENMETEO_MARINE_URL } from '@/constants/api.constants'
import type { WeatherData, MarineForecast, Coordinates } from '@/types'

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'Ciel dégagé', 1: 'Principalement dégagé', 2: 'Partiellement nuageux', 3: 'Couvert',
  45: 'Brouillard', 48: 'Brouillard givrant',
  51: 'Bruine légère', 53: 'Bruine modérée', 55: 'Bruine forte',
  61: 'Pluie légère', 63: 'Pluie modérée', 65: 'Pluie forte',
  71: 'Neige légère', 73: 'Neige modérée', 75: 'Neige forte',
  77: 'Grains de neige',
  80: 'Averses légères', 81: 'Averses modérées', 82: 'Averses violentes',
  85: 'Averses de neige légères', 86: 'Averses de neige fortes',
  95: 'Orage', 96: 'Orage avec grêle légère', 99: 'Orage avec grêle forte',
}

export async function fetchOpenMeteoWeather(
  coords: Coordinates,
  model = 'auto'
): Promise<WeatherData> {
  const { data } = await axios.get(`${OPENMETEO_BASE_URL}/forecast`, {
    params: {
      latitude: coords.lat,
      longitude: coords.lon,
      ...(model !== 'auto' ? { models: model } : {}),
      current: [
        'temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'is_day',
        'precipitation', 'weather_code', 'cloud_cover', 'pressure_msl', 'surface_pressure',
        'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m', 'uv_index', 'visibility',
      ].join(','),
      hourly: [
        'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
        'precipitation_probability', 'weather_code', 'pressure_msl',
        'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
      ].join(','),
      daily: [
        'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        'precipitation_sum', 'wind_speed_10m_max', 'wind_gusts_10m_max',
        'wind_direction_10m_dominant', 'uv_index_max', 'sunrise', 'sunset',
        'moonrise', 'moonset', 'moon_phase',
      ].join(','),
      timezone: 'auto',
      forecast_days: 7,
    },
  })

  const c = data.current
  const wmoCode = c.weather_code ?? 0
  const description = WMO_DESCRIPTIONS[wmoCode] ?? 'Inconnu'

  const current = {
    dt: Math.floor(new Date(c.time).getTime() / 1000),
    sunrise: Math.floor(new Date(data.daily.sunrise[0]).getTime() / 1000),
    sunset: Math.floor(new Date(data.daily.sunset[0]).getTime() / 1000),
    temp: c.temperature_2m,
    feels_like: c.apparent_temperature,
    pressure: c.pressure_msl,
    humidity: c.relative_humidity_2m,
    dew_point: c.temperature_2m - (100 - c.relative_humidity_2m) / 5,
    uvi: c.uv_index ?? 0,
    clouds: c.cloud_cover,
    visibility: c.visibility ?? 10000,
    wind_speed: c.wind_speed_10m / 3.6, // km/h → m/s
    wind_deg: c.wind_direction_10m,
    wind_gust: c.wind_gusts_10m / 3.6,
    weather: [{ id: wmoCode, main: description, description, icon: '' }],
    source: 'openmeteo',
    model,
  }

  const hourly = (data.hourly.time as string[]).map((t: string, i: number) => ({
    dt: Math.floor(new Date(t).getTime() / 1000),
    temp: data.hourly.temperature_2m[i],
    feels_like: data.hourly.apparent_temperature[i],
    pressure: data.hourly.pressure_msl[i],
    humidity: data.hourly.relative_humidity_2m[i],
    wind_speed: data.hourly.wind_speed_10m[i] / 3.6,
    wind_deg: data.hourly.wind_direction_10m[i],
    wind_gust: data.hourly.wind_gusts_10m[i] / 3.6,
    weather: [{ id: data.hourly.weather_code[i], main: '', description: WMO_DESCRIPTIONS[data.hourly.weather_code[i]] ?? '', icon: '' }],
    pop: (data.hourly.precipitation_probability[i] ?? 0) / 100,
  }))

  const daily = (data.daily.time as string[]).map((t: string, i: number) => ({
    dt: Math.floor(new Date(t).getTime() / 1000),
    sunrise: Math.floor(new Date(data.daily.sunrise[i]).getTime() / 1000),
    sunset: Math.floor(new Date(data.daily.sunset[i]).getTime() / 1000),
    moonrise: Math.floor(new Date(data.daily.moonrise[i] ?? t).getTime() / 1000),
    moonset: Math.floor(new Date(data.daily.moonset[i] ?? t).getTime() / 1000),
    moon_phase: data.daily.moon_phase[i] ?? 0,
    temp: {
      day: (data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2,
      min: data.daily.temperature_2m_min[i],
      max: data.daily.temperature_2m_max[i],
      night: data.daily.temperature_2m_min[i],
      eve: data.daily.temperature_2m_max[i],
      morn: data.daily.temperature_2m_min[i],
    },
    feels_like: { day: 0, night: 0, eve: 0, morn: 0 },
    pressure: 1013,
    humidity: 70,
    wind_speed: data.daily.wind_speed_10m_max[i] / 3.6,
    wind_deg: data.daily.wind_direction_10m_dominant[i],
    wind_gust: data.daily.wind_gusts_10m_max[i] / 3.6,
    weather: [{ id: data.daily.weather_code[i], main: '', description: WMO_DESCRIPTIONS[data.daily.weather_code[i]] ?? '', icon: '' }],
    clouds: 50,
    pop: 0,
    rain: data.daily.precipitation_sum[i],
    uvi: data.daily.uv_index_max[i] ?? 0,
  }))

  return {
    lat: data.latitude,
    lon: data.longitude,
    timezone: data.timezone,
    timezone_offset: 0,
    current,
    hourly,
    daily,
  }
}

// ── Indice de fiabilité statique par modèle ──────────────────────────────────
// stars: 1-5 (qualité générale), coastal: 1-5 (précision zone côtière)
// resolution: résolution spatiale en km, updateHz: fréquence de mise à jour en heures
export const MARINE_MODELS = [
  {
    id: 'auto',
    name: 'Auto',
    desc: 'Meilleur modèle disponible selon la position',
    stars: 4,
    coastal: 4,
    resolution: 9,
    updateHz: 6,
    note: 'Sélection automatique ECMWF/MF selon la zone',
  },
  {
    id: 'mfwave',
    name: 'MF Wave',
    desc: 'Météo-France — spécialisé Atlantique/Méditerranée',
    stars: 5,
    coastal: 5,
    resolution: 8,
    updateHz: 12,
    note: 'Référence pour les côtes françaises et la Méditerranée',
  },
  {
    id: 'mfcurrents',
    name: 'MF Courants',
    desc: 'Météo-France — courants marins',
    stars: 4,
    coastal: 4,
    resolution: 8,
    updateHz: 12,
    note: 'Optimisé courants, moins précis pour vagues',
  },
  {
    id: 'era5_ocean',
    name: 'ERA5 Ocean',
    desc: 'ECMWF — réanalyse historique 1940-présent',
    stars: 3,
    coastal: 3,
    resolution: 50,
    updateHz: 24,
    note: 'Réanalyse historique, moins adapté aux prévisions',
  },
  {
    id: 'ecmwf_wam',
    name: 'ECMWF WAM',
    desc: 'ECMWF — modèle vagues global de référence',
    stars: 5,
    coastal: 4,
    resolution: 9,
    updateHz: 6,
    note: 'Standard mondial, excellent open sea, bon côtier',
  },
  {
    id: 'gwam',
    name: 'GFS WAVEWATCH',
    desc: 'NOAA — WAVEWATCH III global',
    stars: 3,
    coastal: 3,
    resolution: 25,
    updateHz: 6,
    note: 'Bon global, résolution moins fine en zone côtière',
  },
] as const

export type MarineModelId = typeof MARINE_MODELS[number]['id']

// ── Fetch marine (modèle unique) ─────────────────────────────────────────────
export async function fetchOpenMeteoMarine(
  coords: Coordinates,
  marineModel: MarineModelId = 'auto'
): Promise<MarineForecast> {
  const { data } = await axios.get(`${OPENMETEO_MARINE_URL}/marine`, {
    params: {
      latitude: coords.lat,
      longitude: coords.lon,
      ...(marineModel !== 'auto' ? { models: marineModel } : {}),
      hourly: [
        'wave_height', 'wave_direction', 'wave_period',
        'swell_wave_height', 'swell_wave_direction', 'swell_wave_period',
        'wind_wave_height', 'wind_wave_direction', 'wind_wave_period',
        'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
      ].join(','),
      timezone: 'auto',
      forecast_days: 7,
    },
  })

  const hourly = (data.hourly.time as string[]).map((t: string, i: number) => ({
    dt: Math.floor(new Date(t).getTime() / 1000),
    wave_height: data.hourly.wave_height[i] ?? 0,
    wave_direction: data.hourly.wave_direction[i] ?? 0,
    wave_period: data.hourly.wave_period[i] ?? 0,
    swell_wave_height: data.hourly.swell_wave_height?.[i],
    swell_wave_direction: data.hourly.swell_wave_direction?.[i],
    swell_wave_period: data.hourly.swell_wave_period?.[i],
    wind_wave_height: data.hourly.wind_wave_height?.[i],
    wind_wave_direction: data.hourly.wind_wave_direction?.[i],
    wind_wave_period: data.hourly.wind_wave_period?.[i],
    wind_speed_10m: (data.hourly.wind_speed_10m?.[i] ?? 0) / 3.6,
    wind_direction_10m: data.hourly.wind_direction_10m?.[i] ?? 0,
    wind_gusts_10m: (data.hourly.wind_gusts_10m?.[i] ?? 0) / 3.6,
  }))

  return { lat: data.latitude, lon: data.longitude, hourly }
}

// ── Fetch marine simplifié pour le consensus (seulement vent + vagues H0-H12) ──
export interface MarineSnapshot {
  model: MarineModelId
  wind_speed: number    // m/s
  wind_dir: number      // degrés
  wave_height: number   // mètres
  // prochaines 12h, toutes les heures
  hourly: Array<{ wind_speed: number; wave_height: number }>
}

export async function fetchMarineSnapshot(
  coords: Coordinates,
  marineModel: Exclude<MarineModelId, 'auto' | 'era5_ocean'>
): Promise<MarineSnapshot> {
  const { data } = await axios.get(`${OPENMETEO_MARINE_URL}/marine`, {
    params: {
      latitude: coords.lat,
      longitude: coords.lon,
      models: marineModel,
      hourly: ['wave_height', 'wind_speed_10m', 'wind_direction_10m'].join(','),
      timezone: 'auto',
      forecast_days: 2,
    },
  })

  const times = data.hourly.time as string[]
  const hourly = times.slice(0, 12).map((_, i) => ({
    wind_speed: (data.hourly.wind_speed_10m?.[i] ?? 0) / 3.6,
    wave_height: data.hourly.wave_height?.[i] ?? 0,
  }))

  return {
    model: marineModel,
    wind_speed: (data.hourly.wind_speed_10m?.[0] ?? 0) / 3.6,
    wind_dir: data.hourly.wind_direction_10m?.[0] ?? 0,
    wave_height: data.hourly.wave_height?.[0] ?? 0,
    hourly,
  }
}

// ── Grille de vent pour leaflet-velocity ────────────────────────────────────
// Format attendu par leaflet-velocity (grib2json-like) :
// [{ header: {nx, ny, lo1, la1, lo2, la2, dx, dy, ...}, data: float[] }, // U
//  { header: {...}, data: float[] }]  // V
export interface WindGridData {
  header: {
    parameterCategory: number
    parameterNumber: number
    lo1: number   // lon ouest (deg)
    la1: number   // lat nord (deg)
    lo2: number   // lon est
    la2: number   // lat sud
    dx: number    // pas lon
    dy: number    // pas lat
    nx: number    // nb points lon
    ny: number    // nb points lat
  }
  data: number[]
}

/**
 * Fetch une grille NxN de vent autour de coords et retourne le format leaflet-velocity.
 * On utilise l'API multi-points d'Open-Meteo (lat/lon séparés par virgules).
 */
export async function fetchMarineWindGrid(
  coords: Coordinates,
  gridSize = 5,   // 5×5 = 25 points
  span = 1.0      // ±0.5° autour du centre (span total = 1°)
): Promise<[WindGridData, WindGridData]> {
  const step = span / (gridSize - 1)
  const half = span / 2

  // Générer les lat/lon de la grille
  const lats: number[] = []
  const lons: number[] = []
  for (let r = 0; r < gridSize; r++) {
    lats.push(Number((coords.lat + half - r * step).toFixed(4)))
  }
  for (let c = 0; c < gridSize; c++) {
    lons.push(Number((coords.lon - half + c * step).toFixed(4)))
  }

  // Toutes les combinaisons (gridSize² points)
  const allLats: number[] = []
  const allLons: number[] = []
  for (const la of lats) {
    for (const lo of lons) {
      allLats.push(la)
      allLons.push(lo)
    }
  }

  const { data } = await axios.get(`${OPENMETEO_BASE_URL}/forecast`, {
    params: {
      latitude: allLats.join(','),
      longitude: allLons.join(','),
      hourly: ['wind_speed_10m', 'wind_direction_10m'].join(','),
      timezone: 'auto',
      forecast_days: 1,
    },
  })

  // Extraire H+0 pour chaque point (les réponses multi-points sont dans un tableau)
  const responses: Array<{ hourly: { wind_speed_10m: number[]; wind_direction_10m: number[] } }> =
    Array.isArray(data) ? data : [data]

  const uData: number[] = []
  const vData: number[] = []

  for (const resp of responses) {
    const speed = (resp.hourly.wind_speed_10m?.[0] ?? 0) / 3.6 // km/h → m/s
    const dir   = resp.hourly.wind_direction_10m?.[0] ?? 0     // degrés
    const dirRad = (dir * Math.PI) / 180
    // Convention météo : dir = d'où vient le vent → vecteur de déplacement = opposé
    uData.push(-speed * Math.sin(dirRad))  // composante U (est+)
    vData.push(-speed * Math.cos(dirRad))  // composante V (nord+)
  }

  const header: WindGridData['header'] = {
    parameterCategory: 2,
    parameterNumber: 2,   // 2 = U, 3 = V (convention GRIB2)
    lo1: lons[0],
    la1: lats[0],
    lo2: lons[lons.length - 1],
    la2: lats[lats.length - 1],
    dx: step,
    dy: step,
    nx: gridSize,
    ny: gridSize,
  }

  return [
    { header: { ...header, parameterNumber: 2 }, data: uData },
    { header: { ...header, parameterNumber: 3 }, data: vData },
  ]
}

export const openMeteoService = {
  getWeather: fetchOpenMeteoWeather,
  getMarineForecast: fetchOpenMeteoMarine,
  getMarineSnapshot: fetchMarineSnapshot,
  getWindGrid: fetchMarineWindGrid,
}
