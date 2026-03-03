import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLocationStore } from '@/stores/location.store'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useFishingStore } from '@/stores/fishing.store'
import SpotForm from '@/components/fishing/SpotForm'
import { spotsStorage } from '@/services/storage/spots.storage'
import { logStorage } from '@/services/storage/log.storage'
import type { FishingSpot } from '@/types'

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CATEGORY_LABELS: Record<string, string> = {
  coastal: '🌊 Mer côtière',
  boat: '⛵ Bateau',
  freshwater_lake: '🏞️ Lac',
  freshwater_river: '🌊 Rivière',
  reservoir: '💧 Réservoir',
}

function createSpotIcon() {
  return L.divIcon({
    html: '<div style="font-size:22px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.6))">🎣</div>',
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

function createPositionIcon() {
  return L.divIcon({
    html: '<div style="font-size:22px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.6))">📍</div>',
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  })
}

function renderSpotsOnLayer(layer: L.LayerGroup, spots: FishingSpot[]) {
  layer.clearLayers()
  spots.forEach((spot) => {
    const speciesHtml = spot.species.length > 0
      ? `<div style="margin-top:4px;font-size:11px;color:#94a3b8">${spot.species.join(', ')}</div>`
      : ''
    const ratingHtml = spot.rating
      ? `<div style="font-size:11px;margin-top:2px">${'⭐'.repeat(spot.rating)}</div>`
      : ''
    L.marker([spot.coordinates.lat, spot.coordinates.lon], { icon: createSpotIcon() })
      .bindPopup(`
        <div style="min-width:140px">
          <div style="font-weight:600;font-size:13px;margin-bottom:2px">${spot.name}</div>
          <div style="font-size:11px;color:#94a3b8">${CATEGORY_LABELS[spot.category] ?? spot.category}</div>
          ${ratingHtml}${speciesHtml}
          ${spot.description ? `<div style="font-size:11px;margin-top:4px;color:#94a3b8">${spot.description}</div>` : ''}
          <div style="font-size:10px;margin-top:4px;color:#64748b;font-family:monospace">${spot.coordinates.lat.toFixed(4)}°N, ${spot.coordinates.lon.toFixed(4)}°E</div>
        </div>
      `)
      .addTo(layer)
  })
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<L.Map | null>(null)
  const spotsLayerRef = useRef<L.LayerGroup | null>(null)
  const positionMarkerRef = useRef<L.Marker | null>(null)
  const longpressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSpotsKey = useRef<string>('')

  const [showSpotForm, setShowSpotForm] = useState(false)
  const [longpressCoords, setLongpressCoords] = useState<{ lat: number; lon: number } | undefined>()

  const selectedLat = useLocationStore((s) => s.selectedLocation?.lat)
  const selectedLon = useLocationStore((s) => s.selectedLocation?.lon)
  const currentLat  = useLocationStore((s) => s.currentPosition?.lat)
  const currentLon  = useLocationStore((s) => s.currentPosition?.lon)
  const lat = selectedLat ?? currentLat
  const lon = selectedLon ?? currentLon
  const coords = lat != null && lon != null ? { lat, lon } : null
  const { locate, isLocating } = useGeolocation()

  // Stable selectors — Zustand returns same reference if value unchanged
  const spots   = useFishingStore((s) => s.spots)
  const isLoaded = useFishingStore((s) => s.isLoaded)

  // Load spots from IndexedDB if not already loaded
  useEffect(() => {
    if (isLoaded) return
    const { setSpots, setLog, setIsLoaded } = useFishingStore.getState()
    Promise.all([spotsStorage.getAll(), logStorage.getAll()]).then(([s, l]) => {
      setSpots(s)
      setLog(l)
      setIsLoaded(true)
    })
  }, [isLoaded])

  // Init map once
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return

    const center: L.LatLngTuple = coords
      ? [coords.lat, coords.lon]
      : [46.8, 2.3]

    const map = L.map(mapRef.current, {
      center,
      zoom: coords ? 12 : 6,
      zoomControl: true,
    })

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    })
    const seamap = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
      attribution: '© OpenSeaMap contributors',
      maxZoom: 18,
      opacity: 0.8,
    })
    const shom = L.tileLayer(
      'https://services.data.shom.fr/INSPIRE/wmts/CARTES_MARINES_VECTEUR/TMS/GoogleMapsCompatible/{z}/{x}/{y}.png',
      { attribution: '© SHOM', maxZoom: 18, opacity: 0.7 }
    )

    const spotsLayer = L.layerGroup()
    spotsLayerRef.current = spotsLayer

    osm.addTo(map)
    spotsLayer.addTo(map)

    L.control.layers(
      { 'OpenStreetMap': osm, 'SHOM Marine': shom },
      { 'OpenSeaMap': seamap, 'Spots 🎣': spotsLayer }
    ).addTo(map)

    // Longpress detection — setters are stable (useState), safe to use in closure
    const startLongpress = (latlng: L.LatLng) => {
      if (longpressTimer.current) clearTimeout(longpressTimer.current)
      longpressTimer.current = setTimeout(() => {
        setLongpressCoords({ lat: latlng.lat, lon: latlng.lng })
        setShowSpotForm(true)
      }, 500)
    }
    const cancelLongpress = () => {
      if (longpressTimer.current) {
        clearTimeout(longpressTimer.current)
        longpressTimer.current = null
      }
    }

    map.on('mousedown', (e) => startLongpress(e.latlng))
    map.on('mouseup mousemove', cancelLongpress)
    map.on('touchstart', (e) => {
      const te = e as unknown as { originalEvent: TouchEvent; latlng: L.LatLng }
      if (te.originalEvent && te.originalEvent.touches.length === 1 && te.latlng) {
        startLongpress(te.latlng)
      }
    })
    map.on('touchend touchmove', cancelLongpress)

    leafletMap.current = map

    return () => {
      cancelLongpress()
      map.remove()
      leafletMap.current = null
      spotsLayerRef.current = null
      positionMarkerRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update position marker when coords change
  useEffect(() => {
    if (!leafletMap.current || !coords) return
    if (positionMarkerRef.current) {
      positionMarkerRef.current.setLatLng([coords.lat, coords.lon])
    } else {
      positionMarkerRef.current = L.marker([coords.lat, coords.lon], {
        icon: createPositionIcon(),
        zIndexOffset: 1000,
      })
        .addTo(leafletMap.current)
        .bindPopup('📍 Votre position')
      leafletMap.current.setView([coords.lat, coords.lon], 12)
    }
  }, [coords?.lat, coords?.lon]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync spots markers — guarded by key to avoid unnecessary redraws
  useEffect(() => {
    const layer = spotsLayerRef.current
    if (!layer) return
    const key = spots.map((s) => `${s.id}:${s.updatedAt}`).join('|')
    if (key === lastSpotsKey.current) return
    lastSpotsKey.current = key
    renderSpotsOnLayer(layer, spots)
  }, [spots])

  const handleSaveSpot = async (spot: FishingSpot) => {
    await spotsStorage.save(spot)
    const { spots: current, addSpot, updateSpot } = useFishingStore.getState()
    if (current.find((s) => s.id === spot.id)) updateSpot(spot)
    else addSpot(spot)
    setShowSpotForm(false)
    setLongpressCoords(undefined)
  }

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="absolute inset-0" />

      {/* Longpress hint */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 rounded-full text-xs pointer-events-none select-none"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }}
      >
        Appui long pour ajouter un spot 🎣
      </div>

      {/* Locate button */}
      <button
        onClick={locate}
        disabled={isLocating}
        className="absolute bottom-6 right-4 z-[1000] rounded-full p-3 shadow-lg border transition-colors"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
        }}
        title="Me localiser"
      >
        {isLocating ? '⌛' : '📍'}
      </button>

      {/* SpotForm modal */}
      {showSpotForm && (
        <SpotForm
          initialCoords={longpressCoords ?? coords ?? undefined}
          onSave={handleSaveSpot}
          onClose={() => { setShowSpotForm(false); setLongpressCoords(undefined) }}
        />
      )}
    </div>
  )
}
