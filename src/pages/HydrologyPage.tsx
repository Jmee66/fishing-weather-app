import Spinner from '@/components/ui/Spinner'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'
import { useVigicrues } from '@/hooks/useVigicrues'
import { useLocationStore } from '@/stores/location.store'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { HydrologyData, RiverObservation } from '@/types'

const VIGILANCE: Record<number, { border: string; bg: string; text: string; dot: string }> = {
  1: { border: 'border-green-700/50',  bg: 'bg-green-900/20',  text: 'text-green-400',  dot: 'bg-green-400'  },
  2: { border: 'border-yellow-600/50', bg: 'bg-yellow-900/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  3: { border: 'border-orange-600/50', bg: 'bg-orange-900/20', text: 'text-orange-400', dot: 'bg-orange-500' },
  4: { border: 'border-red-600/50',    bg: 'bg-red-900/20',    text: 'text-red-400',    dot: 'bg-red-500'    },
}

const TREND: Record<string, { icon: string; label: string; color: string }> = {
  rising:  { icon: '↑', label: 'Montant',    color: 'text-red-400'    },
  falling: { icon: '↓', label: 'Descendant', color: 'text-sky-400'    },
  stable:  { icon: '→', label: 'Stable',     color: 'text-slate-400'  },
}

/** Mini sparkline SVG 72h */
function Sparkline({ obs, trend }: { obs: RiverObservation[]; trend: string }) {
  if (obs.length < 2) return null
  const W = 200, H = 36
  const values = obs.map((o) => o.resultat_obs)
  const min = Math.min(...values), max = Math.max(...values)
  const range = max - min || 0.01
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W
    const y = H - 4 - ((v - min) / range) * (H - 8)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const line = `M ${pts.join(' L ')}`
  const area = `${line} L ${W},${H} L 0,${H} Z`
  const color = trend === 'rising' ? '#f87171' : trend === 'falling' ? '#38bdf8' : '#64748b'
  const fill  = trend === 'rising' ? 'rgba(248,113,113,0.1)' : trend === 'falling' ? 'rgba(56,189,248,0.1)' : 'rgba(100,116,139,0.08)'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 36 }} preserveAspectRatio="none">
      <path d={area} fill={fill} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function StationCard({ item }: { item: HydrologyData }) {
  const { station, currentHeight, currentFlow, observations, trend, vigilance } = item
  const vId = vigilance?.color_id ?? 1
  const vc = VIGILANCE[vId] ?? VIGILANCE[1]
  const tr = TREND[trend] ?? TREND.stable
  const lastObs = observations[observations.length - 1]
  const heights = observations.map((o) => o.resultat_obs)
  const minH = heights.length > 0 ? Math.min(...heights) : null
  const maxH = heights.length > 0 ? Math.max(...heights) : null

  return (
    <Card>
      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <p className="font-semibold text-slate-100 truncate">{station.libelle_site}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {station.libelle_commune}
            {station.distance != null ? ` · ${station.distance.toFixed(0)} km` : ''}
          </p>
        </div>
        <span className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${vc.border} ${vc.bg} ${vc.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${vc.dot}`} />
          {vigilance?.color_label ?? 'Vert'}
        </span>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--bg-base)' }}>
          <p className="text-[10px] text-slate-500 mb-0.5">Hauteur</p>
          <p className="font-semibold text-sm text-slate-100">
            {currentHeight != null ? `${currentHeight.toFixed(2)} m` : '—'}
          </p>
          {minH != null && maxH != null && (
            <p className="text-[10px] text-slate-600 mt-0.5 leading-tight">
              {minH.toFixed(2)}–{maxH.toFixed(2)} m
            </p>
          )}
        </div>
        <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--bg-base)' }}>
          <p className="text-[10px] text-slate-500 mb-0.5">Débit</p>
          <p className="font-semibold text-sm text-slate-100">
            {currentFlow != null ? `${currentFlow.toFixed(1)}` : '—'}
          </p>
          {currentFlow != null && (
            <p className="text-[10px] text-slate-600 mt-0.5">m³/s</p>
          )}
        </div>
        <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--bg-base)' }}>
          <p className="text-[10px] text-slate-500 mb-0.5">Tendance</p>
          <p className={`font-semibold text-sm ${tr.color}`}>{tr.icon} {tr.label}</p>
        </div>
      </div>

      {/* Sparkline 72h */}
      {observations.length > 3 && (
        <div className="mb-2">
          <p className="text-[10px] text-slate-600 mb-1">Hauteur sur 72h</p>
          <Sparkline obs={observations} trend={trend} />
          {/* mini axe */}
          <div className="flex justify-between text-[9px] text-slate-700 mt-0.5">
            <span>- 72h</span>
            <span>maintenant</span>
          </div>
        </div>
      )}

      {lastObs && (
        <p className="text-[10px] text-slate-600 mt-1">
          Dernière mesure : {format(new Date(lastObs.date_obs), "d MMM à HH:mm", { locale: fr })}
        </p>
      )}
    </Card>
  )
}

export default function HydrologyPage({ embedded = false }: { embedded?: boolean }) {
  const selectedLat = useLocationStore((s) => s.selectedLocation?.lat)
  const selectedLon = useLocationStore((s) => s.selectedLocation?.lon)
  const currentLat  = useLocationStore((s) => s.currentPosition?.lat)
  const currentLon  = useLocationStore((s) => s.currentPosition?.lon)
  const lat = selectedLat ?? currentLat
  const lon = selectedLon ?? currentLon
  const coords = lat != null && lon != null ? { lat, lon } : null
  const { data, isLoading, error } = useVigicrues(coords ?? undefined)

  if (!coords) {
    return (
      <div className={embedded ? '' : 'p-4'}>
        <Alert type="info" title="Position requise">
          Activez la géolocalisation pour voir les stations hydrométriques proches.
        </Alert>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${embedded ? '' : 'p-4'}`}>
      <div className="text-sm text-slate-300 bg-sky-900/30 rounded-xl p-3 border border-sky-800/60">
        <strong>Vigicrues / Hub'Eau</strong> — Réseau hydrométrique national · Stations à 30 km
      </div>

      {isLoading && <div className="flex justify-center py-10"><Spinner size="lg" /></div>}

      {error && (
        <Alert type="error" title="Erreur Vigicrues">
          Impossible de charger les données hydrologiques. Vérifiez votre connexion.
        </Alert>
      )}

      {data && data.length === 0 && (
        <Card>
          <p className="text-slate-500 text-sm text-center py-4">
            Aucune station Vigicrues dans un rayon de 30 km.
          </p>
        </Card>
      )}

      {data && data.map((item) => (
        <StationCard key={item.station.code_site} item={item} />
      ))}
    </div>
  )
}
