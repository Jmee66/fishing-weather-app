export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="text-6xl mb-4">📡</div>
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Hors ligne</h1>
      <p className="text-slate-500 max-w-xs">
        Vous êtes hors connexion. Les données météo et les cartes précédemment chargées restent accessibles.
      </p>
      <button
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium"
        onClick={() => window.location.reload()}
      >
        Réessayer
      </button>
    </div>
  )
}
