import Layout from '../components/Layout'
import { useState } from 'react'
import { MapPin, TrendingDown } from 'lucide-react'

export default function SmartSwitch() {
  const [brand, setBrand] = useState('Crocin')
  const [mapping, setMapping] = useState<{generic:string,savings:number} | null>(null)

  async function lookup() {
    const res = await fetch('/api/drug-map?brand=' + encodeURIComponent(brand))
    const data = await res.json()
    setMapping(data)
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">Smart-Switch</h1>
          <p className="text-gray-600">Find affordable generic alternatives for brand-name medicines</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="med-card p-6 border-l-4 border-secondary">
            <label className="block text-lg font-bold text-primary mb-3">Search Brand Name</label>
            <input 
              value={brand} 
              onChange={(e)=>setBrand(e.target.value)} 
              placeholder="e.g., Crocin, Aspirin..."
              className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary" 
            />
            <button onClick={lookup} className="btn-secondary w-full">🔍 Find Generic Alternative</button>
            {mapping && (
              <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="text-sm text-gray-700 font-semibold mb-1">Generic Equivalent</div>
                <div className="font-bold text-lg text-primary mb-3">{mapping.generic}</div>
                <div className="flex items-center gap-2 badge-safe">
                  <TrendingDown size={18} />
                  <span>₹{mapping.savings} Savings per unit</span>
                </div>
              </div>
            )}
          </div>

          <div className="med-card p-6 border-l-4 border-accent">
            <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-accent" /> Nearest Jan Aushadhi Kendra
            </h3>
            <div className="h-72 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg overflow-hidden border border-slate-200">
              <iframe 
                title="map" 
                width="100%" 
                height="100%" 
                src="https://www.google.com/maps?q=jan%20aushadhi%20kendra&output=embed"
                style={{ border: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
