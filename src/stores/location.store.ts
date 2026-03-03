import { create } from 'zustand'
import type { Coordinates } from '@/types'

interface LocationState {
  currentPosition: (Coordinates & { accuracy?: number; timestamp?: number }) | null
  selectedLocation: (Coordinates & { name: string }) | null
  isLocating: boolean
  locationError: string | null
  setCurrentPosition: (pos: Coordinates & { accuracy?: number; timestamp?: number }) => void
  setSelectedLocation: (loc: Coordinates & { name: string }) => void
  setIsLocating: (v: boolean) => void
  setLocationError: (err: string | null) => void
  getActiveLocation: () => Coordinates | null
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentPosition: null,
  selectedLocation: null,
  isLocating: false,
  locationError: null,
  setCurrentPosition: (pos) => set({ currentPosition: pos, locationError: null }),
  setSelectedLocation: (loc) => set({ selectedLocation: loc }),
  setIsLocating: (v) => set({ isLocating: v }),
  setLocationError: (err) => set({ locationError: err, isLocating: false }),
  getActiveLocation: () => {
    const { selectedLocation, currentPosition } = get()
    if (selectedLocation) return { lat: selectedLocation.lat, lon: selectedLocation.lon }
    if (currentPosition) return { lat: currentPosition.lat, lon: currentPosition.lon }
    return null
  },
}))
