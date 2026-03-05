'use client';

import Layout from '../../src/components/Layout'
import SafeSummaryPane from '../../src/features/explainability/SafeSummaryPane'
import { usePrescriptionStore } from '../../src/lib/store'

export default function SummaryPage() {
  const { currentPrescription } = usePrescriptionStore()

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">Safe Summary</h1>
          <p className="text-gray-600">Personalized lab results explanation & safety alerts</p>
        </div>
        <SafeSummaryPane observations={currentPrescription?.observations || []} />
      </div>
    </Layout>
  )
}