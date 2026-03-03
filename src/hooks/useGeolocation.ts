import { useCallback } from 'react'
import { useLocationStore } from '@/stores/location.store'

export function useGeolocation() {
  const { currentPosition, isLocating, locationError, setCurrentPosition, setIsLocating, setLocationError } = useLocationStore()

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Géolocalisation non supportée par ce navigateur')
      return
    }
    setIsLocating(true)
    setLocationError(null)
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
        const messages: Record<number, string> = {
          1: 'Permission de géolocalisation refusée — autorisez-la dans les réglages du navigateur',
          2: 'Position indisponible — vérifiez votre GPS',
          3: 'Délai dépassé — réessayez',
        }
        setLocationError(messages[err.code] ?? err.message)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
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
        const messages: Record<number, string> = {
          1: 'Permission refusée',
          2: 'Position indisponible',
          3: 'Délai dépassé',
        }
        setLocationError(messages[err.code] ?? err.message)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [setCurrentPosition, setIsLocating, setLocationError])

  return { currentPosition, isLocating, locationError, locate, watchPosition }
}
