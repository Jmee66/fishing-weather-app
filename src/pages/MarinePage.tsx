import { useState } from 'react'
import Tabs from '@/components/ui/Tabs'
import Spinner from '@/components/ui/Spinner'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useMarineWeather } from '@/hooks/useMarineWeather'
import { useTides } from '@/hooks/useTides'
import { useLocationStore } from '@/stores/location.store'
import { getBeaufortFromMs, getBeaufortLabel, getBeaufortColor } from '@/utils/beaufort'
import { getDouglasFromHeight, getDouglasLabel } from '@/utils/douglas'
import { formatWindSpeed, getWindDirectionLabel } from '@/utils/units'
import { useSettingsStore } from '@/stores/settings.store'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

/** Flèche directionnelle SVG style Windy — pointe dans la direction d'où vient le vent */
function WindArrow({ deg, color = '#38bdf8', size = 28 }: { deg: number; color?: string; size?: number }) {
  // La flèche pointe vers la direction d'où vient le vent (convention météo)
  // On rotate de (deg + 180) pour que la flèche pointe dans la direction du vent
  const rotate = deg + 180
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      style={{ transform: `rotate(${rotate}deg)`, display: 'inline-block', flexShrink: 0 }}
    >
      {/* Corps de la flèche */}
      <line x1="12" y1="20" x2="12" y2="5" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Pointe */}
      <polyline points="8,10 12,4 16,10" fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

/** Flèche de houle — plus épaisse, style vague */
function SwellArrow({ deg, size = 26 }: { deg: number; size?: number }) {
  const rotate = deg + 180
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      style={{ transform: `rotate(${rotate}deg)`, display: 'inline-block', flexShrink: 0 }}
    >
      <line x1="12" y1="21" x2="12" y2="6" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />
      <polyline points="7,12 12,5 17,12" fill="#7dd3fc" stroke="#7dd3fc" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Petite vaguelette */}
      <path d="M7,19 Q9.5,17 12,19 Q14.5,21 17,19" fill="none" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

/** Barre de force Beaufort style Windy */
function BeaufortBar({ force }: { force: number }) {
  const color = getBeaufortColor(force as import('@/types').BeaufortScale)
  const segments = 12
  return (
    <div className="flex gap-0.5 items-end h-4">
      {Array.from({ length: segments }, (_, i) => (
        <div
          key={i}
          className="w-1.5 rounded-sm"
          style={{
            height: `${((i + 1) / segments) * 100}%`,
            backgroundColor: i < force ? color : 'rgba(100,116,139,0.2)',
          }}
        />
      ))}
    </div>
  )
}

/** Zone bulletin — CROSS-MF */
const MF_ZONES = [
  { id: 'FQLR10', name: 'Manche Est / Pas-de-Calais' },
  { id: 'FQLR20', name: 'Manche Centrale' },
  { id: 'FQLR30', name: 'Manche Ouest / Iroise' },
  { id: 'FQLR40', name: 'Atlantique Nord (Gascogne Nord)' },
  { id: 'FQLR50', name: 'Atlantique Sud (Gascogne Sud)' },
  { id: 'FQLR60', name: 'Méditerranée Ouest (Lion / Mistral)' },
  { id: 'FQLR70', name: 'Méditerranée Est (Ligure / Corse)' },
]

export default function MarinePage() {
  const [tab, setTab] = useState('vent')
  const [bulletinZone, setBulletinZone] = useState('FQLR30')
  const selectedLat = useLocationStore((s) => s.selectedLocation?.lat)
  const selectedLon = useLocationStore((s) => s.selectedLocation?.lon)
  const currentLat  = useLocationStore((s) => s.currentPosition?.lat)
  const currentLon  = useLocationStore((s) => s.currentPosition?.lon)
  const lat = selectedLat ?? currentLat
  const lon = selectedLon ?? currentLon
  const coords = lat != null && lon != null ? { lat, lon } : null
  const { units } = useSettingsStore()
  const { data: marine, isLoading, error } = useMarineWeather(coords ?? undefined)
  const { data: tides, isLoading: tidesLoading } = useTides(coords ?? undefined)

  const tabs = [
    { id: 'vent',    label: 'Vent' },
    { id: 'houle',   label: 'Houle' },
    { id: 'bulletin', label: 'Bulletin MF' },
    { id: 'tides',   label: 'Marées' },
  ]

  if (!coords) {
    return (
      <div className="p-4">
        <Alert type="info" title="Position requise">
          Activez la géolocalisation pour afficher la météo marine.
        </Alert>
      </div>
    )
  }

  const now = marine?.hourly?.[0]
  const beaufort = now ? getBeaufortFromMs(now.wind_speed_10m) : 0
  const beaufortColor = getBeaufortColor(beaufort)

  return (
    <div className="space-y-3 p-4">
      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {isLoading && tab !== 'tides' && tab !== 'bulletin' && (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      )}
      {error && (
        <Alert type="error" title="Erreur données marines">
          Impossible de charger les données Open-Meteo.
        </Alert>
      )}

      {/* ── VENT style Windy ── */}
      {tab === 'vent' && now && marine && (
        <div className="space-y-3">
          {/* Carte principale vent actuel */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Vent en surface</p>
                <div className="flex items-center gap-3">
                  <WindArrow deg={now.wind_direction_10m} color={beaufortColor} size={36} />
                  <div>
                    <p className="text-3xl font-bold" style={{ color: beaufortColor }}>
                      {formatWindSpeed(now.wind_speed_10m, units)}
                    </p>
                    <p className="text-sm text-slate-400">
                      {getWindDirectionLabel(now.wind_direction_10m)} · {now.wind_direction_10m.toFixed(0)}°
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <BeaufortBar force={beaufort} />
                <p className="text-xs font-semibold mt-1" style={{ color: beaufortColor }}>
                  Bf {beaufort} — {getBeaufortLabel(beaufort)}
                </p>
              </div>
            </div>

            {/* Rafales */}
            {now.wind_gusts_10m > 0 && (
              <div className="flex items-center gap-2 py-2 px-3 rounded-xl mb-2" style={{ backgroundColor: 'var(--bg-base)' }}>
                <span className="text-amber-400 text-base">💨</span>
                <div>
                  <p className="text-xs text-slate-500">Rafales</p>
                  <p className="font-semibold text-amber-300 text-sm">
                    {formatWindSpeed(now.wind_gusts_10m, units)}
                    <span className="text-slate-500 font-normal ml-1 text-xs">
                      (+{formatWindSpeed(now.wind_gusts_10m - now.wind_speed_10m, units)})
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Vent à 80m (si dispo) */}
            {now.wind_speed_80m != null && (
              <div className="flex items-center gap-2 py-2 px-3 rounded-xl" style={{ backgroundColor: 'var(--bg-base)' }}>
                <WindArrow deg={now.wind_direction_80m ?? now.wind_direction_10m} color="#64748b" size={20} />
                <div>
                  <p className="text-xs text-slate-500">Vent à 80 m (altitude)</p>
                  <p className="font-medium text-slate-300 text-sm">
                    {formatWindSpeed(now.wind_speed_80m, units)}
                    {now.wind_direction_80m != null && ` · ${getWindDirectionLabel(now.wind_direction_80m)}`}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Tableau prévisions vent 48h */}
          <Card padding="none">
            <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-semibold text-slate-100 text-sm">Vent · Prévisions 48h</h3>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {marine.hourly.slice(0, 48).filter((_, i) => i % 3 === 0).map((h) => {
                const bf = getBeaufortFromMs(h.wind_speed_10m)
                const bfColor = getBeaufortColor(bf)
                return (
                  <div key={h.dt} className="flex items-center px-4 py-2.5 gap-3">
                    <span className="text-slate-500 text-xs w-12 flex-shrink-0">
                      {format(new Date(h.dt * 1000), 'EEE HH', { locale: fr })}h
                    </span>
                    <WindArrow deg={h.wind_direction_10m} color={bfColor} size={20} />
                    <div className="flex-1">
                      <span className="font-semibold text-sm" style={{ color: bfColor }}>
                        {formatWindSpeed(h.wind_speed_10m, units)}
                      </span>
                      <span className="text-xs text-slate-500 ml-1.5">
                        {getWindDirectionLabel(h.wind_direction_10m)}
                      </span>
                    </div>
                    {h.wind_gusts_10m > h.wind_speed_10m * 1.2 && (
                      <span className="text-xs text-amber-400 flex-shrink-0">
                        raf. {formatWindSpeed(h.wind_gusts_10m, units)}
                      </span>
                    )}
                    <span className="text-xs font-medium flex-shrink-0" style={{ color: bfColor }}>
                      Bf{bf}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── HOULE ── */}
      {tab === 'houle' && now && marine && (
        <div className="space-y-3">
          {/* Houle combinée actuelle */}
          <Card>
            <p className="text-xs text-slate-500 mb-3">État de la mer actuel</p>
            <div className="flex items-center gap-4 mb-4">
              <SwellArrow deg={now.wave_direction ?? 0} size={42} />
              <div>
                <p className="text-3xl font-bold text-sky-300">
                  {now.wave_height.toFixed(1)} m
                </p>
                <p className="text-sm text-slate-400">
                  {getDouglasLabel(getDouglasFromHeight(now.wave_height))} · {getDouglasFromHeight(now.wave_height)}/9
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--bg-base)' }}>
                <p className="text-[10px] text-slate-500 mb-0.5">Période</p>
                <p className="font-semibold text-slate-100 text-sm">
                  {now.wave_period?.toFixed(0) ?? '—'} s
                </p>
              </div>
              <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--bg-base)' }}>
                <p className="text-[10px] text-slate-500 mb-0.5">Direction</p>
                <div className="flex items-center gap-1.5">
                  <SwellArrow deg={now.wave_direction ?? 0} size={16} />
                  <p className="font-semibold text-slate-100 text-sm">
                    {now.wave_direction != null ? `${getWindDirectionLabel(now.wave_direction)} ${now.wave_direction.toFixed(0)}°` : '—'}
                  </p>
                </div>
              </div>

              {/* Houle primaire (swell) */}
              {now.swell_wave_height != null && (
                <>
                  <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--bg-base)' }}>
                    <p className="text-[10px] text-slate-500 mb-0.5">Houle primaire</p>
                    <p className="font-semibold text-sky-400 text-sm">
                      {now.swell_wave_height.toFixed(1)} m
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {now.swell_wave_period?.toFixed(0) ?? '—'}s · {now.swell_wave_direction != null ? getWindDirectionLabel(now.swell_wave_direction) : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--bg-base)' }}>
                    <p className="text-[10px] text-slate-500 mb-0.5">Mer du vent</p>
                    <p className="font-semibold text-teal-400 text-sm">
                      {now.wind_wave_height?.toFixed(1) ?? '—'} m
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {now.wind_wave_period?.toFixed(0) ?? '—'}s · {now.wind_wave_direction != null ? getWindDirectionLabel(now.wind_wave_direction) : '—'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Tableau houle 48h */}
          <Card padding="none">
            <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-semibold text-slate-100 text-sm">Houle · Prévisions 48h</h3>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {marine.hourly.slice(0, 48).filter((_, i) => i % 3 === 0).map((h) => {
                const douglas = getDouglasFromHeight(h.wave_height)
                const waveColor = douglas <= 1 ? '#4ade80' : douglas <= 2 ? '#86efac' : douglas <= 3 ? '#fbbf24' : douglas <= 4 ? '#f97316' : '#ef4444'
                return (
                  <div key={h.dt} className="flex items-center px-4 py-2.5 gap-3">
                    <span className="text-slate-500 text-xs w-12 flex-shrink-0">
                      {format(new Date(h.dt * 1000), 'EEE HH', { locale: fr })}h
                    </span>
                    <SwellArrow deg={h.wave_direction ?? 0} size={20} />
                    <div className="flex-1">
                      <span className="font-semibold text-sm" style={{ color: waveColor }}>
                        {h.wave_height.toFixed(1)} m
                      </span>
                      <span className="text-xs text-slate-500 ml-1.5">
                        {h.wave_period?.toFixed(0)}s · {h.wave_direction != null ? getWindDirectionLabel(h.wave_direction) : ''}
                      </span>
                    </div>
                    {h.swell_wave_height != null && (
                      <span className="text-xs text-sky-500 flex-shrink-0">
                        houle {h.swell_wave_height.toFixed(1)}m
                      </span>
                    )}
                    <Badge color={douglas <= 2 ? 'green' : douglas <= 3 ? 'amber' : 'red'}>
                      D{douglas}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── BULLETIN MF ── */}
      {tab === 'bulletin' && (
        <div className="space-y-3">
          {/* Sélecteur de zone */}
          <Card>
            <p className="text-xs text-slate-500 mb-2">Zone maritime</p>
            <div className="space-y-1.5">
              {MF_ZONES.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setBulletinZone(z.id)}
                  className="w-full text-left px-3 py-2 rounded-xl border text-sm transition-colors"
                  style={{
                    backgroundColor: bulletinZone === z.id ? 'rgb(14 165 233 / 0.15)' : 'var(--bg-surface)',
                    borderColor: bulletinZone === z.id ? 'rgb(56 189 248 / 0.5)' : 'var(--border-default)',
                    color: bulletinZone === z.id ? 'rgb(125 211 252)' : 'var(--text-secondary)',
                  }}
                >
                  <span className={bulletinZone === z.id ? 'font-semibold' : ''}>{z.name}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Lien vers bulletin officiel */}
          <Card>
            <p className="text-xs text-slate-500 mb-2">Bulletin officiel Météo-France</p>
            <p className="text-sm text-slate-300 mb-3">
              Les bulletins côtiers officiels sont publiés en temps réel sur le portail Météo-France.
            </p>
            <a
              href={`https://marine.meteofrance.fr/bulletins-cotiers`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{ backgroundColor: 'rgb(14 165 233 / 0.15)', color: 'rgb(125 211 252)', border: '1px solid rgb(56 189 248 / 0.3)' }}
            >
              <span className="text-lg">🌊</span>
              <span>Ouvrir les bulletins côtiers MF</span>
              <span className="ml-auto text-sky-500">↗</span>
            </a>
            <a
              href={`https://marine.meteofrance.fr/previsions-meteo-marine`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium mt-2 transition-colors"
              style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
            >
              <span className="text-lg">📡</span>
              <span>Prévisions marine détaillées</span>
              <span className="ml-auto">↗</span>
            </a>
          </Card>

          {/* Données marines disponibles en temps réel */}
          {now && (
            <Card>
              <p className="text-xs text-slate-500 mb-3">Synthèse conditions actuelles</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-slate-400">Vent</span>
                  <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                    <WindArrow deg={now.wind_direction_10m} color={beaufortColor} size={16} />
                    {formatWindSpeed(now.wind_speed_10m, units)} {getWindDirectionLabel(now.wind_direction_10m)}
                    {' '}(Bf{beaufort})
                  </span>
                </div>
                {now.wind_gusts_10m > 0 && (
                  <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
                    <span className="text-slate-400">Rafales</span>
                    <span className="font-semibold text-amber-300">{formatWindSpeed(now.wind_gusts_10m, units)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-slate-400">Mer</span>
                  <span className="font-semibold text-sky-300 flex items-center gap-1.5">
                    <SwellArrow deg={now.wave_direction ?? 0} size={16} />
                    {now.wave_height.toFixed(1)} m — {getDouglasLabel(getDouglasFromHeight(now.wave_height))}
                  </span>
                </div>
                {now.swell_wave_height != null && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Houle primaire</span>
                    <span className="font-semibold text-sky-400">
                      {now.swell_wave_height.toFixed(1)} m / {now.swell_wave_period?.toFixed(0)}s
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── MARÉES ── */}
      {tab === 'tides' && (
        <>
          {tidesLoading && <div className="flex justify-center py-10"><Spinner size="lg" /></div>}
          {tides && (
            <div className="space-y-3">
              <Card>
                <p className="text-xs text-slate-500 mb-1">Port de référence</p>
                <p className="text-lg font-semibold text-slate-100">{tides.harbourName}</p>
                <p className="text-sm text-slate-500">{tides.distance.toFixed(0)} km de votre position</p>
              </Card>
              <Card padding="none">
                <div className="divide-y divide-[var(--border-subtle)]">
                  {tides.events.slice(0, 12).map((ev, i) => (
                    <div key={i} className="flex items-center px-4 py-3 gap-3">
                      <Badge color={ev.type === 'PM' ? 'blue' : 'slate'}>{ev.type}</Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-100">
                          {format(new Date(ev.dt * 1000), "EEEE d MMM 'à' HH:mm", { locale: fr })}
                        </p>
                        <p className="text-xs text-slate-500">
                          {ev.height.toFixed(2)} m
                          {ev.coefficient != null && ` — Coeff. ${ev.coefficient}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
