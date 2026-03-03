import { useLocation, Link } from 'react-router-dom'
import { useLocationStore } from '@/stores/location.store'

const PAGE_TITLES: Record<string, string> = {
  '/': 'FishWeather',
  '/weather': 'Météo',
  '/marine': 'Météo Marine',
  '/map': 'Carte',
  '/fishing': 'Pêche',
  '/tides': 'Marées',
  '/ephemeris': 'Éphéméride',
  '/hydrology': 'Hydrologie',
  '/settings': 'Paramètres',
}

const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const IconPin = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

export default function TopNav() {
  const location = useLocation()
  const selectedLocation = useLocationStore((s) => s.selectedLocation)
  const currentPosition = useLocationStore((s) => s.currentPosition)

  const title = PAGE_TITLES[location.pathname] ?? 'FishWeather'
  const locationName = selectedLocation?.name ?? (currentPosition ? 'Position GPS' : 'Aucune position')

  return (
    <header
      className="px-4 py-2 flex items-center justify-between"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        height: 'var(--header-height)',
      }}
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
          <IconPin />
          <p className="text-xs truncate max-w-[180px]">{locationName}</p>
        </div>
      </div>
      <Link
        to="/settings"
        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <IconSettings />
      </Link>
    </header>
  )
}
