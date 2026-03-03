import { useSettingsStore } from '@/stores/settings.store'
import type { WeatherData, MarineForecast, Coordinates } from '@/types'
import { fetchOpenMeteoWeather, fetchOpenMeteoMarine } from './openmeteo.service'
import { fetchOWMWeather } from './openweathermap.service'

export interface IWeatherService {
  getWeather(coords: Coordinates): Promise<WeatherData>
}

export interface IMarineService {
  getMarineForecast(coords: Coordinates): Promise<MarineForecast>
}

class OpenMeteoService implements IWeatherService, IMarineService {
  async getWeather(coords: Coordinates): Promise<WeatherData> {
    const model = useSettingsStore.getState().weatherModel
    return fetchOpenMeteoWeather(coords, model)
  }

  async getMarineForecast(coords: Coordinates): Promise<MarineForecast> {
    return fetchOpenMeteoMarine(coords)
  }
}

class OWMService implements IWeatherService {
  async getWeather(coords: Coordinates): Promise<WeatherData> {
    return fetchOWMWeather(coords)
  }
}

let _openMeteoInstance: OpenMeteoService | null = null
let _owmInstance: OWMService | null = null

export function getWeatherService(): IWeatherService {
  const source = useSettingsStore.getState().weatherSource

  if (source === 'owm') {
    _owmInstance ??= new OWMService()
    return _owmInstance
  }

  _openMeteoInstance ??= new OpenMeteoService()
  return _openMeteoInstance
}

export function getMarineService(): IMarineService {
  _openMeteoInstance ??= new OpenMeteoService()
  return _openMeteoInstance
}

// Re-export all individual services for direct use
export { fetchOpenMeteoWeather, fetchOpenMeteoMarine } from './openmeteo.service'
export { fetchOWMWeather } from './openweathermap.service'
export { fetchSHOMTides, shomService } from './shom.service'
export { fetchHydrologyData, vigicruesService } from './vigicrues.service'
export { searchLocations, reverseGeocode, geocodingService } from './geocoding.service'