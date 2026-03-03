import { useLocation, Link } from 'react-router-dom'
import { useLocationStore } from '@/stores/location.store'
import { IconSettings, IconGPS } from '@/components/ui/icons/WeatherIcons'

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

export default function TopNav() {
  const location = useLocation()
  const selectedLocation = useLocationStore((s) => s.selectedLocation)
  const currentPosition = useLocationStore((s) => s.currentPosition)

  const title = PAGE_TITLES[location.pathname] ?? 'FishWeather'
  const locationName = selectedLocation?.name ?? (currentPosition ? 'Position GPS' : 'Aucune position')
  const hasGPS = !!currentPosition && !selectedLocation

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
        <div className="flex items-center gap-1.5">
          <span className="opacity-80 flex-shrink-0">
            <IconGPS size={11} />
          </span>
          <p
            className="text-xs truncate max-w-[180px]"
            style={{ color: hasGPS ? '#34d399' : 'var(--text-secondary)' }}
          >
            {locationName}
          </p>
        </div>
      </div>
      <Link
        to="/settings"
        className="w-9 h-9 flex items-center justify-center rounded-xl transition-opacity hover:opacity-80 active:scale-95"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        <IconSettings size={22} />
      </Link>
    </header>
  )
}
