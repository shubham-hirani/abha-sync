import Layout from '../components/Layout'
import { useState } from 'react'

function AIProcessingPane() {
  const [extracted, setExtracted] = useState({ drugs: [{ name: 'Paracetamol', dose: '500 mg' }], diagnoses: ['R50.9'] })

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="med-card p-6 border-l-4 border-secondary">
        <h3 className="font-bold text-lg text-primary mb-4">Document Viewer</h3>
        <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <p>Scan preview</p>
            <p className="text-xs">(PDF/image)</p>
          </div>
        </div>
      </div>
      <div className="med-card p-6 border-l-4 border-accent">
        <h3 className="font-bold text-lg text-primary mb-4">Extracted Data (FHIR Format)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Medications</label>
            <textarea 
              className="w-full h-20 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:border-secondary focus:ring-1 focus:ring-secondary" 
              value={JSON.stringify(extracted.drugs, null, 2)} 
              onChange={(e)=>{try{setExtracted(prev=>({...prev, drugs:JSON.parse(e.target.value)}))}catch{}}}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnoses (ICD-10)</label>
            <textarea 
              className="w-full h-20 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:border-secondary focus:ring-1 focus:ring-secondary" 
              value={JSON.stringify(extracted.diagnoses, null, 2)} 
              onChange={(e)=>{try{setExtracted(prev=>({...prev, diagnoses:JSON.parse(e.target.value)}))}catch{}}}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-secondary flex-1">💾 Save to FHIR</button>
            <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all">✏️ Edit</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AIPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">AI Processing Portal</h1>
          <p className="text-gray-600">Upload, extract, and standardize medical data in FHIR format</p>
        </div>
        <AIProcessingPane />
      </div>
    </Layout>
  )
}
