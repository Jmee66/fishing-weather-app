import { getDB } from './idb.service'
import type { FishingSpot } from '@/types'

export const spotsStorage = {
  async getAll(): Promise<FishingSpot[]> {
    const db = await getDB()
    return db.getAll('fishing_spots')
  },
  async get(id: string): Promise<FishingSpot | undefined> {
    const db = await getDB()
    return db.get('fishing_spots', id)
  },
  async save(spot: FishingSpot): Promise<void> {
    const db = await getDB()
    await db.put('fishing_spots', spot)
  },
  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('fishing_spots', id)
  },
}
