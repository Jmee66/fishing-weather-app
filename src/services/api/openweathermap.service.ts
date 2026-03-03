import axios from 'axios'
import { OWM_BASE_URL } from '@/constants/api.constants'
import { useSettingsStore } from '@/stores/settings.store'
import type { WeatherData, Coordinates } from '@/types'

export async function fetchOWMWeather(coords: Coordinates): Promise<WeatherData> {
  const apiKey = useSettingsStore.getState().apiKeys.owm
  if (!apiKey) throw new Error('Clé API OpenWeatherMap manquante. Renseignez-la dans les Paramètres.')

  const { data } = await axios.get(`${OWM_BASE_URL}/onecall`, {
    params: {
      lat: coords.lat,
      lon: coords.lon,
      appid: apiKey,
      units: 'metric',
      lang: 'fr',
      exclude: 'minutely',
    },
  })

  return data as WeatherData
}

export const openWeatherMapService = {
  getWeather: fetchOWMWeather,
}
