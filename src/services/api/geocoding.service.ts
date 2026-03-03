import axios from 'axios'
import { NOMINATIM_URL, GEOAPIGOUV_URL } from '@/constants/api.constants'
import type { Coordinates, GeocodingResult } from '@/types'

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
  type: string
  importance: number
  address?: {
    city?: string
    town?: string
    village?: string
    postcode?: string
    country?: string
  }
}

interface GeoApiCommuneResult {
  nom: string
  code: string
  centre: { coordinates: [number, number] }
  codesPostaux?: string[]
  departement?: { nom: string }
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  // Try geo.api.gouv.fr first for French communes
  try {
    const { data } = await axios.get(`${GEOAPIGOUV_URL}/communes`, {
      params: {
        nom: trimmed,
        limit: 5,
        fields: 'nom,code,centre,codesPostaux,departement',
        boost: 'population',
      },
      timeout: 3000,
    })

    const communes: GeoApiCommuneResult[] = data ?? []
    if (communes.length > 0) {
      return communes.map((c) => ({
        displayName: `${c.nom}${c.departement ? ` (${c.departement.nom})` : ''}`,
        lat: c.centre.coordinates[1],
        lon: c.centre.coordinates[0],
        type: 'commune',
        importance: 0.5,
      }))
    }
  } catch {
    // Fall through to Nominatim
  }

  // Nominatim fallback (global)
  const { data } = await axios.get(`${NOMINATIM_URL}/search`, {
    params: {
      q: trimmed,
      format: 'json',
      limit: 8,
      addressdetails: 1,
    },
    headers: {
      'Accept-Language': 'fr,en',
      'User-Agent': 'FishingWeatherApp/1.0',
    },
    timeout: 5000,
  })

  const results: NominatimResult[] = data ?? []
  return results.map((r) => ({
    displayName: r.display_name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    type: r.type,
    importance: r.importance,
  }))
}

export async function reverseGeocode(coords: Coordinates): Promise<GeocodingResult | null> {
  try {
    const { data } = await axios.get(`${NOMINATIM_URL}/reverse`, {
      params: {
        lat: coords.lat,
        lon: coords.lon,
        format: 'json',
        addressdetails: 1,
        zoom: 14,
      },
      headers: {
        'Accept-Language': 'fr,en',
        'User-Agent': 'FishingWeatherApp/1.0',
      },
      timeout: 5000,
    })

    if (!data || data.error) return null

    const r = data as NominatimResult
    const city = r.address?.city ?? r.address?.town ?? r.address?.village ?? ''
    return {
      displayName: city || r.display_name,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      type: r.type,
      importance: r.importance ?? 0,
    }
  } catch {
    return null
  }
}

export const geocodingService = {
  search: searchLocations,
  reverse: reverseGeocode,
}