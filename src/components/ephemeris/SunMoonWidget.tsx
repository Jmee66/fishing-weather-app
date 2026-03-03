import { useEphemeris } from '@/hooks/useEphemeris'
import { format } from 'date-fns'
import Card from '@/components/ui/Card'

export default function SunMoonWidget() {
  const eph = useEphemeris()
  if (!eph) return null

  const fmt = (d: Date | null) => d ? format(d, "HH:mm") : '—'
  return (
    <Card className="space-y-3">
      <h3 className="font-semibold text-slate-800 text-sm">Éphéméride</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-amber-600">☀️ Soleil</div>
          <div className="grid grid-cols-2 gap-1 text-xs text-slate-700">
            <span>Lever {fmt(eph.sunrise)}</span>
            <span>Coucher {fmt(eph.sunset)}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-slate-600">{eph.moonPhaseEmoji} Lune</div>
          <div className="grid grid-cols-2 gap-1 text-xs text-slate-700">
            <span>Lever {fmt(eph.moonrise)}</span>
            <span>Coucher {fmt(eph.moonset)}</span>
            <span className="text-slate-500 col-span-2">{eph.moonPhaseName} ({Math.round(eph.moonIllumination * 100)}%)</span>
          </div>
        </div>
      </div>
      {eph.fishingOptimums.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-green-700 mb-1.5">🎣 Optimums de pêche aujourd'hui</div>
          <div className="space-y-1">
            {eph.fishingOptimums.slice(0, 4).map((opt, i) => (
              <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-lime-50 text-lime-700">
                <span className="font-medium">{format(opt.start, "HH:mm")}–{format(opt.end, "HH:mm")}</span>
                <span className="opacity-80">{opt.reason}</span>
                <span>⭐</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}