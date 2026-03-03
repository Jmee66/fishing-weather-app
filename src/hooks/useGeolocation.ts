import { useCallback } from 'react'
import { useLocationStore } from '@/stores/location.store'

/** Code 1 = permission refusée (définitif), 2 = indisponible (réessayable), 3 = timeout (réessayable) */
export type GeoErrorCode = 1 | 2 | 3 | null

const GEO_MESSAGES: Record<number, string> = {
  1: 'Accès à la localisation refusé',
  2: 'Localisation indisponible',
  3: 'Délai dépassé',
}

export function useGeolocation() {
  const {
    currentPosition, isLocating, locationError,
    locationErrorCode,
    setCurrentPosition, setIsLocating, setLocationError,
  } = useLocationStore()

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Géolocalisation non supportée par ce navigateur', null)
      return
    }
    setIsLocating(true)
    setLocationError(null, null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        })
        setIsLocating(false)
      },
      (err) => {
        setLocationError(GEO_MESSAGES[err.code] ?? err.message, err.code as GeoErrorCode)
      },
      // timeout 20s sur mobile, maximumAge 30s pour réutiliser une position récente
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 }
    )
  }, [setCurrentPosition, setIsLocating, setLocationError])

  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) return () => {}
    setIsLocating(true)
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        })
        setIsLocating(false)
      },
      (err) => {
        setLocationError(GEO_MESSAGES[err.code] ?? err.message, err.code as GeoErrorCode)
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [setCurrentPosition, setIsLocating, setLocationError])

  return { currentPosition, isLocating, locationError, locationErrorCode, locate, watchPosition }
}
