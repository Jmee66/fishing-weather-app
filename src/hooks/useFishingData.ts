import { useEffect } from 'react'
import { useFishingStore } from '@/stores/fishing.store'
import { spotsStorage } from '@/services/storage/spots.storage'
import { logStorage } from '@/services/storage/log.storage'
import type { FishingSpot, FishingLogEntry } from '@/types'

export function useFishingData() {
  const { spots, log, isLoaded, setSpots, setLog, addSpot, updateSpot, deleteSpot, addLogEntry, updateLogEntry, deleteLogEntry, setIsLoaded } = useFishingStore()

  useEffect(() => {
    if (isLoaded) return
    Promise.all([spotsStorage.getAll(), logStorage.getAll()])
      .then(([s, l]) => {
        setSpots(s)
        setLog(l)
        setIsLoaded(true)
      })
      .catch(() => {
        setSpots([])
        setLog([])
        setIsLoaded(true)
      })
  }, [isLoaded, setSpots, setLog, setIsLoaded])

  const saveSpot = async (spot: FishingSpot) => {
    await spotsStorage.save(spot)
    if (spots.find((s) => s.id === spot.id)) updateSpot(spot)
    else addSpot(spot)
  }

  const removeSpot = async (id: string) => {
    await spotsStorage.delete(id)
    deleteSpot(id)
  }

  const saveLogEntry = async (entry: FishingLogEntry) => {
    await logStorage.save(entry)
    if (log.find((e) => e.id === entry.id)) updateLogEntry(entry)
    else addLogEntry(entry)
  }

  const removeLogEntry = async (id: string) => {
    await logStorage.delete(id)
    deleteLogEntry(id)
  }

  return { spots, log, isLoaded, saveSpot, removeSpot, saveLogEntry, removeLogEntry }
}
