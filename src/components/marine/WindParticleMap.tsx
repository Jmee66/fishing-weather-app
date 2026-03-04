/**
 * WindParticleMap — mini-carte Leaflet avec animation de particules de vent
 * style Windy, alimentée par une grille Open-Meteo 5×5 autour de la position.
 *
 * Utilise leaflet-velocity pour le rendu canvas des particules.
 */
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-velocity/dist/leaflet-velocity.css'
import 'leaflet-velocity'
import type { WindGridData } from '@/services/api/openmeteo.service'
import type { Coordinates } from '@/types'
import Spinner from '@/components/ui/Spinner'

interface Props {
  coords: Coordinates
  windGrid?: [WindGridData, WindGridData]
  loading?: boolean
  height?: number
}

// Échelle de couleurs Beaufort (bleu → vert → jaune → orange → rouge)
const WIND_COLOR_SCALE = [
  '#4575b4', // calme
  '#74add1',
  '#abd9e9',
  '#e0f3f8',
  '#fee090',
  '#fdae61',
  '#f46d43',
  '#d73027', // tempête
]

export default function WindParticleMap({ coords, windGrid, loading = false, height = 260 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<L.Map | null>(null)
  const velocityLayer = useRef<L.Layer | null>(null)
  const markerRef = useRef<L.CircleMarker | null>(null)

  // Initialiser la carte une seule fois
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return

    const map = L.map(mapRef.current, {
      center: [coords.lat, coords.lon],
      zoom: 9,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 13,
      opacity: 0.6,
    }).addTo(map)

    // Marker position utilisateur
    const marker = L.circleMarker([coords.lat, coords.lon], {
      radius: 7,
      fillColor: '#38bdf8',
      fillOpacity: 1,
      color: '#fff',
      weight: 2,
    }).addTo(map)
    marker.bindTooltip('Votre position', { permanent: false })
    markerRef.current = marker

    leafletMap.current = map

    return () => {
      map.remove()
      leafletMap.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mettre à jour le centre quand les coords changent
  useEffect(() => {
    if (!leafletMap.current) return
    leafletMap.current.setView([coords.lat, coords.lon], leafletMap.current.getZoom())
    markerRef.current?.setLatLng([coords.lat, coords.lon])
  }, [coords.lat, coords.lon])

  // Ajouter / mettre à jour la couche velocityLayer quand windGrid change
  useEffect(() => {
    if (!leafletMap.current || !windGrid) return

    // Supprimer l'ancienne couche
    if (velocityLayer.current) {
      leafletMap.current.removeLayer(velocityLayer.current)
      velocityLayer.current = null
    }

    try {
      const layer = L.velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: 'Vent',
          position: 'bottomleft',
          emptyString: 'Pas de données',
          angleConvention: 'bearingCW',
          showCardinal: true,
          speedUnit: 'kt',
          displayPosition: 'bottomleft',
        },
        data: windGrid,
        maxVelocity: 25,       // vitesse max (m/s) pour l'échelle de couleurs
        velocityScale: 0.015,  // longueur des particules (plus grand = plus long)
        colorScale: WIND_COLOR_SCALE,
        opacity: 0.9,
        particleAge: 64,       // durée de vie d'une particule (frames)
        lineWidth: 1.5,
        particleMultiplier: 1 / 300,
        frameRate: 15,
      })

      layer.addTo(leafletMap.current)
      velocityLayer.current = layer
    } catch (err) {
      console.warn('WindParticleMap: erreur leaflet-velocity', err)
    }

    return () => {
      if (velocityLayer.current && leafletMap.current) {
        leafletMap.current.removeLayer(velocityLayer.current)
        velocityLayer.current = null
      }
    }
  }, [windGrid])

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height }}>
      {/* Fond sombre pendant le chargement */}
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--bg-base)' }}>
          <Spinner size="lg" />
          <p className="text-xs text-slate-500">Chargement grille de vent…</p>
        </div>
      )}
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {/* Badge source */}
      <div className="absolute top-2 right-2 z-[1000] px-2 py-0.5 rounded text-[9px] font-medium"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#94a3b8' }}>
        Open-Meteo 5×5 · ~20 km
      </div>
    </div>
  )
}
