import { getDB } from './idb.service'
import type { FishingLogEntry } from '@/types'

export const logStorage = {
  async getAll(): Promise<FishingLogEntry[]> {
    const db = await getDB()
    return db.getAll('fishing_log')
  },
  async get(id: string): Promise<FishingLogEntry | undefined> {
    const db = await getDB()
    return db.get('fishing_log', id)
  },
  async save(entry: FishingLogEntry): Promise<void> {
    const db = await getDB()
    await db.put('fishing_log', entry)
  },
  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('fishing_log', id)
  },
  async getBySpot(spotId: string): Promise<FishingLogEntry[]> {
    const db = await getDB()
    return db.getAllFromIndex('fishing_log', 'by-spot', spotId)
  },
}
