export type TideType = 'BM' | 'PM'
export type TidePhase = 'rising' | 'high' | 'falling' | 'low'

export interface TideEvent {
  dt: number
  type: TideType
  height: number
  coefficient?: number
}

export interface TidePrediction {
  dt: number
  height: number
}

export interface TideData {
  harbourCode: string
  harbourName: string
  lat: number
  lon: number
  distance: number
  events: TideEvent[]
  predictions: TidePrediction[]
  currentHeight?: number
  currentPhase?: TidePhase
  nextEvent?: TideEvent
  coefficient?: number
}

export interface SHOMHarbour {
  code: string
  name: string
  lat: number
  lon: number
  timezone: string
}
