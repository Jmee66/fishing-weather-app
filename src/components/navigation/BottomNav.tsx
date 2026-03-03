import { NavLink } from 'react-router-dom'
import { IconHome, IconSun, IconWave, IconMap, IconFish } from '@/components/ui/icons/WeatherIcons'

const NAV_ITEMS = [
  { to: '/', label: 'Accueil', Icon: IconHome, end: true },
  { to: '/weather', label: 'Météo', Icon: IconSun, end: false },
  { to: '/marine', label: 'Marine', Icon: IconWave, end: false },
  { to: '/map', label: 'Carte', Icon: IconMap, end: false },
  { to: '/fishing', label: 'Pêche', Icon: IconFish, end: false },
] as const

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-default)',
        height: 'calc(var(--nav-height) + var(--safe-bottom))',
        paddingBottom: 'var(--safe-bottom)',
      }}
    >
      <div className="flex h-16 items-center">
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all duration-150 ${
                isActive
                  ? 'opacity-100 scale-110'
                  : 'opacity-45 hover:opacity-70 scale-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`transition-all duration-150 ${isActive ? 'drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]' : ''}`}>
                  <Icon size={26} />
                </span>
                <span
                  className="text-[10px] font-medium leading-none tracking-wide"
                  style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)' }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
