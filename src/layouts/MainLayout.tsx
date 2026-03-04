import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import BottomNav from '@/components/navigation/BottomNav'
import TopNav from '@/components/navigation/TopNav'
import OfflineIndicator from '@/components/common/OfflineIndicator'
import UpdatePrompt from '@/components/common/UpdatePrompt'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useLocationStore } from '@/stores/location.store'
import { useSettingsStore } from '@/stores/settings.store'

/**
 * Hook de démarrage : si aucune position n'est active (pas de GPS, pas de selectedLocation),
 * on sélectionne automatiquement le defaultLocation des settings ou le premier favori.
 */
function useStartupLocation() {
  const selectedLocation = useLocationStore((s) => s.selectedLocation)
  const favourites = useLocationStore((s) => s.favourites)
  const setSelectedLocation = useLocationStore((s) => s.setSelectedLocation)
  const defaultLocation = useSettingsStore((s) => s.defaultLocation)

  useEffect(() => {
    // Déjà une position sélectionnée → rien à faire
    if (selectedLocation) return

    // 1. Utiliser le defaultLocation des settings s'il existe
    if (defaultLocation) {
      setSelectedLocation(defaultLocation)
      return
    }

    // 2. Sinon, prendre le premier favori (trié par createdAt)
    if (favourites.length > 0) {
      const sorted = [...favourites].sort((a, b) => a.createdAt - b.createdAt)
      const first = sorted[0]
      setSelectedLocation({ lat: first.lat, lon: first.lon, name: first.name })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Seulement au montage initial
}

export default function MainLayout() {
  const isOnline = useOnlineStatus()
  useStartupLocation()

  return (
    <div className="flex flex-col h-dvh" style={{ backgroundColor: 'var(--bg-base)' }}>
      <TopNav />
      <UpdatePrompt />
      {!isOnline && <OfflineIndicator />}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[calc(var(--nav-height)+var(--safe-bottom))]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
