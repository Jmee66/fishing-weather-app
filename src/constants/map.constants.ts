import type { TileSource, MapLayer } from '@/types'

export const DEFAULT_CENTER: [number, number] = [46.8, 2.3]
export const DEFAULT_ZOOM = 6

export const TILE_SOURCES: Record<string, TileSource> = {
  osm: {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  },
  shom: {
    id: 'shom',
    name: 'Carte SHOM',
    url: 'https://services.data.shom.fr/INSPIRE/wmts/CARTES_MARINES_PYRAMIDE/GoogleMapsCompatible/{z}/{y}/{x}?apikey={apikey}',
    attribution: '© SHOM',
    maxZoom: 18,
    requiresKey: 'shom',
  },
  openseamap: {
    id: 'openseamap',
    name: 'OpenSeaMap',
    url: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
    attribution: '© OpenSeaMap contributors',
    maxZoom: 18,
    overlay: true,
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
}

export const MAP_LAYERS: MapLayer[] = [
  { id: 'fishing_spots', name: 'Spots de pêche', icon: '🎣', description: 'Mes spots personnels', enabled: true, category: 'fishing' },
  { id: 'seamarkers', name: 'Marques nautiques', icon: '⚓', description: 'Bouées, dangers, ports (OpenSeaMap)', enabled: false, category: 'marine' },
  { id: 'depth', name: 'Profondeurs', icon: '📏', description: 'Bathymétrie SHOM', enabled: false, category: 'marine' },
  { id: 'currents', name: 'Courants', icon: '🌊', description: 'Courants marins (Copernicus)', enabled: false, category: 'marine' },
  { id: 'wind', name: 'Vent', icon: '💨', description: 'Vent en temps réel', enabled: false, category: 'weather' },
  { id: 'vigicrues', name: 'Vigicrues', icon: '🏞️', description: 'Vigilance crues et débits rivières', enabled: false, category: 'safety' },
  { id: 'tides', name: 'Marées', icon: '🌊', description: 'Animation courants de marée', enabled: false, category: 'marine' },
]
