import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdatePrompt() {
  const [show, setShow] = useState(false)

  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      // Vérifie une mise à jour toutes les 60s
      if (r) setInterval(() => r.update(), 60 * 1000)
    },
  })

  useEffect(() => {
    if (needRefresh) setShow(true)
  }, [needRefresh])

  if (!show) return null

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium bg-sky-900 text-sky-100 border-b border-sky-700">
      <span>🔄 Nouvelle version disponible</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="px-2.5 py-1 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-400 transition-colors"
      >
        Mettre à jour
      </button>
    </div>
  )
}
