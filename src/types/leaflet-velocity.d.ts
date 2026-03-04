// Déclarations de types pour leaflet-velocity (pas de @types officiel)
import * as L from 'leaflet'

interface VelocityLayerOptions extends L.LayerOptions {
  displayValues?: boolean
  displayOptions?: {
    velocityType?: string
    position?: string
    emptyString?: string
    angleConvention?: string
    showCardinal?: boolean
    speedUnit?: string
    displayPosition?: string
  }
  data?: unknown[]
  maxVelocity?: number
  minVelocity?: number
  velocityScale?: number
  opacity?: number
  colorScale?: string[]
  onAdd?: (map: L.Map) => void
  onRemove?: (map: L.Map) => void
  particleAge?: number
  lineWidth?: number
  particleMultiplier?: number
  frameRate?: number
}

declare module 'leaflet' {
  function velocityLayer(options: VelocityLayerOptions): L.Layer & {
    setData(data: unknown[]): void
    setOpacity(opacity: number): void
  }
}

declare module 'leaflet-velocity' {
  export = L
}
