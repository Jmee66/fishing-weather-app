import { useState } from 'react'
import Tabs from '@/components/ui/Tabs'
import Spinner from '@/components/ui/Spinner'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { useMarineWeather } from '@/hooks/useMarineWeather'
import { useAtmosphericWind } from '@/hooks/useAtmosphericWind'
import { useMarineConsensus } from '@/hooks/useMarineConsensus'
import { useWindGrid } from '@/hooks/useWindGrid'
import { useTides } from '@/hooks/useTides'
import WindParticleMap from '@/components/marine/WindParticleMap'
import WaveChart from '@/components/marine/WaveChart'
import { useLocationStore } from '@/stores/location.store'
import { getBeaufortFromMs, getBeaufortLabel, getBeaufortColor } from '@/utils/beaufort'
import { getDouglasFromHeight, getDouglasLabel } from '@/utils/douglas'
import { formatWindSpeed, getWindDirectionLabel } from '@/utils/units'
import { useSettingsStore } from '@/stores/settings.store'
import { MARINE_MODELS, WIND_MODELS } from '@/services/api/openmeteo.service'
import type { MarineModelId, WindModelId } from '@/services/api/openmeteo.service'
import type { UnitSystem } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

/** Flèche directionnelle SVG style Windy — pointe dans la direction d'où vient le vent */
function WindArrow({ deg, color = '#38bdf8', size = 28 }: { deg: number; color?: string; size?: number }) {
  const rotate = deg + 180
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      style={{ transform: `rotate(${rotate}deg)`, display: 'inline-block', flexShrink: 0 }}
    >
      <line x1="12" y1="20" x2="12" y2="5" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
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

/** Étoiles de fiabilité */
function Stars({ count, max = 5, color = '#fbbf24' }: { count: number; max?: number; color?: string }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ color: i < count ? color : 'rgba(100,116,139,0.3)', fontSize: '8px', lineHeight: 1 }}>★</span>
      ))}
    </span>
  )
}

/** Sélecteur de modèle marine avec indice de fiabilité statique */
function ModelSelector({ value, onChange }: { value: MarineModelId; onChange: (v: MarineModelId) => void }) {
  const selected = MARINE_MODELS.find((m) => m.id === value)
  return (
    <div className="mb-3">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {MARINE_MODELS.map((m) => {
          const isActive = value === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              title={`${m.desc}\nRésolution : ${m.resolution} km · Màj toutes les ${m.updateHz}h`}
              className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
              style={{
                backgroundColor: isActive ? 'rgb(14 165 233 / 0.2)' : 'var(--bg-surface)',
                borderColor:     isActive ? 'rgb(56 189 248 / 0.6)' : 'var(--border-default)',
                color:           isActive ? 'rgb(125 211 252)'      : 'var(--text-secondary)',
              }}
            >
              <span>{m.name}</span>
              <span className="ml-1.5 opacity-80">
                <Stars count={m.coastal} color={isActive ? '#7dd3fc' : '#64748b'} />
              </span>
            </button>
          )
        })}
      </div>
      {/* Détail du modèle sélectionné */}
      {selected && (
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-[10px]"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex-1">
            <span className="text-slate-300 font-medium">{selected.name}</span>
            <span className="text-slate-500 ml-1.5">{selected.note}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">Qualité</p>
              <Stars count={selected.stars} color="#fbbf24" />
            </div>
            <div className="text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">Côtier</p>
              <Stars count={selected.coastal} color="#38bdf8" />
            </div>
            <div className="text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">Résol.</p>
              <p className="text-slate-400">{selected.resolution} km</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">Màj</p>
              <p className="text-slate-400">{selected.updateHz}h</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Sélecteur de modèle vent atmosphérique (AROME, ECMWF, GFS…) */
function WindModelSelector({ value, onChange }: { value: WindModelId; onChange: (v: WindModelId) => void }) {
  const selected = WIND_MODELS.find((m) => m.id === value)
  return (
    <div className="mb-3">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Modèle vent</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {WIND_MODELS.map((m) => {
          const isActive = value === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              title={`${m.desc}\nRésolution : ${m.resolution} km · Màj toutes les ${m.updateHz}h`}
              className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
              style={{
                backgroundColor: isActive ? 'rgb(74 222 128 / 0.15)' : 'var(--bg-surface)',
                borderColor:     isActive ? 'rgb(74 222 128 / 0.5)'  : 'var(--border-default)',
                color:           isActive ? 'rgb(134 239 172)'       : 'var(--text-secondary)',
              }}
            >
              <span>{m.name}</span>
              <span className="ml-1.5 opacity-80">
                <Stars count={m.stars} color={isActive ? '#86efac' : '#64748b'} />
              </span>
            </button>
          )
        })}
      </div>
      {selected && (
        <div
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-[10px]"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex-1">
            <span className="text-slate-300 font-medium">{selected.name}</span>
            <span className="text-slate-500 ml-1.5">{selected.note}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">Résol.</p>
              <p className="text-slate-400">{selected.resolution} km</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">Màj</p>
              <p className="text-slate-400">{selected.updateHz}h</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-slate-600 mb-0.5">Zone</p>
              <p className="text-slate-400">{selected.available === 'france' ? '🇫🇷 FR' : '🌍 Global'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Zone bulletin — CROSS-MF avec position centrale de chaque zone */
const MF_ZONES = [
  { id: 'FQLR10', name: 'Manche Est / Pas-de-Calais',       lat: 51.0, lon:  1.5 },
  { id: 'FQLR20', name: 'Manche Centrale',                   lat: 49.5, lon: -1.0 },
  { id: 'FQLR30', name: 'Manche Ouest / Iroise',             lat: 48.2, lon: -5.0 },
  { id: 'FQLR40', name: 'Atlantique Nord (Gascogne Nord)',    lat: 46.5, lon: -3.5 },
  { id: 'FQLR50', name: 'Atlantique Sud (Gascogne Sud)',      lat: 44.0, lon: -2.5 },
  { id: 'FQLR60', name: 'Méditerranée Ouest (Lion / Mistral)',lat: 42.5, lon:  4.0 },
  { id: 'FQLR70', name: 'Méditerranée Est (Ligure / Corse)', lat: 43.5, lon:  8.0 },
]

/** Génère un résumé texte VHF-style depuis les données open-meteo */
function generateBulletinText(
  hourly: Array<{
    wind_speed_10m: number; wind_direction_10m: number; wind_gusts_10m: number;
    wave_height: number; wave_direction?: number | null; wave_period?: number | null;
    swell_wave_height?: number | null; swell_wave_period?: number | null; swell_wave_direction?: number | null;
  }>,
  units: UnitSystem
): string {
  if (!hourly || hourly.length === 0) return ''
  const now = hourly[0]
  const bf = getBeaufortFromMs(now.wind_speed_10m)
  const dir = getWindDirectionLabel(now.wind_direction_10m)
  const speed = formatWindSpeed(now.wind_speed_10m, units)
  const gusts = now.wind_gusts_10m > now.wind_speed_10m * 1.15
    ? `, rafales ${formatWindSpeed(now.wind_gusts_10m, units)}`
    : ''

  // Tendance vent sur 6h
  const h6 = hourly[6]
  const bf6 = getBeaufortFromMs(h6?.wind_speed_10m ?? now.wind_speed_10m)
  const windTrend = bf6 > bf + 1 ? 'en renforcement' : bf6 < bf - 1 ? 'en affaiblissement' : 'stable'

  // Mer
  const waveH = now.wave_height.toFixed(1)
  const douglasN = getDouglasFromHeight(now.wave_height)
  const douglasLabel = getDouglasLabel(douglasN)
  const wavePeriod = now.wave_period != null ? `, période ${now.wave_period.toFixed(0)} s` : ''
  const waveDir = now.wave_direction != null ? ` de ${getWindDirectionLabel(now.wave_direction)}` : ''

  // Houle primaire
  const swellPart = now.swell_wave_height != null && now.swell_wave_height > 0.3
    ? ` Houle ${now.swell_wave_height.toFixed(1)} m${now.swell_wave_period != null ? `/${now.swell_wave_period.toFixed(0)}s` : ''}${now.swell_wave_direction != null ? ` de ${getWindDirectionLabel(now.swell_wave_direction)}` : ''}.`
    : ''

  // Tendance mer sur 6h
  const waveH6 = h6?.wave_height ?? now.wave_height
  const seaTrend = waveH6 > now.wave_height * 1.2 ? ' État de la mer en aggravation.' : waveH6 < now.wave_height * 0.8 ? ' État de la mer en amélioration.' : ''

  return `Vent ${dir} force ${bf} Beaufort (${speed}${gusts}), ${windTrend}. Mer ${douglasLabel.toLowerCase()}, ${waveH} m${waveDir}${wavePeriod}.${swellPart}${seaTrend}`
}

export default function MarinePage() {
  const [tab, setTab] = useState('vent')
  const [bulletinZone, setBulletinZone] = useState('FQLR30')
  const [marineModel, setMarineModel] = useState<MarineModelId>('auto')
  const [windModel, setWindModel] = useState<WindModelId>('arome_france_hd')
  const selectedLat = useLocationStore((s) => s.selectedLocation?.lat)
  const selectedLon = useLocationStore((s) => s.selectedLocation?.lon)
  const currentLat  = useLocationStore((s) => s.currentPosition?.lat)
  const currentLon  = useLocationStore((s) => s.currentPosition?.lon)
  const setSelectedLocation = useLocationStore((s) => s.setSelectedLocation)
  const lat = selectedLat ?? currentLat
  const lon = selectedLon ?? currentLon
  const coords = lat != null && lon != null ? { lat, lon } : null
  const { units } = useSettingsStore()
  // Données vent : modèle atmosphérique (AROME, ECMWF…)
  const { data: atmosWind, isLoading: atmosLoading, error: atmosError } = useAtmosphericWind(coords ?? undefined, windModel)
  // Données vagues/houle : modèle marine (mfwave, ecmwf_wam…)
  const { data: marine, isLoading: marineLoading, error: marineError } = useMarineWeather(coords ?? undefined, marineModel)
  const { data: tides, isLoading: tidesLoading } = useTides(coords ?? undefined)
  const { data: consensus, isLoading: consensusLoading } = useMarineConsensus(coords ?? undefined)
  const { data: windGrid, isLoading: windGridLoading } = useWindGrid(coords ?? undefined, windModel)
  // État de chargement global pour les onglets vent/voile
  const isLoading = atmosLoading

  const tabs = [
    { id: 'vent',    label: 'Vent' },
    { id: 'voile',   label: '⛵ Voile' },
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

  // now = données vent atmosphériques (onglets Vent/Voile)
  const now = atmosWind?.[0]
  // nowMarine = données vagues (onglet Houle)
  const nowMarine = marine?.hourly?.[0]
  const beaufort = now ? getBeaufortFromMs(now.wind_speed_10m) : 0
  const beaufortColor = getBeaufortColor(beaufort)

  return (
    <div className="space-y-3 p-4">
      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {/* Spinners selon l'onglet actif */}
      {tab === 'vent' && atmosLoading && (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      )}
      {tab === 'voile' && atmosLoading && (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      )}
      {tab === 'houle' && marineLoading && (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      )}

      {/* Erreurs */}
      {(tab === 'vent' || tab === 'voile') && atmosError && (
        <Alert type="error" title="Erreur données vent">
          {(() => {
            const msg = String((atmosError as Error)?.message ?? '')
            if (msg.includes('terrestre') || msg.includes('no data')) {
              return 'Position terrestre : pas de données disponibles. Choisissez une position côtière ou en mer.'
            }
            return `Impossible de charger les données vent (${WIND_MODELS.find(m => m.id === windModel)?.name}). Vérifiez votre connexion.`
          })()}
        </Alert>
      )}
      {tab === 'houle' && marineError && (
        <Alert type="error" title="Erreur données vagues">
          Impossible de charger les données vagues Open-Meteo. La position est peut-être terrestre.
        </Alert>
      )}

      {/* ── VENT ── */}
      {tab === 'vent' && now && (
        <div className="space-y-3">
          <WindModelSelector value={windModel} onChange={setWindModel} />

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

          </Card>

          {/* Tableau prévisions vent 48h (toutes les 3h) — source atmosphérique (AROME…) */}
          <Card padding="none">
            <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-semibold text-slate-100 text-sm">Vent · Prévisions 48h</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Source : {WIND_MODELS.find(m => m.id === windModel)?.name} · {WIND_MODELS.find(m => m.id === windModel)?.resolution} km
              </p>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {atmosWind.slice(0, 48).filter((_, i) => i % 3 === 0).map((h) => {
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

      {/* ── VOILE — Vent heure par heure pour navigation à voile ── */}
      {tab === 'voile' && (
        <div className="space-y-3">
          <WindModelSelector value={windModel} onChange={setWindModel} />

          {!atmosWind && !isLoading && (
            <Alert type="info" title="Pas de données">Aucune donnée vent disponible pour cette position.</Alert>
          )}

          {/* ── Mini-carte particules de vent style Windy ── */}
          <Card padding="none">
            <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">Champ de vent — Animation</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Grille 5×5 pts · Open-Meteo · ~20 km résol.</p>
              </div>
              {windGrid && <span className="text-[9px] text-green-400 font-medium">● En direct</span>}
            </div>
            <WindParticleMap
              coords={{ lat: lat!, lon: lon! }}
              windGrid={windGrid}
              loading={windGridLoading}
              height={260}
            />
          </Card>

          {/* ── Bandeau consensus multi-modèles ── */}
          {consensusLoading && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="w-3 h-3 rounded-full border border-slate-500 border-t-transparent animate-spin flex-shrink-0" />
              Analyse du consensus entre modèles…
            </div>
          )}
          {consensus && !consensusLoading && (() => {
            const { confidence, confidenceLabel, confidenceColor, snapshots, std_wind_speed, std_wave_height, mean_wind_speed, mean_wave_height, trend } = consensus
            const barWidth = `${confidence}%`
            return (
              <Card>
                {/* En-tête score */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎯</span>
                    <p className="text-xs font-semibold text-slate-300">Consensus {snapshots.length} modèles</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: confidenceColor }}>
                    {confidence}%
                  </span>
                </div>

                {/* Barre de confiance */}
                <div className="h-2 rounded-full mb-1 overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: barWidth, backgroundColor: confidenceColor }}
                  />
                </div>
                <p className="text-[10px] mb-3 font-medium" style={{ color: confidenceColor }}>
                  {confidenceLabel} entre {snapshots.map((s) => s.model === 'mfwave' ? 'MF Wave' : s.model === 'ecmwf_wam' ? 'ECMWF' : 'GFS').join(' · ')}
                </p>

                {/* Plage de valeurs entre modèles */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-xl p-2" style={{ backgroundColor: 'var(--bg-base)' }}>
                    <p className="text-[9px] text-slate-600 mb-0.5 uppercase">Vent · moyenne ± écart</p>
                    <p className="text-xs font-semibold text-slate-200">
                      {formatWindSpeed(mean_wind_speed, units)}
                      <span className="text-slate-500 font-normal ml-1">
                        ±{formatWindSpeed(std_wind_speed, units)}
                      </span>
                    </p>
                  </div>
                  <div className="rounded-xl p-2" style={{ backgroundColor: 'var(--bg-base)' }}>
                    <p className="text-[9px] text-slate-600 mb-0.5 uppercase">Houle · moyenne ± écart</p>
                    <p className="text-xs font-semibold text-slate-200">
                      {mean_wave_height.toFixed(2)} m
                      <span className="text-slate-500 font-normal ml-1">
                        ±{std_wave_height.toFixed(2)} m
                      </span>
                    </p>
                  </div>
                </div>

                {/* Comparaison par modèle */}
                <div className="space-y-1 mb-3">
                  {snapshots.map((s) => {
                    const modelName = s.model === 'mfwave' ? 'MF Wave' : s.model === 'ecmwf_wam' ? 'ECMWF WAM' : 'GFS WWATCH'
                    const modelInfo = MARINE_MODELS.find((m) => m.id === s.model)
                    const windBf = getBeaufortFromMs(s.wind_speed)
                    const bfCol = getBeaufortColor(windBf)
                    const windDiff = s.wind_speed - mean_wind_speed
                    const waveDiff = s.wave_height - mean_wave_height
                    return (
                      <div key={s.model} className="flex items-center gap-2 text-[10px] py-1 px-2 rounded-lg"
                        style={{ backgroundColor: 'var(--bg-base)' }}>
                        <div className="flex-1">
                          <span className="text-slate-300 font-medium">{modelName}</span>
                          {modelInfo && (
                            <span className="ml-1 opacity-50">
                              <Stars count={modelInfo.coastal} color="#38bdf8" />
                            </span>
                          )}
                        </div>
                        <span style={{ color: bfCol }} className="font-semibold">
                          {formatWindSpeed(s.wind_speed, units)}
                        </span>
                        <span className={windDiff > 0.5 ? 'text-red-400' : windDiff < -0.5 ? 'text-green-400' : 'text-slate-500'}>
                          {windDiff > 0 ? '+' : ''}{formatWindSpeed(Math.abs(windDiff), units)}
                        </span>
                        <span className="text-sky-400 ml-1">{s.wave_height.toFixed(1)}m</span>
                        <span className={waveDiff > 0.15 ? 'text-red-400' : waveDiff < -0.15 ? 'text-green-400' : 'text-slate-500'}>
                          {waveDiff > 0 ? '+' : ''}{Math.abs(waveDiff).toFixed(2)}m
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Mini sparkline tendance 12h — enveloppe min/max vent */}
                {trend.length >= 4 && (() => {
                  const W = 280, H = 32, PAD = 4
                  const maxW = Math.max(...trend.map((t) => t.max_wind), 0.1)
                  const toX = (i: number) => PAD + (i / (trend.length - 1)) * (W - PAD * 2)
                  const toY = (v: number) => H - PAD - (v / maxW) * (H - PAD * 2)
                  const pathMean = trend.map((t, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(t.mean_wind).toFixed(1)}`).join(' ')
                  const pathEnv = [
                    ...trend.map((t, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(t.max_wind).toFixed(1)}`),
                    ...[...trend].reverse().map((t, i) => `L${toX(trend.length - 1 - i).toFixed(1)},${toY(t.min_wind).toFixed(1)}`),
                    'Z'
                  ].join(' ')
                  return (
                    <div>
                      <p className="text-[9px] text-slate-600 mb-1">Enveloppe vent 12h (min/max entre modèles)</p>
                      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
                        <path d={pathEnv} fill={`${confidenceColor}20`} />
                        <path d={pathMean} fill="none" stroke={confidenceColor} strokeWidth="1.5" strokeLinejoin="round" />
                        {trend.map((_, i) => i % 3 === 0 && (
                          <text key={i} x={toX(i)} y={H - 1} textAnchor="middle" fontSize="6" fill="#475569">
                            +{i}h
                          </text>
                        ))}
                      </svg>
                    </div>
                  )
                })()}

                <p className="text-[9px] text-slate-600 mt-2">
                  Données Open-Meteo · Mis à jour il y a &lt; 15 min · {confidence >= 80 ? 'Prévision fiable' : confidence >= 60 ? 'Légère incertitude' : '⚠ Forte incertitude — vérifier Windy/Meteoconsult'}
                </p>
              </Card>
            )
          })()}

          {now && (() => {
            const gustRatio = now.wind_gusts_10m / Math.max(now.wind_speed_10m, 0.1)
            const isSqually = gustRatio > 1.5
            const safetyLevel = beaufort <= 3 ? 'Conditions favorables'
              : beaufort <= 5 ? 'Conditions modérées — prudence'
              : beaufort <= 7 ? 'Conditions difficiles — expérimentés seulement'
              : 'Conditions dangereuses — ne pas sortir'
            const safetyColor = beaufort <= 3 ? '#4ade80' : beaufort <= 5 ? '#fbbf24' : beaufort <= 7 ? '#f97316' : '#ef4444'

            return (
              <>
                {/* Résumé navigateur */}
                <Card>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⛵</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: safetyColor }}>{safetyLevel}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {getWindDirectionLabel(now.wind_direction_10m)} {now.wind_direction_10m.toFixed(0)}° —{' '}
                        <span style={{ color: beaufortColor }}>Bf {beaufort} ({formatWindSpeed(now.wind_speed_10m, units)})</span>
                        {isSqually && <span className="text-amber-400 ml-1">— Rafales irrégulières ⚠️</span>}
                      </p>
                      {now.wind_gusts_10m > 0 && (
                        <p className="text-xs text-amber-400 mt-0.5">
                          Rafales max : {formatWindSpeed(now.wind_gusts_10m, units)}{' '}
                          ({gustRatio > 1 ? `×${gustRatio.toFixed(1)} vent moyen` : ''})
                        </p>
                      )}
                      {/* Vagues depuis le modèle marine si disponible */}
                      {nowMarine && nowMarine.wave_height > 0 && (
                        <p className="text-xs text-sky-400 mt-0.5">
                          Mer : {nowMarine.wave_height.toFixed(1)} m — {getDouglasLabel(getDouglasFromHeight(nowMarine.wave_height))}
                          {nowMarine.wave_period != null && ` · période ${nowMarine.wave_period.toFixed(0)}s`}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <WindArrow deg={now.wind_direction_10m} color={beaufortColor} size={40} />
                      <BeaufortBar force={beaufort} />
                    </div>
                  </div>
                </Card>

                {/* Tableau heure par heure — 24h : vent AROME + vagues marine fusionnés */}
                <Card padding="none">
                  <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                    <h3 className="font-semibold text-slate-100 text-sm">Vent heure par heure — 24h</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Vent : {WIND_MODELS.find(m => m.id === windModel)?.name} {WIND_MODELS.find(m => m.id === windModel)?.resolution} km
                      {marine && ' · Mer : MF/ECMWF'}
                    </p>
                  </div>
                  {/* En-tête colonnes */}
                  <div className="grid grid-cols-[3rem_1.5rem_3.5rem_3.5rem_2.5rem_3rem] gap-1 px-3 py-1.5 border-b border-[var(--border-subtle)]">
                    <span className="text-[9px] text-slate-600 uppercase">Heure</span>
                    <span className="text-[9px] text-slate-600 uppercase">Dir.</span>
                    <span className="text-[9px] text-slate-600 uppercase">Vent</span>
                    <span className="text-[9px] text-slate-600 uppercase">Rafales</span>
                    <span className="text-[9px] text-slate-600 uppercase">Bf</span>
                    <span className="text-[9px] text-slate-600 uppercase">Mer</span>
                  </div>
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {atmosWind.slice(0, 24).map((h, idx) => {
                      const bf = getBeaufortFromMs(h.wind_speed_10m)
                      const bfColor = getBeaufortColor(bf)
                      const gRatio = h.wind_gusts_10m / Math.max(h.wind_speed_10m, 0.1)
                      const gustWarning = gRatio > 1.8
                      // Vagues depuis le modèle marine (index aligné par heure)
                      const waveH = marine?.hourly?.[idx]?.wave_height ?? 0
                      const dg = getDouglasFromHeight(waveH)
                      const waveColor = dg <= 1 ? '#4ade80' : dg <= 2 ? '#86efac' : dg <= 3 ? '#fbbf24' : dg <= 4 ? '#f97316' : '#ef4444'
                      const isNow = idx === 0
                      return (
                        <div
                          key={h.dt}
                          className="grid grid-cols-[3rem_1.5rem_3.5rem_3.5rem_2.5rem_3rem] gap-1 items-center px-3 py-2"
                          style={{ backgroundColor: isNow ? 'rgb(14 165 233 / 0.06)' : undefined }}
                        >
                          {/* Heure */}
                          <span className="text-xs text-slate-400 font-mono">
                            {isNow ? 'maint.' : format(new Date(h.dt * 1000), 'HH:mm')}
                          </span>
                          {/* Vecteur direction */}
                          <WindArrow deg={h.wind_direction_10m} color={bfColor} size={16} />
                          {/* Vitesse */}
                          <span className="text-xs font-semibold" style={{ color: bfColor }}>
                            {formatWindSpeed(h.wind_speed_10m, units)}
                          </span>
                          {/* Rafales */}
                          <span className={`text-xs ${gustWarning ? 'text-amber-300 font-semibold' : 'text-slate-500'}`}>
                            {h.wind_gusts_10m > 0 ? formatWindSpeed(h.wind_gusts_10m, units) : '—'}
                            {gustWarning && ' ⚠'}
                          </span>
                          {/* Beaufort */}
                          <span className="text-xs font-bold" style={{ color: bfColor }}>
                            {bf}
                          </span>
                          {/* Mer (marine model) */}
                          <span className="text-xs" style={{ color: waveColor }}>
                            {waveH > 0 ? `${waveH.toFixed(1)}m` : '—'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {/* Légende Beaufort simplifiée */}
                <Card>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Référence Beaufort</p>
                  <div className="grid grid-cols-2 gap-1">
                    {([
                      [0, '0 — Calme (< 1 kt)'],
                      [1, '1-2 — Très légère brise'],
                      [3, '3 — Petite brise (7-10 kt)'],
                      [4, '4 — Jolie brise (11-16 kt)'],
                      [5, '5 — Bonne brise (17-21 kt)'],
                      [6, '6 — Vent frais (22-27 kt)'],
                      [7, '7 — Grand frais (28-33 kt)'],
                      [8, '8 — Coup de vent (34-40 kt)'],
                      [9, '9 — Fort coup de vent'],
                      [10, '10+ — Tempête'],
                    ] as [number, string][]).map(([force, label]) => (
                      <div key={force} className="flex items-center gap-1.5 text-[10px]">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getBeaufortColor(force as import('@/types').BeaufortScale) }}
                        />
                        <span className="text-slate-400">{label}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Sources externes pré-géolocalisées */}
                <Card>
                  <p className="text-xs text-slate-500 mb-1">Sources de référence pour navigation côtière</p>
                  <p className="text-[10px] text-slate-600 mb-3">
                    Résolution locale jusqu'à 1 km · Post-traitement expert · Recommandées pour navigation
                  </p>
                  <div className="space-y-2">
                    <a
                      href={`https://www.windy.com/${lat?.toFixed(3)}/${lon?.toFixed(3)}?${lat?.toFixed(3)},${lon?.toFixed(3)},11`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                      style={{ backgroundColor: 'rgb(99 102 241 / 0.15)', color: 'rgb(165 180 252)', border: '1px solid rgb(99 102 241 / 0.35)' }}
                    >
                      <span className="text-base flex-shrink-0">🌬️</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs">Windy.com</p>
                        <p className="text-[10px] opacity-70">ECMWF · GFS · ICON — multi-modèles visuels</p>
                      </div>
                      <span className="text-indigo-400 flex-shrink-0">↗</span>
                    </a>
                    <a
                      href={`https://marine.meteoconsult.fr/meteo-marine/carte-marine`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                      style={{ backgroundColor: 'rgb(14 165 233 / 0.12)', color: 'rgb(125 211 252)', border: '1px solid rgb(56 189 248 / 0.3)' }}
                    >
                      <span className="text-base flex-shrink-0">⚓</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs">Meteoconsult Marine</p>
                        <p className="text-[10px] opacity-70">ENSMAR · Météo-France · résolution 1 km côtier</p>
                      </div>
                      <span className="text-sky-400 flex-shrink-0">↗</span>
                    </a>
                    <a
                      href={`https://meteofrance.com/meteo-marine`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                      style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                    >
                      <span className="text-base flex-shrink-0">🇫🇷</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs">Météo-France Marine</p>
                        <p className="text-[10px] opacity-70">Bulletins côtiers officiels · 3×/jour</p>
                      </div>
                      <span className="flex-shrink-0">↗</span>
                    </a>
                  </div>
                </Card>
              </>
            )
          })()}
        </div>
      )}

      {/* ── HOULE ── */}
      {tab === 'houle' && nowMarine && marine && (
        <div className="space-y-3">
          <ModelSelector value={marineModel} onChange={setMarineModel} />

          {/* Houle combinée actuelle */}
          <Card>
            <p className="text-xs text-slate-500 mb-3">État de la mer actuel</p>
            <div className="flex items-center gap-4 mb-4">
              <SwellArrow deg={nowMarine.wave_direction ?? 0} size={42} />
              <div>
                <p className="text-3xl font-bold text-sky-300">
                  {nowMarine.wave_height.toFixed(1)} m
                </p>
                <p className="text-sm text-slate-400">
                  {getDouglasLabel(getDouglasFromHeight(nowMarine.wave_height))} · {getDouglasFromHeight(nowMarine.wave_height)}/9
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--bg-base)' }}>
                <p className="text-[10px] text-slate-500 mb-0.5">Période</p>
                <p className="font-semibold text-slate-100 text-sm">
                  {nowMarine.wave_period?.toFixed(0) ?? '—'} s
                </p>
              </div>
              <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--bg-base)' }}>
                <p className="text-[10px] text-slate-500 mb-0.5">Direction</p>
                <div className="flex items-center gap-1.5">
                  <SwellArrow deg={nowMarine.wave_direction ?? 0} size={16} />
                  <p className="font-semibold text-slate-100 text-sm">
                    {nowMarine.wave_direction != null ? `${getWindDirectionLabel(nowMarine.wave_direction)} ${nowMarine.wave_direction.toFixed(0)}°` : '—'}
                  </p>
                </div>
              </div>

              {nowMarine.swell_wave_height != null && (
                <>
                  <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--bg-base)' }}>
                    <p className="text-[10px] text-slate-500 mb-0.5">Houle primaire</p>
                    <p className="font-semibold text-sky-400 text-sm">
                      {nowMarine.swell_wave_height.toFixed(1)} m
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {nowMarine.swell_wave_period?.toFixed(0) ?? '—'}s · {nowMarine.swell_wave_direction != null ? getWindDirectionLabel(nowMarine.swell_wave_direction) : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--bg-base)' }}>
                    <p className="text-[10px] text-slate-500 mb-0.5">Mer du vent</p>
                    <p className="font-semibold text-teal-400 text-sm">
                      {nowMarine.wind_wave_height?.toFixed(1) ?? '—'} m
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {nowMarine.wind_wave_period?.toFixed(0) ?? '—'}s · {nowMarine.wind_wave_direction != null ? getWindDirectionLabel(nowMarine.wind_wave_direction) : '—'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Graphique houle 48h */}
          <Card>
            <p className="text-xs text-slate-500 mb-2">Évolution 48h</p>
            <WaveChart hourly={marine.hourly} />
          </Card>

          {/* Tableau houle 48h (toutes les 3h) */}
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
            <p className="text-xs text-slate-500 mb-1">Zone maritime</p>
            <p className="text-[10px] text-slate-600 mb-2">Sélectionner une zone centre les données sur cette zone</p>
            <div className="space-y-1.5">
              {MF_ZONES.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => {
                    setBulletinZone(z.id)
                    setSelectedLocation({ lat: z.lat, lon: z.lon, name: z.name })
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl border text-sm transition-colors"
                  style={{
                    backgroundColor: bulletinZone === z.id ? 'rgb(14 165 233 / 0.15)' : 'var(--bg-surface)',
                    borderColor: bulletinZone === z.id ? 'rgb(56 189 248 / 0.5)' : 'var(--border-default)',
                    color: bulletinZone === z.id ? 'rgb(125 211 252)' : 'var(--text-secondary)',
                  }}
                >
                  <span className={bulletinZone === z.id ? 'font-semibold' : ''}>{z.name}</span>
                  {bulletinZone === z.id && (
                    <span className="ml-1 text-[10px] text-sky-500 font-normal">· données chargées</span>
                  )}
                </button>
              ))}
            </div>
          </Card>

          {/* Résumé texte auto-généré style VHF/radio maritime */}
          {now && marine && atmosWind && (() => {
            // Fusionner vent atmosWind + vagues marine pour le bulletin
            const bulletinHourly = atmosWind.map((w, i) => ({
              ...w,
              wave_height: marine.hourly[i]?.wave_height ?? 0,
              wave_direction: marine.hourly[i]?.wave_direction ?? null,
              wave_period: marine.hourly[i]?.wave_period ?? null,
              swell_wave_height: marine.hourly[i]?.swell_wave_height ?? null,
              swell_wave_period: marine.hourly[i]?.swell_wave_period ?? null,
              swell_wave_direction: marine.hourly[i]?.swell_wave_direction ?? null,
            }))
            const bulletinText = generateBulletinText(bulletinHourly, units)
            return (
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">📻</span>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Résumé conditions — {MF_ZONES.find(z => z.id === bulletinZone)?.name}</p>
                </div>
                <div
                  className="rounded-xl p-3 text-sm leading-relaxed font-medium"
                  style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary, #e2e8f0)', borderLeft: '3px solid rgb(56 189 248 / 0.5)' }}
                >
                  {bulletinText}
                </div>
                <p className="text-[10px] text-slate-600 mt-2">
                  Vent : {WIND_MODELS.find(m => m.id === windModel)?.name} · Vagues : {MARINE_MODELS.find(m => m.id === marineModel)?.name}
                  {' · '}{format(new Date(now.dt * 1000), "d MMM à HH:mm", { locale: fr })}
                </p>
              </Card>
            )
          })()}

          {/* Synthèse étendue */}
          {now && marine && nowMarine && (
            <Card>
              <p className="text-xs text-slate-500 mb-3">
                Synthèse conditions actuelles — {MF_ZONES.find(z => z.id === bulletinZone)?.name}
              </p>

              {/* Vent (source atmosphérique AROME…) */}
              <div className="mb-3 pb-3 border-b border-[var(--border-subtle)]">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Vent — {WIND_MODELS.find(m => m.id === windModel)?.name}</p>
                <div className="flex items-center gap-2 mb-1">
                  <WindArrow deg={now.wind_direction_10m} color={beaufortColor} size={22} />
                  <span className="text-lg font-bold" style={{ color: beaufortColor }}>
                    {formatWindSpeed(now.wind_speed_10m, units)}
                  </span>
                  <span className="text-sm text-slate-300">
                    {getWindDirectionLabel(now.wind_direction_10m)} · Bf {beaufort} — {getBeaufortLabel(beaufort)}
                  </span>
                </div>
                {now.wind_gusts_10m > 0 && (
                  <p className="text-sm text-amber-300 ml-8">
                    Rafales jusqu'à {formatWindSpeed(now.wind_gusts_10m, units)}
                  </p>
                )}
                {atmosWind && atmosWind.length >= 12 && (() => {
                  const h6  = atmosWind[6]
                  const h12 = atmosWind[12]
                  const bf6  = getBeaufortFromMs(h6.wind_speed_10m)
                  const bf12 = getBeaufortFromMs(h12.wind_speed_10m)
                  return (
                    <div className="flex gap-3 mt-2 ml-8 text-xs text-slate-500">
                      <span>Dans 6h : <span style={{ color: getBeaufortColor(bf6) }}>Bf {bf6} {formatWindSpeed(h6.wind_speed_10m, units)}</span></span>
                      <span>Dans 12h : <span style={{ color: getBeaufortColor(bf12) }}>Bf {bf12} {formatWindSpeed(h12.wind_speed_10m, units)}</span></span>
                    </div>
                  )
                })()}
              </div>

              {/* État de la mer (source marine) */}
              <div className="mb-3 pb-3 border-b border-[var(--border-subtle)]">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">État de la mer — {MARINE_MODELS.find(m => m.id === marineModel)?.name}</p>
                <div className="flex items-center gap-2 mb-1">
                  <SwellArrow deg={nowMarine.wave_direction ?? 0} size={20} />
                  <span className="text-lg font-bold text-sky-300">{nowMarine.wave_height.toFixed(1)} m</span>
                  <span className="text-sm text-slate-300">
                    {getDouglasLabel(getDouglasFromHeight(nowMarine.wave_height))}
                    {nowMarine.wave_period != null && ` · ${nowMarine.wave_period.toFixed(0)}s`}
                    {nowMarine.wave_direction != null && ` · ${getWindDirectionLabel(nowMarine.wave_direction)}`}
                  </span>
                </div>
                {nowMarine.swell_wave_height != null && (
                  <p className="text-sm text-sky-400 ml-8">
                    Houle primaire {nowMarine.swell_wave_height.toFixed(1)} m
                    {nowMarine.swell_wave_period != null && ` / ${nowMarine.swell_wave_period.toFixed(0)}s`}
                    {nowMarine.swell_wave_direction != null && ` · ${getWindDirectionLabel(nowMarine.swell_wave_direction)}`}
                  </p>
                )}
                {marine.hourly.length >= 12 && (() => {
                  const h6  = marine.hourly[6]
                  const h12 = marine.hourly[12]
                  return (
                    <div className="flex gap-3 mt-2 ml-8 text-xs text-slate-500">
                      <span>Dans 6h : <span className="text-sky-400">{h6.wave_height.toFixed(1)} m</span></span>
                      <span>Dans 12h : <span className="text-sky-400">{h12.wave_height.toFixed(1)} m</span></span>
                    </div>
                  )
                })()}
              </div>

              {/* Prévisions 24h résumées (vent AROME + vagues marine) */}
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Prévisions 24h</p>
                <div className="space-y-1">
                  {(atmosWind ?? []).slice(0, 24).filter((_, i) => i % 6 === 0).map((h, i) => {
                    const bf = getBeaufortFromMs(h.wind_speed_10m)
                    const waveH = marine.hourly[i * 6]?.wave_height ?? 0
                    const waveDir = marine.hourly[i * 6]?.wave_direction ?? 0
                    return (
                      <div key={i} className="flex items-center gap-2 py-1 text-xs">
                        <span className="text-slate-500 w-12 flex-shrink-0">
                          {i === 0 ? 'Maint.' : `+${i * 6}h`}
                        </span>
                        <WindArrow deg={h.wind_direction_10m} color={getBeaufortColor(bf)} size={13} />
                        <span style={{ color: getBeaufortColor(bf) }} className="w-20 flex-shrink-0">
                          Bf {bf} {formatWindSpeed(h.wind_speed_10m, units)}
                        </span>
                        <SwellArrow deg={waveDir} size={13} />
                        <span className="text-sky-400">{waveH > 0 ? `${waveH.toFixed(1)} m` : '—'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Liens vers portail officiel MF */}
          <Card>
            <p className="text-xs text-slate-500 mb-2">Bulletin officiel Météo-France</p>
            <p className="text-sm text-slate-400 mb-3">
              Bulletins côtiers mis à jour 3×/jour (06h15, 12h15, 18h15) sur le portail Météo-France.
            </p>
            <a
              href="https://meteofrance.com/meteo-marine"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{ backgroundColor: 'rgb(14 165 233 / 0.15)', color: 'rgb(125 211 252)', border: '1px solid rgb(56 189 248 / 0.3)' }}
            >
              <span className="text-lg">🌊</span>
              <span>Météo-France — Météo Marine</span>
              <span className="ml-auto text-sky-500">↗</span>
            </a>
            <a
              href="https://donneespubliques.meteofrance.fr/?fond=produit&id_produit=304&id_rubrique=50"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium mt-2 transition-colors"
              style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
            >
              <span className="text-lg">📄</span>
              <span>Bulletins spéciaux marine (données publiques)</span>
              <span className="ml-auto">↗</span>
            </a>
          </Card>
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
