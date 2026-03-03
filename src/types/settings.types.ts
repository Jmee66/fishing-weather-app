export type WeatherSource = 'owm' | 'meteofrance' | 'openmeteo'

export type WeatherModel =
  | 'auto'
  | 'arome'
  | 'arome_hd'
  | 'arpege'
  | 'gfs'
  | 'ecmwf'
  | 'icon'

export type UnitSystem = 'metric' | 'nautical' | 'imperial'

export type MapTileSource = 'osm' | 'shom' | 'satellite' | 'openseamap'

export interface ApiKeys {
  owm: string
  meteofrance: string
  copernicus_user: string
  copernicus_pass: string
  maptiler: string
  shom: string
}

export interface AppSettings {
  weatherSource: WeatherSource
  weatherModel: WeatherModel
  units: UnitSystem
  defaultTileSource: MapTileSource
  activeLayers: string[]
  defaultLocation: { lat: number; lon: number; name: string } | null
  apiKeys: ApiKeys
  language: 'fr' | 'en'
}
