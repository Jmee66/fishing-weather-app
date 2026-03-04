import { useMemo } from 'react'
import { format } from 'date-fns'
import type { WaveData, MarineWindData } from '@/types/marine.types'

interface WaveChartProps {
  hourly: (WaveData & MarineWindData)[]
}

const W = 340
const H = 130
const PAD_LEFT = 36
const PAD_RIGHT = 52   // espace pour légende à droite
const PAD_TOP = 22
const PAD_BOTTOM = 24

export default function WaveChart({ hourly }: WaveChartProps) {
  const data = useMemo(() => hourly.slice(0, 48), [hourly])

  const maxH = useMemo(() => {
    if (data.length === 0) return 1
    const peak = Math.max(...data.map((d) => d.wave_height))
    return Math.max(Math.ceil(peak / 0.5) * 0.5, 1)
  }, [data])

  if (data.length < 2) return null

  const minT = data[0].dt
  const maxT = data[data.length - 1].dt
  const tRange = maxT - minT || 1
  const innerW = W - PAD_LEFT - PAD_RIGHT
  const innerH = H - PAD_TOP - PAD_BOTTOM

  const toX = (dt: number) => PAD_LEFT + ((dt - minT) / tRange) * innerW
  const toY = (h: number) => PAD_TOP + innerH - (h / maxH) * innerH

  // Courbe wave_height (principale bleue)
  const mainPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(d.dt).toFixed(1)},${toY(d.wave_height).toFixed(1)}`)
    .join(' ')

  const areaPath =
    mainPath +
    ` L${toX(data[data.length - 1].dt).toFixed(1)},${(PAD_TOP + innerH).toFixed(1)}` +
    ` L${toX(data[0].dt).toFixed(1)},${(PAD_TOP + innerH).toFixed(1)} Z`

  // Courbe swell (cyan pointillé) — si au moins 10 valeurs non nulles
  const hasSwell = data.filter((d) => d.swell_wave_height != null && d.swell_wave_height > 0).length >= 5
  const swellPath = hasSwell
    ? data
        .filter((d) => d.swell_wave_height != null)
        .map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(d.dt).toFixed(1)},${toY(d.swell_wave_height!).toFixed(1)}`)
        .join(' ')
    : ''

  // Courbe wind_wave (emerald pointillé)
  const hasWindWave = data.filter((d) => d.wind_wave_height != null && d.wind_wave_height > 0).length >= 5
  const windWavePath = hasWindWave
    ? data
        .filter((d) => d.wind_wave_height != null)
        .map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(d.dt).toFixed(1)},${toY(d.wind_wave_height!).toFixed(1)}`)
        .join(' ')
    : ''

  // Ticks X toutes les 6h
  const xTickDts: number[] = []
  for (let t = Math.ceil(minT / (6 * 3600)) * (6 * 3600); t <= maxT; t += 6 * 3600) {
    xTickDts.push(t)
  }

  // Ticks Y
  const yTicks = [0, maxH / 2, maxH]

  // Ligne "maintenant"
  const nowDt = Date.now() / 1000
  const nowX = nowDt >= minT && nowDt <= maxT ? toX(nowDt) : null

  // Flèches de direction toutes les 6h (vague combinée)
  const arrowPoints = data.filter((_, i) => i % 6 === 0 && data[i].wave_direction != null)

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H }}
        aria-label="Graphique de houle 48h"
      >
        <defs>
          <linearGradient id="wave-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
          </linearGradient>
          <clipPath id="wave-clip">
            <rect x={PAD_LEFT} y={PAD_TOP} width={innerW} height={innerH} />
          </clipPath>
        </defs>

        {/* Grille horizontale */}
        {yTicks.map((h) => {
          const y = toY(h)
          return (
            <g key={h}>
              <line
                x1={PAD_LEFT} y1={y} x2={W - PAD_RIGHT} y2={y}
                stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3"
              />
              <text x={PAD_LEFT - 4} y={y + 3.5} textAnchor="end" fontSize="7" fill="#64748b">
                {h.toFixed(1)}m
              </text>
            </g>
          )
        })}

        {/* Ticks axe X */}
        {xTickDts.map((dt) => {
          const x = toX(dt)
          if (x < PAD_LEFT || x > W - PAD_RIGHT) return null
          return (
            <g key={dt}>
              <line
                x1={x} y1={PAD_TOP + innerH} x2={x} y2={PAD_TOP + innerH + 3}
                stroke="#475569" strokeWidth="0.8"
              />
              <text x={x} y={H - 4} textAnchor="middle" fontSize="7" fill="#64748b">
                {format(new Date(dt * 1000), 'HH:mm')}
              </text>
            </g>
          )
        })}

        {/* Aire principale */}
        <path d={areaPath} fill="url(#wave-grad)" clipPath="url(#wave-clip)" />

        {/* Courbe combinée (bleue épaisse) */}
        <path
          d={mainPath} fill="none" stroke="#38bdf8" strokeWidth="1.8"
          strokeLinejoin="round" clipPath="url(#wave-clip)"
        />

        {/* Courbe houle primaire (cyan pointillé) */}
        {hasSwell && (
          <path
            d={swellPath} fill="none" stroke="#22d3ee" strokeWidth="1.2"
            strokeDasharray="4,3" strokeLinejoin="round" clipPath="url(#wave-clip)"
          />
        )}

        {/* Courbe mer du vent (emerald pointillé) */}
        {hasWindWave && (
          <path
            d={windWavePath} fill="none" stroke="#34d399" strokeWidth="1.2"
            strokeDasharray="2,3" strokeLinejoin="round" clipPath="url(#wave-clip)"
          />
        )}

        {/* Flèches de direction toutes les 6h */}
        {arrowPoints.map((d) => {
          const x = toX(d.dt)
          if (x < PAD_LEFT + 4 || x > W - PAD_RIGHT - 4) return null
          const deg = d.wave_direction ?? 0
          return (
            <g
              key={d.dt}
              transform={`translate(${x},${PAD_TOP + innerH - 7}) rotate(${deg})`}
            >
              {/* Petite flèche SVG (triangle vers le haut = direction vers laquelle va la vague) */}
              <polygon points="0,-5 3,3 0,1 -3,3" fill="#94a3b8" opacity="0.8" />
            </g>
          )
        })}

        {/* Ligne "maintenant" */}
        {nowX !== null && (
          <g>
            <line
              x1={nowX} y1={PAD_TOP} x2={nowX} y2={PAD_TOP + innerH}
              stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3,2"
            />
            <text x={nowX + 3} y={PAD_TOP + 9} fontSize="6.5" fill="#f59e0b">
              now
            </text>
          </g>
        )}

        {/* Bordure */}
        <rect
          x={PAD_LEFT} y={PAD_TOP} width={innerW} height={innerH}
          fill="none" stroke="#1e293b" strokeWidth="0.5"
        />

        {/* Légende à droite */}
        <g transform={`translate(${W - PAD_RIGHT + 4}, ${PAD_TOP + 2})`}>
          {/* Combinée */}
          <line x1={0} y1={5} x2={14} y2={5} stroke="#38bdf8" strokeWidth="1.8" />
          <text x={16} y={8} fontSize="6.5" fill="#94a3b8">Comb.</text>
          {/* Houle */}
          {hasSwell && (
            <g transform="translate(0,12)">
              <line x1={0} y1={5} x2={14} y2={5} stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="4,3" />
              <text x={16} y={8} fontSize="6.5" fill="#94a3b8">Houle</text>
            </g>
          )}
          {/* Mer vent */}
          {hasWindWave && (
            <g transform={`translate(0,${hasSwell ? 24 : 12})`}>
              <line x1={0} y1={5} x2={14} y2={5} stroke="#34d399" strokeWidth="1.2" strokeDasharray="2,3" />
              <text x={16} y={8} fontSize="6.5" fill="#94a3b8">M.vent</text>
            </g>
          )}
        </g>
      </svg>
    </div>
  )
}
