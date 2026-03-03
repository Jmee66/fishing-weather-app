export interface MapViewport {
  lat: number
  lon: number
  zoom: number
}

export interface TileSource {
  id: string
  name: string
  url: string
  attribution: string
  maxZoom: number
  overlay?: boolean
  requiresKey?: string
}

export type MapLayerId =
  | 'fishing_spots'
  | 'seamarkers'
  | 'depth'
  | 'currents'
  | 'wind'
  | 'vigicrues'
  | 'tides'

export interface MapLayer {
  id: MapLayerId
  name: string
  icon: string
  description: string
  enabled: boolean
  category: 'fishing' | 'marine' | 'weather' | 'safety'
}

export interface OfflineTileRegion {
  id: string
  name: string
  bounds: [[number, number], [number, number]]
  minZoom: number
  maxZoom: number
  source: string
  tileCount: number
  downloadedAt: number
  sizeBytes: number
}

export interface GeocodingResult {
  displayName: string
  lat: number
  lon: number
  type: string
  importance: number
}
