import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLocationStore } from '@/stores/location.store'
import { useGeolocation } from '@/hooks/useGeolocation'

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<L.Map | null>(null)
  const coords = useLocationStore((s) => s.getActiveLocation())
  const { locate, isLocating } = useGeolocation()

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

    // OSM base layer
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    })

    // OpenSeaMap overlay
    const seamap = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
      attribution: '© OpenSeaMap contributors',
      maxZoom: 18,
      opacity: 0.8,
    })

    // SHOM marine charts
    const shom = L.tileLayer(
      'https://services.data.shom.fr/INSPIRE/wmts/CARTES_MARINES_VECTEUR/TMS/GoogleMapsCompatible/{z}/{x}/{y}.png',
      { attribution: '© SHOM', maxZoom: 18, opacity: 0.7 }
    )

    osm.addTo(map)

    L.control.layers(
      { 'OpenStreetMap': osm, 'SHOM Marine': shom },
      { 'OpenSeaMap': seamap }
    ).addTo(map)

    leafletMap.current = map

    return () => {
      map.remove()
      leafletMap.current = null
    }
  }, [])

  // Pan to position when coords change
  useEffect(() => {
    if (coords && leafletMap.current) {
      leafletMap.current.setView([coords.lat, coords.lon], 12)
      L.marker([coords.lat, coords.lon])
        .addTo(leafletMap.current)
        .bindPopup('📍 Votre position')
        .openPopup()
    }
  }, [coords])

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="absolute inset-0" />
      <button
        onClick={locate}
        disabled={isLocating}
        className="absolute bottom-6 right-4 z-[1000] bg-[var(--bg-surface)] rounded-full p-3 shadow-lg border border-[var(--border-default)] hover:bg-[var(--bg-elevated)] active:scale-95 transition-transform"
        title="Me localiser"
      >
        {isLocating ? '⌛' : '📍'}
      </button>
    </div>
  )
}
