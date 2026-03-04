import { useState, useRef } from 'react'
import { geocodingService } from '@/services/api/geocoding.service'
import { useLocationStore } from '@/stores/location.store'
import type { GeocodingResult } from '@/types'

export default function LocationSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const setSelectedLocation = useLocationStore((s) => s.setSelectedLocation)

  const handleInput = (value: string) => {
    setQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (value.length < 3) { setResults([]); setIsOpen(false); return }
    timerRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await geocodingService.search(value)
        setResults(res)
        setIsOpen(true)
      } finally {
        setIsLoading(false)
      }
    }, 400)
  }

  const selectResult = (r: GeocodingResult) => {
    const dn = r.displayName || `${r.lat.toFixed(3)}, ${r.lon.toFixed(3)}`
    setSelectedLocation({ lat: r.lat, lon: r.lon, name: dn.split(",").slice(0, 2).join(",") })
    setQuery(dn.split(",")[0])
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl px-3 py-2">
        <span className="text-slate-500 text-sm">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Rechercher un lieu..."
          className="flex-1 text-sm outline-none text-slate-100 placeholder:text-slate-400 bg-transparent"
        />
        {isLoading && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-lg z-50 overflow-hidden">
          {results.slice(0, 6).map((r, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2.5 text-sm text-slate-200 hover:bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] last:border-0"
              onClick={() => selectResult(r)}
            >
              <div className="font-medium truncate">{(r.displayName || '').split(",")[0]}</div>
              <div className="text-xs text-slate-500 truncate">{(r.displayName ?? '').split(",").slice(1, 3).join(",")}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}