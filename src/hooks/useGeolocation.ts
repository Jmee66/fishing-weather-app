import { useCallback } from 'react'
import { useLocationStore } from '@/stores/location.store'
import { geocodingService } from '@/services/api/geocoding.service'

/** Code 1 = permission refusée (définitif), 2 = indisponible (réessayable), 3 = timeout (réessayable) */
export type GeoErrorCode = 1 | 2 | 3 | null

const GEO_MESSAGES: Record<number, string> = {
  1: 'Accès à la localisation refusé',
  2: 'Localisation indisponible',
  3: 'Délai dépassé',
}

/**
 * Stratégie cascade :
 * 1. Essai rapide sans enableHighAccuracy (Wi-Fi/IP, marche sur desktop)
 * 2. Si échec code 2 ou 3, réessai avec enableHighAccuracy (GPS matériel, mobile)
 * Cette approche évite le code 2 sur desktop où il n'y a pas de GPS matériel.
 */
function getPositionCascade(
  onSuccess: (pos: GeolocationPosition) => void,
  onError: (err: GeolocationPositionError) => void,
) {
  // Étape 1 : résolution rapide via Wi-Fi / IP (desktop-friendly)
  navigator.geolocation.getCurrentPosition(
    onSuccess,
    (err1) => {
      // Si permission refusée → final, pas la peine de réessayer
      if (err1.code === 1) { onError(err1); return }

      // Étape 2 : réessai avec GPS haute précision (mobile)
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        onError,
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 },
      )
    },
    // Pas de enableHighAccuracy, timeout court : si ça marche → parfait, sinon on bascule
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
  )
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

    getPositionCascade(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        }
        setCurrentPosition(coords)
        setIsLocating(false)

        // Reverse geocoding pour afficher le nom du lieu
        try {
          const place = await geocodingService.reverse({ lat: coords.lat, lon: coords.lon })
          if (place?.displayName) {
            // On met à jour le nom dans currentPosition via selectedLocation = null
            // On stocke le nom dans le store pour l'afficher dans TopNav
            useLocationStore.setState((s) => ({
              currentPosition: s.currentPosition
                ? { ...s.currentPosition, name: place.displayName }
                : s.currentPosition,
            }))
          }
        } catch {
          // Silencieux : le nom est optionnel
        }
      },
      (err) => {
        setLocationError(GEO_MESSAGES[err.code] ?? err.message, err.code as GeoErrorCode)
      },
    )
  }, [setCurrentPosition, setIsLocating, setLocationError])

  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) return () => {}
    setIsLocating(true)
    // watchPosition : on essaie d'abord sans high accuracy puis avec
    // (watchPosition ne supporte pas la cascade facilement, on utilise low accuracy d'abord)
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
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [setCurrentPosition, setIsLocating, setLocationError])

  return { currentPosition, isLocating, locationError, locationErrorCode, locate, watchPosition }
}
