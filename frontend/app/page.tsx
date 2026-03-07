'use client';

import Layout from '../src/components/Layout'
import DashboardCards from '../src/features/dashboard/DashboardCards'
import UploadZone from '../src/features/digitization/UploadZone'
import { useState } from 'react'
import { useAbhaSync } from '../src/hooks/useAbhaSync'
import { usePrescriptionStore } from '../src/lib/store'

export default function Home() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<{ status: 'syncing' | 'success' | 'failed' }>({ status: 'success' })
  const { processDocument, isLoading } = useAbhaSync()
  const { setCurrentPrescription } = usePrescriptionStore()

  const handleFileUpload = async (file: File) => {
    setFileName(file.name)
    setSyncStatus({ status: 'syncing' })

    try {
      const result = await processDocument(file)
      setCurrentPrescription(result)
      setSyncStatus({ status: 'success' })
    } catch (error) {
      setSyncStatus({ status: 'failed' })
    }
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">Dashboard</h1>
          <p className="text-gray-600">Monitor your medical records and digitization progress</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-primary mb-6">Key Metrics</h2>
          <DashboardCards syncStatus={syncStatus} />
        </div>

        <div className="med-card p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">Upload Medical Documents</h2>
            <p className="text-gray-600 text-sm">Upload prescriptions, lab reports, or medical PDFs for AI extraction</p>
          </div>
          <UploadZone onFile={handleFileUpload} isProcessing={isLoading} />
          {fileName && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700"><strong>✓ Selected:</strong> {fileName}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}