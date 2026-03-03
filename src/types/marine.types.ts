export type DouglasScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface WaveData {
  dt: number
  wave_height: number
  wave_direction: number
  wave_period: number
  swell_wave_height?: number
  swell_wave_direction?: number
  swell_wave_period?: number
  wind_wave_height?: number
  wind_wave_direction?: number
  wind_wave_period?: number
  sea_surface_temperature?: number
}

export interface MarineWindData {
  dt: number
  wind_speed_10m: number
  wind_direction_10m: number
  wind_gusts_10m: number
  wind_speed_80m?: number
  wind_direction_80m?: number
}

export interface MarineForecast {
  lat: number
  lon: number
  hourly: (WaveData & MarineWindData)[]
}

export interface SeaState {
  beaufort: number
  beaufortLabel: string
  douglas: DouglasScale
  douglasLabel: string
  description: string
}

export interface CoastalBulletin {
  zone: string
  zoneName: string
  issuedAt: number
  validFrom: number
  validTo: number
  text: string
  wind: string
  sea: string
  swell: string
  weather: string
  visibility: string
  source: 'meteofrance'
}

export interface MarineZone {
  id: string
  name: string
  region: 'manche' | 'atlantique' | 'mediterranee' | 'nord_mer'
  coords: [number, number][]
}
