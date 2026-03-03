export type FishingCategory =
  | 'coastal'
  | 'boat'
  | 'freshwater_lake'
  | 'freshwater_river'
  | 'reservoir'

export type FishingTechnique =
  | 'surfcasting'
  | 'spinning'
  | 'fly'
  | 'bottom'
  | 'trolling'
  | 'jigging'
  | 'bait'
  | 'feeder'
  | 'match'
  | 'carpfishing'
  | 'other'

export interface FishingSpot {
  id: string
  name: string
  category: FishingCategory
  coordinates: { lat: number; lon: number }
  description: string
  techniques: FishingTechnique[]
  species: string[]
  harbourCode?: string
  hydrologyStationCode?: string
  createdAt: number
  updatedAt: number
  photos?: string[]
  notes?: string
  rating?: 1 | 2 | 3 | 4 | 5
}

export interface CatchRecord {
  species: string
  count: number
  totalWeight?: number
  biggestLength?: number
  released: boolean
  notes?: string
}

export interface FishingConditions {
  weatherSummary: string
  windSpeed: number
  windDirection: number
  windGust?: number
  temperature: number
  pressure: number
  pressureTrend?: 'rising' | 'stable' | 'falling'
  tidePhase?: 'rising' | 'high' | 'falling' | 'low'
  tideCoefficient?: number
  lunarPhase: string
  lunarIllumination: number
  fishActivityIndex: number
  riverHeight?: number
  riverFlow?: number
  waveHeight?: number
  seaState?: number
}

export interface FishingLogEntry {
  id: string
  spotId: string
  spotName: string
  date: number
  duration: number
  catches: CatchRecord[]
  conditions: FishingConditions
  notes: string
  rating: 1 | 2 | 3 | 4 | 5
  photos?: string[]
  techniques: FishingTechnique[]
}

export interface SpeciesRegulation {
  id: string
  name: string
  scientificName: string
  minSize: { [zone: string]: number }
  quotaPerDay: { recreational: number | null }
  closedSeasons?: Array<{ region: string; start: string; end: string }>
  category: FishingCategory[]
  icon?: string
  notes?: string
}

export interface FishActivityScore {
  total: number
  factors: {
    pressure: number
    lunar: number
    tides: number
    wind: number
    season: number
    ephemeris: number
  }
  label: 'excellent' | 'good' | 'average' | 'poor' | 'bad'
  recommendation: string
}
