import { Outlet } from 'react-router-dom'
import BottomNav from '@/components/navigation/BottomNav'
import TopNav from '@/components/navigation/TopNav'
import OfflineIndicator from '@/components/common/OfflineIndicator'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export default function MainLayout() {
  const isOnline = useOnlineStatus()

  return (
    <div className="flex flex-col h-dvh" style={{ backgroundColor: 'var(--bg-base)' }}>
      <TopNav />
      {!isOnline && <OfflineIndicator />}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[calc(var(--nav-height)+var(--safe-bottom))]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
