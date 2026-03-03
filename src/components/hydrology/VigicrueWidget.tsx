import { useVigicrues } from '@/hooks/useVigicrues'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import type { Coordinates } from '@/types'
const VIGILANCE_COLORS: Record<number, { bg: string; text: string; label: string; emoji: string }> = {
  1: { bg: "bg-green-900/30 border-green-200", text: "text-green-400", label: "Vert", emoji: "🟢" },
  2: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", label: "Jaune", emoji: "🟡" },
  3: { bg: "bg-orange-900/30 border-orange-200", text: "text-orange-400", label: "Orange", emoji: "🟠" },
  4: { bg: "bg-red-900/30 border-red-200", text: "text-red-400", label: "Rouge", emoji: "🔴" },
}
const TREND_ICONS: Record<string, string> = { rising: "📈", stable: "➡️", falling: "📉" }
const TREND_LABELS: Record<string, string> = { rising: "En hausse", stable: "Stable", falling: "En baisse" }

interface Props { coords?: Coordinates }
export default function VigicrueWidget({ coords }: Props) {
  const { data, isLoading, error } = useVigicrues(coords)

  if (isLoading) return <div className="flex justify-center p-3"><Spinner size="sm" /></div>
  if (error || !data || data.length === 0) return null

  const item = data[0]
  const vigilance = item.vigilance
  const vStyle = vigilance ? (VIGILANCE_COLORS[vigilance.color_id] ?? VIGILANCE_COLORS[1]) : VIGILANCE_COLORS[1]
  return (
    <Card className={`border ${vStyle.bg}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm">{item.station.libelle_site}</h3>
          <p className="text-xs text-slate-500">{item.station.libelle_commune}</p>
        </div>
        {vigilance && (
          <div className={`text-xs font-semibold ${vStyle.text} flex items-center gap-1`}>
            <span>{vStyle.emoji}</span>
            <span>Vigilance {vStyle.label}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {item.currentHeight !== undefined && (
          <div>
            <div className="text-2xl font-bold text-sky-300">{item.currentHeight.toFixed(2)} m</div>
            <div className="text-xs text-slate-500">Hauteur actuelle</div>
          </div>
        )}
        <div className="flex items-center gap-1 text-sm text-slate-300">
          <span className="text-lg">{TREND_ICONS[item.trend]}</span>
          <span>{TREND_LABELS[item.trend]}</span>
        </div>
      </div>
    </Card>
  )
}