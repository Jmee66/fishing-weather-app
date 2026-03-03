import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatTime(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date * 1000) : date
  return format(d, 'HH:mm')
}

export function formatDate(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date * 1000) : date
  return format(d, 'd MMMM yyyy', { locale: fr })
}

export function formatShortDate(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date * 1000) : date
  return format(d, 'd MMM', { locale: fr })
}

export function formatDatetime(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date * 1000) : date
  return format(d, "d MMM à HH:mm", { locale: fr })
}

export function formatRelative(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date * 1000) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: fr })
}

export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lonDir = lon >= 0 ? 'E' : 'O'
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`
}
