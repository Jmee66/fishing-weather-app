import { Outlet } from 'react-router-dom'
import OfflineIndicator from '@/components/common/OfflineIndicator'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export default function MapLayout() {
  const isOnline = useOnlineStatus()
  return (
    <div className="relative w-screen h-dvh">
      {!isOnline && <div className="absolute top-0 left-0 right-0 z-[1000]"><OfflineIndicator /></div>}
      <Outlet />
    </div>
  )
}
