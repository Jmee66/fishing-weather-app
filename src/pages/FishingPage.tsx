import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Tabs from '@/components/ui/Tabs'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { useFishingData } from '@/hooks/useFishingData'
import { useLocationStore } from '@/stores/location.store'
import { useFishActivity } from '@/hooks/useFishActivity'
import { useWeather } from '@/hooks/useWeather'
import { SPECIES_REGULATIONS } from '@/constants/fishing.constants'
import SpotForm from '@/components/fishing/SpotForm'
import LogEntryForm from '@/components/fishing/LogEntryForm'
import HydrologyPage from '@/pages/HydrologyPage'
import type { FishingSpot, FishingLogEntry } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const CATEGORY_LABELS: Record<string, string> = {
  coastal: '🌊 Mer côtière',
  boat: '⛵ Bateau',
  freshwater_lake: '🏞️ Lac',
  freshwater_river: '🌊 Rivière',
  reservoir: '💧 Réservoir',
}

const ACTIVITY_FACTOR_LABELS: Record<string, string> = {
  pressure: 'Pression baro.',
  lunar: 'Phase lunaire',
  tides: 'Marées',
  wind: 'Vent',
  season: 'Saison',
  ephemeris: 'Éphéméride',
}

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)

export default function FishingPage() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(() => searchParams.get('tab') ?? 'spots')

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t) setTab(t)
  }, [searchParams])
  const [showSpotForm, setShowSpotForm] = useState(false)
  const [showLogForm, setShowLogForm] = useState(false)
  const [editingSpot, setEditingSpot] = useState<FishingSpot | undefined>()
  const [editingLog, setEditingLog] = useState<FishingLogEntry | undefined>()

  const selectedLat = useLocationStore((s) => s.selectedLocation?.lat)
  const selectedLon = useLocationStore((s) => s.selectedLocation?.lon)
  const currentLat  = useLocationStore((s) => s.currentPosition?.lat)
  const currentLon  = useLocationStore((s) => s.currentPosition?.lon)
  const lat = selectedLat ?? currentLat
  const lon = selectedLon ?? currentLon
  const coords = lat != null && lon != null ? { lat, lon } : null

  const { spots, log, isLoaded, saveSpot, removeSpot, saveLogEntry, removeLogEntry } = useFishingData()
  const fishActivity = useFishActivity()
  const { data: weatherData } = useWeather(coords ?? undefined)

  const tabs = [
    { id: 'spots', label: 'Spots' },
    { id: 'log', label: 'Carnet' },
    { id: 'conditions', label: 'Conditions' },
    { id: 'rivieres', label: 'Rivières' },
    { id: 'reglementation', label: 'Règles' },
  ]

  const speciesList = Object.values(SPECIES_REGULATIONS)

  const handleSaveSpot = async (spot: FishingSpot) => {
    await saveSpot(spot)
    setShowSpotForm(false)
    setEditingSpot(undefined)
  }

  const handleSaveLog = async (entry: FishingLogEntry) => {
    await saveLogEntry(entry)
    setShowLogForm(false)
    setEditingLog(undefined)
  }

  return (
    <div className="space-y-3 p-4">
      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {!isLoaded && <div className="flex justify-center py-8"><Spinner /></div>}

      {/* ── Spots ── */}
      {tab === 'spots' && isLoaded && (
        <div className="space-y-3">
          <button
            onClick={() => { setEditingSpot(undefined); setShowSpotForm(true) }}
            className="w-full py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--border-muted)', color: 'var(--text-secondary)' }}
          >
            + Ajouter un spot
          </button>

          {spots.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📌</div>
              <p className="text-slate-500 text-sm">Aucun spot enregistré.</p>
              <p className="text-slate-500 text-xs mt-1">
                Appuyez sur "+ Ajouter" ou faites un longpress sur la carte.
              </p>
            </div>
          ) : (
            spots.map((spot) => (
              <Card key={spot.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-100 truncate">{spot.name}</p>
                      {spot.rating && (
                        <span className="text-xs text-amber-400 flex-shrink-0">
                          {'⭐'.repeat(spot.rating)}
                        </span>
                      )}
                    </div>
                    <Badge color="blue" className="mb-1">
                      {CATEGORY_LABELS[spot.category] ?? spot.category}
                    </Badge>
                    {spot.description && (
                      <p className="text-sm text-slate-500 mt-1">{spot.description}</p>
                    )}
                    {spot.species.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {spot.species.map((s) => (
                          <span key={s} className="text-xs text-teal-400 bg-teal-900/20 rounded-full px-1.5 py-0.5">{s}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      {spot.coordinates.lat.toFixed(4)}°N, {spot.coordinates.lon.toFixed(4)}°E
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 ml-2 flex-shrink-0">
                    <button
                      onClick={() => { setEditingSpot(spot); setShowSpotForm(true) }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-900/20 transition-colors"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => removeSpot(spot.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                      title="Supprimer"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Carnet ── */}
      {tab === 'log' && isLoaded && (
        <div className="space-y-3">
          <button
            onClick={() => { setEditingLog(undefined); setShowLogForm(true) }}
            className="w-full py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--border-muted)', color: 'var(--text-secondary)' }}
          >
            + Nouvelle sortie de pêche
          </button>

          {log.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📖</div>
              <p className="text-slate-500 text-sm">Aucune sortie enregistrée.</p>
            </div>
          ) : (
            [...log].sort((a, b) => b.date - a.date).map((entry) => (
              <Card key={entry.id}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-100">
                      {format(new Date(entry.date), "d MMMM yyyy", { locale: fr })}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{entry.spotName}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <Badge color={entry.catches.length > 0 ? 'green' : 'slate'}>
                      {entry.catches.length} prise{entry.catches.length !== 1 ? 's' : ''}
                    </Badge>
                    <button
                      onClick={() => removeLogEntry(entry.id)}
                      className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
                {entry.catches.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.catches.map((c, i) => (
                      <Badge key={i} color="teal">
                        {c.species}
                        {c.count > 1 ? ` ×${c.count}` : ''}
                        {c.totalWeight != null ? ` ${c.totalWeight}kg` : ''}
                        {c.biggestLength != null ? ` ${c.biggestLength}cm` : ''}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                  {entry.duration > 0 && <span>⏱ {entry.duration}h</span>}
                  {entry.rating && <span>{'⭐'.repeat(entry.rating)}</span>}
                </div>
                {entry.notes && (
                  <p className="text-sm text-slate-500 mt-2">{entry.notes}</p>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Conditions ── */}
      {tab === 'conditions' && (
        <div className="space-y-3">
          {!coords ? (
            <Card>
              <p className="text-slate-500 text-sm text-center py-4">
                Activez la géolocalisation pour voir les conditions de pêche.
              </p>
            </Card>
          ) : (
            <>
              <Card>
                <p className="text-xs text-slate-500 mb-2">Indice d'activité pêche</p>
                {fishActivity ? (
                  <>
                    <div className="flex items-end gap-3 mb-3">
                      <p className="text-5xl font-bold text-slate-100">{fishActivity.total.toFixed(1)}</p>
                      <p className="text-xl font-semibold text-slate-500 mb-1">/ 10</p>
                      <Badge
                        color={
                          fishActivity.label === 'excellent' ? 'green' :
                          fishActivity.label === 'good' ? 'teal' :
                          fishActivity.label === 'average' ? 'amber' : 'red'
                        }
                        className="mb-1"
                      >
                        {fishActivity.label}
                      </Badge>
                    </div>
                    <div className="w-full bg-[var(--bg-elevated)] rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          fishActivity.total >= 7 ? 'bg-green-500' :
                          fishActivity.total >= 4 ? 'bg-amber-500' : 'bg-red-400'
                        }`}
                        style={{ width: `${fishActivity.total * 10}%` }}
                      />
                    </div>
                    <ul className="text-xs text-slate-500 space-y-1">
                      {Object.entries(fishActivity.factors).map(([key, score]) => (
                        <li key={key} className="flex items-center gap-1">
                          <span>{score >= 6 ? '✅' : score >= 3 ? '⚠️' : '❌'}</span>
                          <span>{ACTIVITY_FACTOR_LABELS[key] ?? key} : {score.toFixed(1)}/10</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-slate-500 mt-2">{fishActivity.recommendation}</p>
                  </>
                ) : (
                  <Spinner />
                )}
              </Card>

              {/* Précipitations heure par heure (12h) */}
              {weatherData?.hourly && weatherData.hourly.slice(0, 12).some((h) => (h.pop ?? 0) > 0.05 || (h.rain?.['1h'] ?? 0) > 0) && (
                <Card padding="none">
                  <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                    <h3 className="font-semibold text-slate-100 text-sm">💧 Précipitations · 12 prochaines heures</h3>
                  </div>
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {weatherData.hourly.slice(0, 12).map((h) => {
                      const pop = h.pop ?? 0
                      const rainMm = h.rain?.['1h'] ?? 0
                      if (pop <= 0.05 && rainMm === 0) return null
                      return (
                        <div key={h.dt} className="flex items-center px-4 py-2 gap-3">
                          <span className="text-slate-500 text-xs w-12 flex-shrink-0">
                            {format(new Date(h.dt * 1000), 'HH:mm')}
                          </span>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 bg-[var(--bg-elevated)] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-500 transition-all"
                                style={{ width: `${Math.round(pop * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-blue-400 w-10 text-right">{Math.round(pop * 100)}%</span>
                          </div>
                          {rainMm > 0 && (
                            <span className="text-xs text-sky-300 font-medium flex-shrink-0 w-14 text-right">
                              {rainMm.toFixed(1)} mm
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Réglementation ── */}
      {tab === 'reglementation' && (
        <div className="space-y-2">
          {speciesList.map((spec) => {
            const defaultSize = spec.minSize?.default
            const quota = spec.quotaPerDay?.recreational
            const closedSeason = spec.closedSeasons?.[0]
            return (
              <Card key={spec.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-100">{spec.name}</p>
                    <p className="text-xs text-slate-500 italic">{spec.scientificName}</p>
                  </div>
                  <Badge color={defaultSize ? 'blue' : 'slate'}>
                    {defaultSize ? `≥ ${defaultSize} cm` : 'Pas de taille min.'}
                  </Badge>
                </div>
                {quota != null && (
                  <p className="text-xs text-slate-500 mt-1">Quota journalier : {quota}</p>
                )}
                {closedSeason && (
                  <p className="text-xs text-amber-600 mt-1">
                    Fermeture : {closedSeason.start} → {closedSeason.end}
                    {closedSeason.region !== 'general' && ` (${closedSeason.region})`}
                  </p>
                )}
                {spec.notes && (
                  <p className="text-xs text-orange-600 mt-1">{spec.notes}</p>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* ── Rivières (Vigicrues) ── */}
      {tab === 'rivieres' && (
        <HydrologyPage embedded />
      )}

      {/* ── Modals ── */}
      {showSpotForm && (
        <SpotForm
          spotToEdit={editingSpot}
          initialCoords={coords ?? undefined}
          onSave={handleSaveSpot}
          onClose={() => { setShowSpotForm(false); setEditingSpot(undefined) }}
        />
      )}
      {showLogForm && (
        <LogEntryForm
          spots={spots.map((s) => ({ id: s.id, name: s.name }))}
          entryToEdit={editingLog}
          onSave={handleSaveLog}
          onClose={() => { setShowLogForm(false); setEditingLog(undefined) }}
        />
      )}
    </div>
  )
}
