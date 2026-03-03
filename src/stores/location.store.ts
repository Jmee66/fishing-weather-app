import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Coordinates } from '@/types'

export interface FavouriteLocation {
  id: string
  name: string
  lat: number
  lon: number
  category?: 'mer' | 'lac' | 'riviere' | 'bateau' | 'autre'
  createdAt: number
}

interface LocationState {
  currentPosition: (Coordinates & { accuracy?: number; timestamp?: number }) | null
  selectedLocation: (Coordinates & { name: string }) | null
  favourites: FavouriteLocation[]
  isLocating: boolean
  locationError: string | null
  setCurrentPosition: (pos: Coordinates & { accuracy?: number; timestamp?: number }) => void
  setSelectedLocation: (loc: (Coordinates & { name: string }) | null) => void
  setIsLocating: (v: boolean) => void
  setLocationError: (err: string | null) => void
  getActiveLocation: () => Coordinates | null
  addFavourite: (loc: Omit<FavouriteLocation, 'id' | 'createdAt'>) => void
  removeFavourite: (id: string) => void
  isFavourite: (lat: number, lon: number) => boolean
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      currentPosition: null,
      selectedLocation: null,
      favourites: [],
      isLocating: false,
      locationError: null,

      setCurrentPosition: (pos) => set({ currentPosition: pos, locationError: null, isLocating: false }),
      setSelectedLocation: (loc) => set({ selectedLocation: loc }),
      setIsLocating: (v) => set({ isLocating: v }),
      setLocationError: (err) => set({ locationError: err, isLocating: false }),

      getActiveLocation: () => {
        const { selectedLocation, currentPosition } = get()
        if (selectedLocation) return { lat: selectedLocation.lat, lon: selectedLocation.lon }
        if (currentPosition) return { lat: currentPosition.lat, lon: currentPosition.lon }
        return null
      },

      addFavourite: (loc) => {
        const id = `fav_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        set((s) => ({
          favourites: [...s.favourites, { ...loc, id, createdAt: Date.now() }],
        }))
      },

      removeFavourite: (id) => {
        set((s) => ({ favourites: s.favourites.filter((f) => f.id !== id) }))
      },

      isFavourite: (lat, lon) => {
        return get().favourites.some(
          (f) => Math.abs(f.lat - lat) < 0.001 && Math.abs(f.lon - lon) < 0.001
        )
      },
    }),
    {
      name: 'fishweather-location',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ selectedLocation: s.selectedLocation, favourites: s.favourites }),
    }
  )
)
