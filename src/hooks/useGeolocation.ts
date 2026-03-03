import { useCallback } from 'react'
import { useLocationStore } from '@/stores/location.store'

export function useGeolocation() {
  const { currentPosition, isLocating, locationError, setCurrentPosition, setIsLocating, setLocationError } = useLocationStore()

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Géolocalisation non supportée')
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp })
      },
      (err) => {
        setLocationError(err.message)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [setCurrentPosition, setIsLocating, setLocationError])

  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) return () => {}
    setIsLocating(true)
    const id = navigator.geolocation.watchPosition(
      (pos) => setCurrentPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy, timestamp: pos.timestamp }),
      (err) => setLocationError(err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [setCurrentPosition, setIsLocating, setLocationError])

  return { currentPosition, isLocating, locationError, locate, watchPosition }
}
