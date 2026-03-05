import { useMemo } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { TideData } from '@/types'

interface TideChartProps {
  tides: TideData
}

const W = 360
const H = 180
const PAD_LEFT = 38
const PAD_RIGHT = 14
const PAD_TOP = 26
const PAD_BOTTOM = 28

export default function TideChart({ tides }: TideChartProps) {
  const { predictions, events } = tides

  const points = useMemo(() => {
    // ── 1. Prédictions SHOM horaires (open-meteo) ────────────────────────────
    if (predictions.length >= 4) {
      const now  = Date.now() / 1000
      // Fenêtre 48h : 6h avant maintenant → 42h après
      const from = now - 6 * 3600
      const to   = now + 42 * 3600
      const filtered = predictions.filter((p) => p.dt >= from && p.dt <= to)
      if (filtered.length >= 12) return filtered
      // Fallback 1 : fenêtre plus large (24h avant → 72h après)
      const wide = predictions.filter((p) => p.dt >= now - 24 * 3600 && p.dt <= now + 72 * 3600)
      if (wide.length >= 4) return wide
      // Fallback 2 : toutes les prédictions disponibles
      return predictions
    }

    // ── 2. Interpolation cosinus entre événements PM/BM ──────────────────────
    if (events.length >= 2) {
      const sorted = [...events].sort((a, b) => a.dt - b.dt)
      const from = sorted[0].dt - 3600
      const to   = sorted[sorted.length - 1].dt + 3600
      const interpolated: { dt: number; height: number }[] = []
      for (let t = from; t <= to; t += 600) {
        let before = sorted[0]
        let after  = sorted[sorted.length - 1]
        for (let i = 0; i < sorted.length - 1; i++) {
          if (sorted[i].dt <= t && sorted[i + 1].dt >= t) {
            before = sorted[i]; after = sorted[i + 1]; break
          }
        }
        const span = after.dt - before.dt
        const frac = span > 0 ? (t - before.dt) / span : 0
        const mu   = (1 - Math.cos(frac * Math.PI)) / 2
        interpolated.push({ dt: t, height: before.height * (1 - mu) + after.height * mu })
      }
      return interpolated
    }

    return []
  }, [predictions, events])

  if (points.length < 2) return null

  const rawMinH = Math.min(...points.map((p) => p.height))
  const rawMaxH = Math.max(...points.map((p) => p.height))
  const rawRange = rawMaxH - rawMinH
  // Padding vertical minimum : au moins 0.5m de marge, sinon la courbe paraît plate
  const vPad  = Math.max(0.3, rawRange * 0.15)
  const minH  = rawMinH - vPad
  const maxH  = rawMaxH + vPad
  const hRange = maxH - minH
  const minT   = points[0].dt
  const maxT   = points[points.length - 1].dt
  const tRange = maxT - minT || 1

  const innerW = W - PAD_LEFT - PAD_RIGHT
  const innerH = H - PAD_TOP - PAD_BOTTOM

  const toX = (dt: number) => PAD_LEFT + ((dt - minT) / tRange) * innerW
  const toY = (h: number)  => PAD_TOP + innerH - ((h - minH) / hRange) * innerH

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.dt).toFixed(1)},${toY(p.height).toFixed(1)}`)
    .join(' ')

  const areaD =
    pathD +
    ` L${toX(points[points.length - 1].dt).toFixed(1)},${(PAD_TOP + innerH).toFixed(1)}` +
    ` L${toX(points[0].dt).toFixed(1)},${(PAD_TOP + innerH).toFixed(1)} Z`

  const nowDt = Date.now() / 1000
  const nowX  = nowDt >= minT && nowDt <= maxT ? toX(nowDt) : null

  // Ticks sur les vraies hauteurs (sans le padding visuel), plus une valeur intermédiaire
  const yTicks = [rawMinH, (rawMinH + rawMaxH) / 2, rawMaxH]

  const xTickDts: number[] = []
  for (let t = Math.ceil(minT / 3600) * 3600; t <= maxT; t += 6 * 3600) xTickDts.push(t)

  const visibleEvents = events.filter((ev) => ev.dt >= minT - 600 && ev.dt <= maxT + 600)

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H }}
        aria-label="Graphique de marée"
      >
        <defs>
          <linearGradient id="tide-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0ea5e9" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.04" />
          </linearGradient>
          <clipPath id="chart-clip">
            <rect x={PAD_LEFT} y={PAD_TOP} width={innerW} height={innerH} />
          </clipPath>
        </defs>

        {/* Grille horizontale */}
        {yTicks.map((h) => {
          const y = toY(h)
          return (
            <g key={h}>
              <line x1={PAD_LEFT} y1={y} x2={W - PAD_RIGHT} y2={y}
                stroke="#334155" strokeWidth="0.6" strokeDasharray="4,3" />
              <text x={PAD_LEFT - 5} y={y + 4} textAnchor="end" fontSize="9" fill="#64748b">
                {h.toFixed(1)}m
              </text>
            </g>
          )
        })}

        {/* Ticks axe X (toutes les 6h) */}
        {xTickDts.map((dt) => {
          const x = toX(dt)
          if (x < PAD_LEFT || x > W - PAD_RIGHT) return null
          return (
            <g key={dt}>
              <line x1={x} y1={PAD_TOP + innerH} x2={x} y2={PAD_TOP + innerH + 4}
                stroke="#475569" strokeWidth="1" />
              <text x={x} y={H - 5} textAnchor="middle" fontSize="9" fill="#64748b">
                {format(new Date(dt * 1000), 'HH:mm')}
              </text>
            </g>
          )
        })}

        {/* Aire */}
        <path d={areaD} fill="url(#tide-grad)" clipPath="url(#chart-clip)" />

        {/* Courbe */}
        <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2.2"
          strokeLinejoin="round" strokeLinecap="round" clipPath="url(#chart-clip)" />

        {/* Marqueurs PM / BM */}
        {visibleEvents.map((ev, i) => {
          const x = toX(ev.dt)
          const y = toY(ev.height)
          if (x < PAD_LEFT - 2 || x > W - PAD_RIGHT + 2) return null
          const isPM = ev.type === 'PM'
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="5"
                fill={isPM ? '#38bdf8' : '#475569'} stroke="#0f172a" strokeWidth="1.5" />
              <text x={x} y={isPM ? y - 8 : y + 14} textAnchor="middle" fontSize="10" fontWeight="600"
                fill={isPM ? '#7dd3fc' : '#94a3b8'}>
                {ev.type} {ev.height.toFixed(2)}m
              </text>
              {ev.coefficient != null && (
                <text x={x} y={isPM ? y - 20 : y + 26} textAnchor="middle" fontSize="9" fill="#64748b">
                  coef.{ev.coefficient}
                </text>
              )}
              <text x={x} y={isPM ? y - 31 : y + 37} textAnchor="middle" fontSize="9" fill="#475569">
                {format(new Date(ev.dt * 1000), 'HH:mm', { locale: fr })}
              </text>
            </g>
          )
        })}

        {/* Ligne "maintenant" */}
        {nowX !== null && (
          <g>
            <line x1={nowX} y1={PAD_TOP} x2={nowX} y2={PAD_TOP + innerH}
              stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" />
            <text x={nowX + 4} y={PAD_TOP + 11} fontSize="9" fill="#f59e0b" fontWeight="600">
              maintenant
            </text>
          </g>
        )}

        {/* Bordure */}
        <rect x={PAD_LEFT} y={PAD_TOP} width={innerW} height={innerH}
          fill="none" stroke="#1e293b" strokeWidth="0.5" />
      </svg>
    </div>
  )
}
