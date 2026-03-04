import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { WeatherSource, WeatherModel, UnitSystem, MapTileSource, ApiKeys, MapLayerId } from '@/types'
import type { MarineModelId, WindModelId } from '@/services/api/openmeteo.service'

interface SettingsState {
  weatherSource: WeatherSource
  weatherModel: WeatherModel
  units: UnitSystem
  defaultTileSource: MapTileSource
  activeLayers: MapLayerId[]
  defaultLocation: { lat: number; lon: number; name: string } | null
  apiKeys: ApiKeys
  language: 'fr' | 'en'
  // Préférences Marine
  marineModel: MarineModelId
  windModel: WindModelId
  bulletinZone: string
  setWeatherSource: (source: WeatherSource) => void
  setWeatherModel: (model: WeatherModel) => void
  setUnits: (units: UnitSystem) => void
  setDefaultTileSource: (source: MapTileSource) => void
  toggleLayer: (layerId: MapLayerId) => void
  setDefaultLocation: (location: { lat: number; lon: number; name: string } | null) => void
  setApiKey: (key: keyof ApiKeys, value: string) => void
  setMarineModel: (model: MarineModelId) => void
  setWindModel: (model: WindModelId) => void
  setBulletinZone: (zone: string) => void
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
      // Préférences Marine (défauts)
      marineModel: 'auto',
      windModel: 'arome_france_hd',
      bulletinZone: 'FQLR30',
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
      setMarineModel: (model) => set({ marineModel: model }),
      setWindModel: (model) => set({ windModel: model }),
      setBulletinZone: (zone) => set({ bulletinZone: zone }),
    }),
    {
      name: 'fishweather-settings',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState: unknown, _fromVersion: number) => {
        const state = (persistedState ?? {}) as Partial<SettingsState>
        return {
          weatherSource: state.weatherSource ?? 'openmeteo',
          weatherModel: state.weatherModel ?? 'auto',
          units: state.units ?? 'metric',
          defaultTileSource: state.defaultTileSource ?? 'osm',
          activeLayers: state.activeLayers ?? ['fishing_spots'],
          defaultLocation: state.defaultLocation ?? null,
          language: state.language ?? 'fr',
          apiKeys: {
            owm: state.apiKeys?.owm ?? '',
            meteofrance: state.apiKeys?.meteofrance ?? '',
            copernicus_user: state.apiKeys?.copernicus_user ?? '',
            copernicus_pass: state.apiKeys?.copernicus_pass ?? '',
            maptiler: state.apiKeys?.maptiler ?? '',
            shom: state.apiKeys?.shom ?? '',
          },
          marineModel: state.marineModel ?? 'auto',
          windModel: state.windModel ?? 'arome_france_hd',
          bulletinZone: state.bulletinZone ?? 'FQLR30',
        }
      },
    }
  )
)
