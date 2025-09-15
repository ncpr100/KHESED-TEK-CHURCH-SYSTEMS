'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Server, Copy, Check } from 'lucide-react'

export default function ConfigurationErrorPage() {
  const [copied, setCopied] = useState(false)

  const setupInstructions = `# Required Environment Variables for KHESED-TEK Church Systems

# NextAuth Configuration (REQUIRED)
NEXTAUTH_SECRET="your-secure-32-character-secret-here"
NEXTAUTH_URL="https://your-domain.com"

# Database Configuration (REQUIRED)
DATABASE_URL="postgresql://username:password@host:5432/database"

# Generate a secure secret with:
# openssl rand -base64 32`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(setupInstructions)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const reloadPage = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuration Required
          </h1>
          <p className="text-gray-600">
            The server is missing required environment variables
          </p>
        </div>

        {/* Error Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-red-600" />
              Server Configuration Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Missing Environment Variables:</h3>
              <ul className="text-red-700 space-y-1">
                <li>• <code className="bg-red-100 px-2 py-1 rounded">NEXTAUTH_SECRET</code> - Required for authentication</li>
                <li>• <code className="bg-red-100 px-2 py-1 rounded">NEXTAUTH_URL</code> - Required for OAuth redirects</li>
                <li>• <code className="bg-red-100 px-2 py-1 rounded">DATABASE_URL</code> - Required for database connection</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Quick Setup Instructions:</h4>
              
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700">Environment Variables Template:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-8"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
                  {setupInstructions}
                </pre>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">For Administrators:</h4>
                <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Copy the template above to your environment configuration</li>
                  <li>Replace placeholder values with your actual configuration</li>
                  <li>Generate a secure <code>NEXTAUTH_SECRET</code> using: <code className="bg-blue-100 px-1 rounded">openssl rand -base64 32</code></li>
                  <li>Set <code>NEXTAUTH_URL</code> to your domain (e.g., https://yourchurch.com)</li>
                  <li>Configure <code>DATABASE_URL</code> with your PostgreSQL connection string</li>
                  <li>Restart the application</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={reloadPage} className="w-full sm:w-auto">
                Check Configuration Again
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">Need help with deployment?</p>
              <p>Check the <code className="bg-gray-100 px-2 py-1 rounded">.env.example</code> file in your project for a complete configuration template.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}