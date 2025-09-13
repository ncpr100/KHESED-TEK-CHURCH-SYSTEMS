
'use client'

import { useState } from 'react'
import { Plus, Globe, Settings, Eye, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WebsiteCreateDialog } from '@/components/website-builder/website-create-dialog'
import { WebsiteList } from '@/components/website-builder/website-list'

export default function WebsiteBuilderPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleWebsiteCreated = () => {
    setShowCreateDialog(false)
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Constructor de Sitios Web</h1>
          <p className="text-muted-foreground">
            Crea y gestiona sitios web profesionales para tu iglesia con funnels de captación integrados
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Sitio Web
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sitios Web Activos</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Sitios web publicados y activos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funnels Activos</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Funnels de captación en funcionamiento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversiones Este Mes</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Leads capturados en el mes actual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Websites List */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Sitios Web</CardTitle>
          <CardDescription>
            Gestiona todos tus sitios web y funnels desde un solo lugar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebsiteList key={refreshTrigger} />
        </CardContent>
      </Card>

      {/* Create Website Dialog */}
      <WebsiteCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onWebsiteCreated={handleWebsiteCreated}
      />
    </div>
  )
}
