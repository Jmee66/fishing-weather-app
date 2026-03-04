import { spotsStorage } from './spots.storage'
import { logStorage } from './log.storage'
import type { WeatherSource, WeatherModel, UnitSystem, MapTileSource, ApiKeys } from '@/types/settings.types'
import type { MapLayerId } from '@/types/map.types'
import type { FavouriteLocation } from '@/stores/location.store'
import type { FishingSpot, FishingLogEntry } from '@/types'

export interface BackupSettings {
  weatherSource: WeatherSource
  weatherModel: WeatherModel
  units: UnitSystem
  defaultTileSource: MapTileSource
  activeLayers: MapLayerId[]
  defaultLocation: { lat: number; lon: number; name: string } | null
  language: 'fr' | 'en'
  apiKeys: ApiKeys
}

export interface BackupData {
  version: string
  exportedAt: string
  settings: BackupSettings
  favourites: FavouriteLocation[]
  spots: FishingSpot[]
  log: FishingLogEntry[]
}

/**
 * Collecte toutes les données (settings + favoris + IndexedDB) et déclenche
 * le téléchargement d'un fichier JSON.
 */
export async function exportBackup(
  settings: BackupSettings,
  favourites: FavouriteLocation[]
): Promise<void> {
  const [spots, log] = await Promise.all([spotsStorage.getAll(), logStorage.getAll()])

  const data: BackupData = {
    version: __APP_VERSION__,
    exportedAt: new Date().toISOString(),
    settings,
    favourites,
    spots,
    log,
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const a = document.createElement('a')
  a.href = url
  a.download = `fishweather-backup-${date}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Lit un fichier JSON, valide la structure et retourne le BackupData.
 * Lance une Error si le fichier est invalide.
 */
export async function importBackup(file: File): Promise<BackupData> {
  const text = await file.text()

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Le fichier n\'est pas un JSON valide')
  }

  const data = parsed as Record<string, unknown>

  if (!data || typeof data !== 'object') {
    throw new Error('Format invalide : objet JSON attendu')
  }
  if (!data.settings || typeof data.settings !== 'object') {
    throw new Error('Format invalide : champ "settings" manquant')
  }
  if (!Array.isArray(data.favourites)) {
    throw new Error('Format invalide : champ "favourites" manquant')
  }
  if (!Array.isArray(data.spots)) {
    throw new Error('Format invalide : champ "spots" manquant')
  }
  if (!Array.isArray(data.log)) {
    throw new Error('Format invalide : champ "log" manquant')
  }

  return data as unknown as BackupData
}
