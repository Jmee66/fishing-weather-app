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

export default function TopNav() {
  const location = useLocation()
  const selectedLocation = useLocationStore((s) => s.selectedLocation)
  const currentPosition = useLocationStore((s) => s.currentPosition)

  const title = PAGE_TITLES[location.pathname] ?? 'FishWeather'
  const locationName = selectedLocation?.name ?? (currentPosition ? 'Position GPS' : 'Aucune position')

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between" style={{ height: "var(--header-height)" }}>
      <div className="flex-1">
        <h1 className="text-lg font-bold text-slate-800 leading-tight">{title}</h1>
        <p className="text-xs text-slate-500 truncate max-w-[200px]">{locationName}</p>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/settings" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
          <span className="text-lg">⚙️</span>
        </Link>
      </div>
    </header>
  )
}
