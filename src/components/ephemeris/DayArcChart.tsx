import { useMemo } from 'react'
import { format } from 'date-fns'
import type { EphemerisData } from '@/utils/ephemeris'

interface DayArcChartProps {
  eph: EphemerisData
  date?: Date
}

const W = 340
const H = 110
const PAD_LEFT = 10
const PAD_RIGHT = 10
const PAD_TOP = 22   // espace pour les étiquettes au-dessus
const PAD_BOTTOM = 22

const BAR_H = H - PAD_TOP - PAD_BOTTOM  // hauteur de la bande colorée

/** Convertit une Date en fraction du jour (0.0 = minuit, 1.0 = 23:59:59) */
function dayFraction(d: Date | null, dayStart: Date): number | null {
  if (!d || isNaN(d.getTime())) return null
  const start = new Date(dayStart)
  start.setHours(0, 0, 0, 0)
  const ms = d.getTime() - start.getTime()
  const frac = ms / 86400000
  return Math.max(0, Math.min(1, frac))
}

export default function DayArcChart({ eph, date = new Date() }: DayArcChartProps) {
  const dayStart = useMemo(() => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }, [date])

  const innerW = W - PAD_LEFT - PAD_RIGHT

  const toX = (frac: number) => PAD_LEFT + frac * innerW

  // Fractions de tous les événements solaires
  const astro_dawn  = dayFraction(eph.astronomicalDawn, dayStart)
  const naut_dawn   = dayFraction(eph.nauticalDawn, dayStart)
  const civil_dawn  = dayFraction(eph.civilDawn, dayStart)
  const sunrise     = dayFraction(eph.sunrise, dayStart)
  const solar_noon  = dayFraction(eph.solarNoon, dayStart)
  const sunset      = dayFraction(eph.sunset, dayStart)
  const civil_dusk  = dayFraction(eph.civilDusk, dayStart)
  const naut_dusk   = dayFraction(eph.nauticalDusk, dayStart)
  const astro_dusk  = dayFraction(eph.astronomicalDusk, dayStart)
  const moonrise    = dayFraction(eph.moonrise, dayStart)
  const moonset     = dayFraction(eph.moonset, dayStart)

  // Segments de couleur — tableau de bandes [de, à, couleur]
  type Band = [number, number, string]
  const bands: Band[] = useMemo(() => {
    const segs: Band[] = []
    const push = (from: number | null, to: number | null, color: string) => {
      const f = from ?? 0
      const t = to ?? 1
      if (t > f) segs.push([f, t, color])
    }

    // Nuit profonde debut (minuit → aube astronomique)
    push(0, astro_dawn, '#0f172a')
    // Aube astronomique → nautique (violet très sombre)
    push(astro_dawn, naut_dawn, '#1e1b4b')
    // Aube nautique → civile (indigo)
    push(naut_dawn, civil_dawn, '#312e81')
    // Aube civile → lever soleil (indigo→ambre)
    push(civil_dawn, sunrise, '#4338ca')
    // Heure dorée matin (lever → ~45min après)
    const golden_end = sunrise != null ? Math.min(1, sunrise + 0.031) : sunrise
    push(sunrise, golden_end, '#d97706')
    // Jour (fin heure dorée matin → début heure dorée soir)
    const golden_pm_start = sunset != null ? Math.max(0, sunset - 0.031) : sunset
    push(golden_end, golden_pm_start, '#0ea5e9')
    // Heure dorée soir
    push(golden_pm_start, sunset, '#ea580c')
    // Crépuscule civil (coucher → dusk civil)
    push(sunset, civil_dusk, '#7c3aed')
    // Crépuscule nautique
    push(civil_dusk, naut_dusk, '#312e81')
    // Crépuscule astronomique
    push(naut_dusk, astro_dusk, '#1e1b4b')
    // Nuit profonde fin
    push(astro_dusk, 1, '#0f172a')

    return segs
  }, [astro_dawn, naut_dawn, civil_dawn, sunrise, sunset, civil_dusk, naut_dusk, astro_dusk])

  // Ticks axe X : 00h, 06h, 12h, 18h, 24h
  const xTicks = [0, 0.25, 0.5, 0.75, 1.0]
  const xTickLabels = ['00h', '06h', '12h', '18h', '24h']

  // "Maintenant"
  const nowFrac = dayFraction(new Date(), dayStart)

  // Zones de pêche optimum
  const fishingZones = eph.fishingOptimums.map((opt) => ({
    from: dayFraction(opt.start, dayStart),
    to:   dayFraction(opt.end, dayStart),
  })).filter((z) => z.from !== null && z.to !== null)

  const barY = PAD_TOP

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H }}
        aria-label="Chronogramme jour/nuit"
      >
        {/* Bandes de couleur */}
        {bands.map(([from, to, color], i) => (
          <rect
            key={i}
            x={toX(from).toFixed(1)}
            y={barY}
            width={Math.max(0, toX(to) - toX(from)).toFixed(1)}
            height={BAR_H}
            fill={color}
          />
        ))}

        {/* Zones pêche optimum (vert semi-transparent) */}
        {fishingZones.map((z, i) => (
          <rect
            key={`fish-${i}`}
            x={toX(z.from!).toFixed(1)}
            y={barY}
            width={Math.max(0, toX(z.to!) - toX(z.from!)).toFixed(1)}
            height={BAR_H}
            fill="#22c55e"
            opacity="0.28"
          />
        ))}

        {/* Bordure barre */}
        <rect
          x={PAD_LEFT} y={barY} width={innerW} height={BAR_H}
          fill="none" stroke="#1e293b" strokeWidth="0.8"
          rx="2"
        />

        {/* Marqueurs soleil — lever (▲ au-dessus + heure) */}
        {sunrise !== null && (
          <g>
            <line x1={toX(sunrise)} y1={barY} x2={toX(sunrise)} y2={barY + BAR_H}
              stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="3,2" opacity="0.7" />
            <polygon
              points={`${toX(sunrise)},${barY - 2} ${toX(sunrise) - 5},${barY - 10} ${toX(sunrise) + 5},${barY - 10}`}
              fill="#fbbf24"
            />
            <text x={toX(sunrise)} y={barY - 12}
              textAnchor="middle" fontSize="8" fill="#fbbf24" fontWeight="600">
              {format(eph.sunrise!, 'HH:mm')}
            </text>
          </g>
        )}
        {/* Coucher soleil (▼ en dessous + heure) */}
        {sunset !== null && (
          <g>
            <line x1={toX(sunset)} y1={barY} x2={toX(sunset)} y2={barY + BAR_H}
              stroke="#fb923c" strokeWidth="1.2" strokeDasharray="3,2" opacity="0.7" />
            <polygon
              points={`${toX(sunset)},${barY + BAR_H + 2} ${toX(sunset) - 5},${barY + BAR_H + 10} ${toX(sunset) + 5},${barY + BAR_H + 10}`}
              fill="#fb923c"
            />
            <text x={toX(sunset)} y={barY + BAR_H + 20}
              textAnchor="middle" fontSize="8" fill="#fb923c" fontWeight="600">
              {format(eph.sunset!, 'HH:mm')}
            </text>
          </g>
        )}
        {solar_noon !== null && (
          <line
            x1={toX(solar_noon)} y1={barY + 2}
            x2={toX(solar_noon)} y2={barY + BAR_H - 2}
            stroke="#fde68a" strokeWidth="1" strokeDasharray="2,2"
          />
        )}

        {/* Marqueurs lune — lever (losange gris clair + heure) */}
        {moonrise !== null && (
          <g>
            <polygon
              points={`${toX(moonrise)},${barY - 2} ${toX(moonrise) - 4},${barY - 8} ${toX(moonrise)},${barY - 14} ${toX(moonrise) + 4},${barY - 8}`}
              fill="#94a3b8"
            />
            <text x={toX(moonrise)} y={barY + BAR_H + 20}
              textAnchor="middle" fontSize="7" fill="#94a3b8">
              🌙{format(eph.moonrise!, 'HH:mm')}
            </text>
          </g>
        )}
        {/* Coucher lune (losange sombre) */}
        {moonset !== null && (
          <g>
            <polygon
              points={`${toX(moonset)},${barY + BAR_H + 2} ${toX(moonset) - 4},${barY + BAR_H + 8} ${toX(moonset)},${barY + BAR_H + 14} ${toX(moonset) + 4},${barY + BAR_H + 8}`}
              fill="#64748b"
            />
          </g>
        )}

        {/* Ticks axe X */}
        {xTicks.map((frac, i) => {
          const x = toX(frac)
          return (
            <g key={i}>
              <line
                x1={x} y1={barY + BAR_H} x2={x} y2={barY + BAR_H + 3}
                stroke="#475569" strokeWidth="0.8"
              />
              <text
                x={x} y={H - 1}
                textAnchor={i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle'}
                fontSize="7" fill="#64748b"
              >
                {xTickLabels[i]}
              </text>
            </g>
          )
        })}

        {/* Ligne "maintenant" */}
        {nowFrac !== null && nowFrac >= 0 && nowFrac <= 1 && (
          <g>
            <line
              x1={toX(nowFrac)} y1={barY - 2}
              x2={toX(nowFrac)} y2={barY + BAR_H + 2}
              stroke="#f59e0b" strokeWidth="1.5"
            />
          </g>
        )}
      </svg>
    </div>
  )
}
