import { useEphemeris } from '@/hooks/useEphemeris'
import { format } from 'date-fns'
import Card from '@/components/ui/Card'
import { IconSun, IconMoon } from '@/components/ui/icons/WeatherIcons'

export default function SunMoonWidget() {
  const eph = useEphemeris()
  if (!eph) return null

  const fmt = (d: Date | null) => d ? format(d, "HH:mm") : '—'
  return (
    <Card className="space-y-3">
      <h3 className="font-semibold text-slate-100 text-sm">Éphéméride</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <IconSun size={28} />
            <span className="text-xs font-semibold text-amber-300">Soleil</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs text-slate-300">
            <span>↑ {fmt(eph.sunrise)}</span>
            <span>↓ {fmt(eph.sunset)}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <IconMoon size={28} />
            <span className="text-xs font-semibold text-slate-300">Lune</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs text-slate-300">
            <span>↑ {fmt(eph.moonrise)}</span>
            <span>↓ {fmt(eph.moonset)}</span>
            <span className="text-slate-500 col-span-2">{eph.moonPhaseName} ({Math.round(eph.moonIllumination * 100)}%)</span>
          </div>
        </div>
      </div>
      {eph.fishingOptimums.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-green-400 mb-1.5">🎣 Optimums de pêche aujourd'hui</div>
          <div className="space-y-1">
            {eph.fishingOptimums.slice(0, 4).map((opt, i) => (
              <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-lime-900/30 text-lime-400">
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