'use client'

import ContactInfoCard from '@/components/help/ContactInfoCard'

/**
 * Public test page to verify ContactInfoCard functionality
 * This page is accessible without authentication for testing purposes
 */
export default function TestContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Contact Information Test Page
            </h1>
            <p className="text-gray-600">
              Testing the ContactInfoCard component functionality
            </p>
          </div>
          
          <div className="space-y-6">
            <ContactInfoCard />
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
              <div className="space-y-2 text-sm">
                <p>✅ <strong>Expected Behavior:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Contact information should load from the API</li>
                  <li>Default Khesed-tek contact info should be displayed</li>
                  <li>Refresh button should work</li>
                  <li>No authentication errors should appear</li>
                </ul>
                
                <p className="mt-4">⚠️ <strong>Known Limitations:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Updates require SUPER_ADMIN authentication</li>
                  <li>Database may not be configured (uses fallback defaults)</li>
                  <li>Changes made by super admin should trigger updates here</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}