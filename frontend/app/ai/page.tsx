'use client';

import Layout from '../../src/components/Layout'
import AIProcessingPane from '../../src/features/digitization/AIProcessingPane'

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