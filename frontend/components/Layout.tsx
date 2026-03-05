import Link from 'next/link'
import { Layers } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      <aside className="w-64 bg-gradient-to-b from-primary to-primary/95 text-white p-6 flex flex-col gap-6 shadow-lg">
        <div className="flex items-center gap-3 pb-4 border-b border-white/20">
          <div className="p-2 bg-secondary rounded-lg">
            <Layers size={24} />
          </div>
          <h2 className="font-bold text-xl">ABHA-Sync</h2>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <Link href="/" className="px-4 py-2.5 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium text-sm">📊 Dashboard</Link>
          <Link href="/ai" className="px-4 py-2.5 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium text-sm">🤖 AI Portal</Link>
          <Link href="/smart-switch" className="px-4 py-2.5 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium text-sm">🔄 Smart-Switch</Link>
          <Link href="/summary" className="px-4 py-2.5 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium text-sm">📋 Safe Summary</Link>
        </nav>
        <div className="text-xs opacity-70 pt-4 border-t border-white/20">Med-Tech Platform<br/>Deep Teal Design</div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
