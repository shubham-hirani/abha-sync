'use client';

import Layout from '../../src/components/Layout'
import SmartSwitchPane from '../../src/features/pharmacy/SmartSwitchPane'

export default function SmartSwitchPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">Smart-Switch</h1>
          <p className="text-gray-600">Find affordable generic alternatives for brand-name medicines</p>
        </div>
        <SmartSwitchPane />
      </div>
    </Layout>
  )
}