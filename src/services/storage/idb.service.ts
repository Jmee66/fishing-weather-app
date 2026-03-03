import { openDB, type IDBPDatabase } from 'idb'
import type { FishingSpot, FishingLogEntry } from '@/types'

interface FishWeatherDB {
  fishing_spots: {
    key: string
    value: FishingSpot
    indexes: { 'by-category': string; 'by-date': number }
  }
  fishing_log: {
    key: string
    value: FishingLogEntry
    indexes: { 'by-spot': string; 'by-date': number }
  }
  offline_tiles: {
    key: string
    value: { key: string; blob: Blob; timestamp: number; expires: number }
    indexes: { 'by-timestamp': number }
  }
  weather_cache: {
    key: string
    value: { key: string; data: unknown; timestamp: number; expires: number }
  }
}

let dbPromise: Promise<IDBPDatabase<FishWeatherDB>> | null = null

export function getDB(): Promise<IDBPDatabase<FishWeatherDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FishWeatherDB>('fishweather-db', 1, {
      upgrade(db) {
        const spotsStore = db.createObjectStore('fishing_spots', { keyPath: 'id' })
        spotsStore.createIndex('by-category', 'category')
        spotsStore.createIndex('by-date', 'createdAt')

        const logStore = db.createObjectStore('fishing_log', { keyPath: 'id' })
        logStore.createIndex('by-spot', 'spotId')
        logStore.createIndex('by-date', 'date')

        const tilesStore = db.createObjectStore('offline_tiles', { keyPath: 'key' })
        tilesStore.createIndex('by-timestamp', 'timestamp')

        db.createObjectStore('weather_cache', { keyPath: 'key' })
      },
    })
  }
  return dbPromise
}
