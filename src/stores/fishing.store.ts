import { create } from 'zustand'
import type { FishingSpot, FishingLogEntry } from '@/types'

interface FishingState {
  spots: FishingSpot[]
  log: FishingLogEntry[]
  selectedSpotId: string | null
  isLoaded: boolean
  setSpots: (spots: FishingSpot[]) => void
  addSpot: (spot: FishingSpot) => void
  updateSpot: (spot: FishingSpot) => void
  deleteSpot: (id: string) => void
  setLog: (log: FishingLogEntry[]) => void
  addLogEntry: (entry: FishingLogEntry) => void
  updateLogEntry: (entry: FishingLogEntry) => void
  deleteLogEntry: (id: string) => void
  setSelectedSpotId: (id: string | null) => void
  setIsLoaded: (v: boolean) => void
}

export const useFishingStore = create<FishingState>((set) => ({
  spots: [],
  log: [],
  selectedSpotId: null,
  isLoaded: false,
  setSpots: (spots) => set({ spots }),
  addSpot: (spot) => set((state) => ({ spots: [...state.spots, spot] })),
  updateSpot: (spot) =>
    set((state) => ({ spots: state.spots.map((s) => (s.id === spot.id ? spot : s)) })),
  deleteSpot: (id) => set((state) => ({ spots: state.spots.filter((s) => s.id !== id) })),
  setLog: (log) => set({ log }),
  addLogEntry: (entry) => set((state) => ({ log: [...state.log, entry] })),
  updateLogEntry: (entry) =>
    set((state) => ({ log: state.log.map((e) => (e.id === entry.id ? entry : e)) })),
  deleteLogEntry: (id) => set((state) => ({ log: state.log.filter((e) => e.id !== id) })),
  setSelectedSpotId: (id) => set({ selectedSpotId: id }),
  setIsLoaded: (v) => set({ isLoaded: v }),
}))
