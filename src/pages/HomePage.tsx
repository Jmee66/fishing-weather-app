import { Link } from 'react-router-dom'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useLocationStore } from '@/stores/location.store'
import Button from '@/components/ui/Button'

export default function HomePage() {
  const { locate, isLocating } = useGeolocation()
  const coords = useLocationStore((s) => s.getActiveLocation())

  return (
    <div className="space-y-4 p-4">
      {/* Location bar */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={locate}
          disabled={isLocating}
          className="flex-shrink-0"
        >
          {isLocating ? 'Localisation...' : '📍 Me localiser'}
        </Button>
      </div>

      {coords ? (
        <div className="space-y-4">
          {/* Quick weather summary */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white">
            <p className="text-blue-100 text-sm mb-1">Position actuelle</p>
            <p className="text-sm font-mono opacity-80">
              {coords.lat.toFixed(4)}°N, {coords.lon.toFixed(4)}°E
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link
                to="/weather"
                className="bg-white/20 rounded-xl p-3 text-center hover:bg-white/30 transition-colors"
              >
                <div className="text-2xl">🌤️</div>
                <div className="text-xs mt-1">Voir météo</div>
              </Link>
              <Link
                to="/marine"
                className="bg-white/20 rounded-xl p-3 text-center hover:bg-white/30 transition-colors"
              >
                <div className="text-2xl">⚓</div>
                <div className="text-xs mt-1">Voir marine</div>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <div className="text-6xl">📍</div>
          <h2 className="text-lg font-semibold text-slate-700">Où êtes-vous ?</h2>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Activez la géolocalisation pour afficher météo, marées et conditions de pêche.
          </p>
          <Button onClick={locate} disabled={isLocating}>
            {isLocating ? 'Localisation...' : '📍 Me localiser'}
          </Button>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { to: '/map', icon: '🗺️', label: 'Carte interactive', desc: 'Spots & navigation' },
          { to: '/marine', icon: '⚓', label: 'Météo marine', desc: 'Vagues, marées, vent' },
          { to: '/fishing', icon: '🎣', label: 'Mes spots', desc: 'Carnet de pêche' },
          { to: '/ephemeris', icon: '🌙', label: 'Éphéméride', desc: 'Soleil & lune' },
          { to: '/tides', icon: '🌊', label: 'Marées SHOM', desc: 'PM/BM, coefficients' },
          { to: '/hydrology', icon: '💧', label: 'Vigicrues', desc: 'Débits rivières' },
        ].map(({ to, icon, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-shadow active:scale-[0.98]"
          >
            <div className="text-2xl mb-1">{icon}</div>
            <div className="font-semibold text-slate-800 text-sm">{label}</div>
            <div className="text-xs text-slate-500">{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
