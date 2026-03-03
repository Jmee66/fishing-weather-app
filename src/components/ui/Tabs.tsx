interface Tab { id: string; label: string; icon?: string }
interface TabsProps { tabs: Tab[]; activeTab: string; onChange: (id: string) => void }
export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex bg-[var(--bg-elevated)] rounded-xl p-1 gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? 'bg-white text-sky-300 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  )
}