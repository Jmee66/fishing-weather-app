import { NavLink } from 'react-router-dom'

const IconHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
)

const IconWeather = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
)

const IconWave = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 11c1.5-2 3-3 5-3s3.5 3 5 3 3.5-3 5-3 3.5 3 5 3"/>
    <path d="M2 16c1.5-2 3-3 5-3s3.5 3 5 3 3.5-3 5-3 3.5 3 5 3"/>
  </svg>
)

const IconMap = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/>
    <line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
)

const IconFish = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 12c0-3.5 3-6.5 6.5-6.5 2 0 3.8.9 5.2 2.3L21 12l-2.8 4.2c-1.4 1.4-3.2 2.3-5.2 2.3-3.5 0-6.5-3-6.5-6.5z"/>
    <path d="M3 8.5L5.5 12 3 15.5"/>
    <circle cx="16.5" cy="10" r="0.8" fill="currentColor" stroke="none"/>
  </svg>
)

const NAV_ITEMS = [
  { to: '/', label: 'Accueil', Icon: IconHome, end: true },
  { to: '/weather', label: 'Météo', Icon: IconWeather, end: false },
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
              `flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
                isActive ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <Icon />
            <span className="text-[10px] font-medium leading-none tracking-wide">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
