import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { MapViewport, MapLayerId, MapTileSource } from '@/types'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/constants/map.constants'

interface MapState {
  viewport: MapViewport
  activeTileSource: MapTileSource
  activeLayers: MapLayerId[]
  isTrackingGPS: boolean
  setViewport: (viewport: Partial<MapViewport>) => void
  setActiveTileSource: (source: MapTileSource) => void
  toggleLayer: (layerId: MapLayerId) => void
  setIsTrackingGPS: (v: boolean) => void
  zoomIn: () => void
  zoomOut: () => void
}

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      viewport: { lat: DEFAULT_CENTER[0], lon: DEFAULT_CENTER[1], zoom: DEFAULT_ZOOM },
      activeTileSource: 'osm',
      activeLayers: ['fishing_spots'],
      isTrackingGPS: false,
      setViewport: (viewport) =>
        set((state) => ({ viewport: { ...state.viewport, ...viewport } })),
      setActiveTileSource: (source) => set({ activeTileSource: source }),
      toggleLayer: (layerId) =>
        set((state) => ({
          activeLayers: state.activeLayers.includes(layerId)
            ? state.activeLayers.filter((l) => l !== layerId)
            : [...state.activeLayers, layerId],
        })),
      setIsTrackingGPS: (v) => set({ isTrackingGPS: v }),
      zoomIn: () => set((state) => ({ viewport: { ...state.viewport, zoom: Math.min(state.viewport.zoom + 1, 19) } })),
      zoomOut: () => set((state) => ({ viewport: { ...state.viewport, zoom: Math.max(state.viewport.zoom - 1, 1) } })),
    }),
    {
      name: 'fishweather-map',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeTileSource: state.activeTileSource, activeLayers: state.activeLayers }),
    }
  )
)
