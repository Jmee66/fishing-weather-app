import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Accueil', icon: '🏠', end: true },
  { to: '/weather', label: 'Météo', icon: '🌤️', end: false },
  { to: '/marine', label: 'Marine', icon: '⚓', end: false },
  { to: '/map', label: 'Carte', icon: '🗺️', end: false },
  { to: '/fishing', label: 'Pêche', icon: '🎣', end: false },
] as const

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom"
      style={{ height: 'calc(var(--nav-height) + var(--safe-bottom))', paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="flex h-16 items-center">
        {NAV_ITEMS.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-colors ${isActive ? "text-blue-600" : "text-slate-500"}`
            }
          >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
