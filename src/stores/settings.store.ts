import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { WeatherSource, WeatherModel, UnitSystem, MapTileSource, ApiKeys, MapLayerId } from '@/types'

interface SettingsState {
  weatherSource: WeatherSource
  weatherModel: WeatherModel
  units: UnitSystem
  defaultTileSource: MapTileSource
  activeLayers: MapLayerId[]
  defaultLocation: { lat: number; lon: number; name: string } | null
  apiKeys: ApiKeys
  language: 'fr' | 'en'
  setWeatherSource: (source: WeatherSource) => void
  setWeatherModel: (model: WeatherModel) => void
  setUnits: (units: UnitSystem) => void
  setDefaultTileSource: (source: MapTileSource) => void
  toggleLayer: (layerId: MapLayerId) => void
  setDefaultLocation: (location: { lat: number; lon: number; name: string } | null) => void
  setApiKey: (key: keyof ApiKeys, value: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      weatherSource: 'openmeteo',
      weatherModel: 'auto',
      units: 'metric',
      defaultTileSource: 'osm',
      activeLayers: ['fishing_spots'],
      defaultLocation: null,
      language: 'fr',
      apiKeys: {
        owm: '',
        meteofrance: '',
        copernicus_user: '',
        copernicus_pass: '',
        maptiler: '',
        shom: '',
      },
      setWeatherSource: (source) => set({ weatherSource: source }),
      setWeatherModel: (model) => set({ weatherModel: model }),
      setUnits: (units) => set({ units }),
      setDefaultTileSource: (source) => set({ defaultTileSource: source }),
      toggleLayer: (layerId) =>
        set((state) => ({
          activeLayers: state.activeLayers.includes(layerId)
            ? state.activeLayers.filter((l) => l !== layerId)
            : [...state.activeLayers, layerId],
        })),
      setDefaultLocation: (location) => set({ defaultLocation: location }),
      setApiKey: (key, value) =>
        set((state) => ({ apiKeys: { ...state.apiKeys, [key]: value } })),
    }),
    {
      name: 'fishweather-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
