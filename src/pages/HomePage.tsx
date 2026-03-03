import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useLocationStore } from '@/stores/location.store'
import type { FavouriteLocation } from '@/stores/location.store'
import { geocodingService } from '@/services/api/geocoding.service'
import type { GeocodingResult } from '@/types'
import { IconGPS, IconStar, IconMap, IconSun, IconWave, IconFish, IconMoon, IconRiver } from '@/components/ui/icons/WeatherIcons'

// ── Icônes SVG simples (non disponibles dans WeatherIcons) ───────────────────
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)
const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

// ── Liens rapides ────────────────────────────────────────────────────────────
const QUICK_LINKS = [
  { to: '/weather',   label: 'Météo',       desc: 'Prévisions 7 jours', Icon: IconSun },
  { to: '/marine',    label: 'Marine',      desc: 'Vagues & marées',    Icon: IconWave },
  { to: '/map',       label: 'Carte',       desc: 'Spots & navigation', Icon: IconMap },
  { to: '/fishing',   label: 'Pêche',       desc: 'Carnet & conditions',Icon: IconFish },
  { to: '/ephemeris', label: 'Éphéméride',  desc: 'Soleil & lune',      Icon: IconMoon },
  { to: '/hydrology', label: 'Vigicrues',   desc: 'Débits rivières',    Icon: IconRiver },
]

// ── Catégorie ────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  mer: 'Mer', lac: 'Lac', riviere: 'Rivière', bateau: 'Au large', autre: 'Autre',
}

// ── Composant principal ──────────────────────────────────────────────────────
export default function HomePage() {
  const { locate, isLocating, locationError, locationErrorCode } = useGeolocation()
  const {
    selectedLocation, currentPosition, favourites,
    setSelectedLocation, addFavourite, removeFavourite, isFavourite,
  } = useLocationStore()

  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState<GeocodingResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [showFavModal, setShowFavModal] = useState(false)
  const [favName, setFavName]     = useState('')
  const [favCategory, setFavCategory] = useState<FavouriteLocation['category']>('autre')
  const timerRef = { current: null as ReturnType<typeof setTimeout> | null }

  const activeCoords = selectedLocation ?? currentPosition
  const activeIsGPS  = !selectedLocation && !!currentPosition
  const canSaveFav   = activeCoords && !isFavourite(activeCoords.lat, activeCoords.lon)

  // Recherche avec debounce
  const handleSearch = (v: string) => {
    setQuery(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (v.length < 2) { setResults([]); setSearchOpen(false); return }
    timerRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await geocodingService.search(v)
        setResults(res)
        setSearchOpen(true)
      } finally { setSearching(false) }
    }, 350)
  }

  const selectResult = (r: GeocodingResult) => {
    const name = r.displayName.split(',').slice(0, 2).join(',').trim()
    setSelectedLocation({ lat: r.lat, lon: r.lon, name })
    setQuery(name)
    setSearchOpen(false)
  }

  const useGPS = () => {
    setSelectedLocation(null)
    setQuery('')
    setSearchOpen(false)
    locate()
  }

  const openFavModal = () => {
    setFavName(selectedLocation?.name ?? (currentPosition ? 'Ma position GPS' : ''))
    setShowFavModal(true)
  }

  const saveFavourite = () => {
    if (!activeCoords || !favName.trim()) return
    addFavourite({ name: favName.trim(), lat: activeCoords.lat, lon: activeCoords.lon, category: favCategory })
    setShowFavModal(false)
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-6">

      {/* ── Barre de recherche ── */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
            >
              <span className="text-slate-500 flex-shrink-0"><IconSearch /></span>
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => results.length > 0 && setSearchOpen(true)}
                placeholder="Rechercher un lieu…"
                className="flex-1 text-sm outline-none bg-transparent text-slate-100 placeholder:text-slate-500"
              />
              {searching && (
                <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
              {query && !searching && (
                <button onClick={() => { setQuery(''); setResults([]); setSearchOpen(false) }}
                  className="text-slate-500 hover:text-slate-300 flex-shrink-0 text-lg leading-none"
                >×</button>
              )}
            </div>
            {/* Dropdown résultats */}
            {searchOpen && results.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-xl border z-50 overflow-hidden shadow-2xl"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
              >
                {results.slice(0, 6).map((r, i) => (
                  <button key={i}
                    onClick={() => selectResult(r)}
                    className="w-full text-left px-3 py-2.5 hover:bg-[var(--bg-overlay)] transition-colors border-b last:border-0"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="text-sm font-medium text-slate-100 truncate">{r.displayName.split(',')[0]}</div>
                    <div className="text-xs text-slate-500 truncate">{r.displayName.split(',').slice(1, 3).join(',')}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bouton GPS */}
          <button
            onClick={useGPS}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeIsGPS ? 'rgb(14 165 233 / 0.15)' : 'var(--bg-elevated)',
              borderColor: activeIsGPS ? 'rgb(14 165 233 / 0.5)' : 'var(--border-default)',
              color: activeIsGPS ? 'rgb(56 189 248)' : 'var(--text-secondary)',
            }}
            title="Utiliser ma position GPS"
          >
            <IconGPS />
            <span className="hidden sm:inline">{isLocating ? '…' : 'GPS'}</span>
          </button>
        </div>

        {/* Erreur géoloc */}
        {locationError && (
          <div
            className="mt-2 rounded-xl border p-3 space-y-2"
            style={{ backgroundColor: 'rgb(127 29 29 / 0.2)', borderColor: 'rgb(185 28 28 / 0.4)' }}
          >
            <div className="flex items-start gap-2">
              <span className="text-red-400 flex-shrink-0 text-base leading-tight">⚠</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-red-300">{locationError}</p>
                {locationErrorCode === 1 && (
                  <p className="text-xs text-red-400/70 mt-1">
                    Sur iPhone : Réglages → Confidentialité → Service de localisation → Safari/Chrome → "Lors de l'utilisation"
                  </p>
                )}
                {locationErrorCode === 2 && (
                  <p className="text-xs text-red-400/70 mt-1">
                    Astuce : allez à l'extérieur ou activez le Wi-Fi pour aider le GPS.
                  </p>
                )}
              </div>
            </div>
            {locationErrorCode !== 1 && (
              <button
                onClick={locate}
                disabled={isLocating}
                className="w-full py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ backgroundColor: 'rgb(185 28 28 / 0.3)', color: '#fca5a5' }}
              >
                {isLocating ? 'Localisation…' : '↺ Réessayer la géolocalisation'}
              </button>
            )}
            <p className="text-xs text-red-400/60 text-center">
              Ou recherchez un lieu manuellement ci-dessus ↑
            </p>
          </div>
        )}
      </div>

      {/* ── Position active ── */}
      {activeCoords ? (
        <div
          className="rounded-2xl border p-4"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sky-400 flex-shrink-0"><IconPin /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate">
                  {selectedLocation?.name ?? 'Position GPS'}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  {activeCoords.lat.toFixed(4)}°, {activeCoords.lon.toFixed(4)}°
                  {currentPosition?.accuracy && activeIsGPS && (
                    <span className="ml-1 opacity-60">±{Math.round(currentPosition.accuracy)}m</span>
                  )}
                </p>
              </div>
            </div>
            {canSaveFav && (
              <button
                onClick={openFavModal}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-amber-400 hover:bg-amber-900/30 transition-colors flex-shrink-0"
              >
                <IconStar /> Sauver
              </button>
            )}
            {!canSaveFav && activeCoords && isFavourite(activeCoords.lat, activeCoords.lon) && (
              <span className="flex items-center gap-1 text-xs text-amber-400 opacity-60">
                <IconStar filled /> Favori
              </span>
            )}
          </div>

          {/* Liens rapides contextuels */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {QUICK_LINKS.slice(0, 3).map(({ to, label }) => (
              <Link key={to} to={to}
                className="text-center py-2 rounded-xl text-xs font-medium transition-colors"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl border p-6 text-center space-y-3"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-sky-900/20 flex items-center justify-center mx-auto">
            <IconGPS size={36} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Aucune position</p>
            <p className="text-xs text-slate-500 mt-0.5">Recherchez un lieu ou activez le GPS</p>
          </div>
        </div>
      )}

      {/* ── Favoris ── */}
      {favourites.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 px-0.5">
            Favoris
          </h2>
          <div className="space-y-1.5">
            {favourites.map((fav) => {
              const isActive = activeCoords &&
                Math.abs(activeCoords.lat - fav.lat) < 0.001 &&
                Math.abs(activeCoords.lon - fav.lon) < 0.001
              return (
                <div
                  key={fav.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors"
                  style={{
                    backgroundColor: isActive ? 'rgb(14 165 233 / 0.08)' : 'var(--bg-surface)',
                    borderColor: isActive ? 'rgb(14 165 233 / 0.3)' : 'var(--border-default)',
                  }}
                >
                  <button
                    onClick={() => setSelectedLocation({ lat: fav.lat, lon: fav.lon, name: fav.name })}
                    className="flex-1 text-left min-w-0 flex items-center gap-2"
                  >
                    <span className="text-amber-400 flex-shrink-0"><IconStar filled /></span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{fav.name}</p>
                      <p className="text-xs text-slate-500">
                        {fav.category && CATEGORY_LABELS[fav.category]
                          ? `${CATEGORY_LABELS[fav.category]} · ` : ''}
                        {fav.lat.toFixed(3)}°, {fav.lon.toFixed(3)}°
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => removeFavourite(fav.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 p-1"
                    title="Supprimer"
                  >
                    <IconTrash />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Liens rapides ── */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 px-0.5">
          Navigation
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_LINKS.map(({ to, label, desc, Icon }) => (
            <Link key={to} to={to}
              className="rounded-xl border p-3 flex items-center gap-3 transition-all active:scale-[0.97] hover:border-[var(--border-muted)]"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
            >
              <span className="flex-shrink-0 drop-shadow-sm">
                <Icon size={36} />
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-slate-200 text-sm leading-tight">{label}</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-tight">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Modal sauvegarde favori ── */}
      {showFavModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
          <div
            className="w-full max-w-sm rounded-2xl border p-5 space-y-4"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
          >
            <h3 className="font-semibold text-slate-100">Sauver en favori</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nom du lieu</label>
                <input
                  type="text"
                  value={favName}
                  onChange={(e) => setFavName(e.target.value)}
                  placeholder="Ex : Lac de Vassivière"
                  className="w-full px-3 py-2 rounded-xl border text-sm text-slate-100 outline-none focus:border-sky-600"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Catégorie</label>
                <div className="flex gap-2 flex-wrap">
                  {(['mer','lac','riviere','bateau','autre'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setFavCategory(c)}
                      className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                      style={{
                        backgroundColor: favCategory === c ? 'rgb(14 165 233 / 0.2)' : 'var(--bg-surface)',
                        borderColor: favCategory === c ? 'rgb(14 165 233 / 0.5)' : 'var(--border-default)',
                        color: favCategory === c ? 'rgb(56 189 248)' : 'var(--text-secondary)',
                      }}
                    >
                      {CATEGORY_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowFavModal(false)}
                className="flex-1 py-2 rounded-xl border text-sm font-medium"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
              >
                Annuler
              </button>
              <button
                onClick={saveFavourite}
                disabled={!favName.trim()}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
                style={{ backgroundColor: 'rgb(14 165 233)', color: 'white' }}
              >
                Sauver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
