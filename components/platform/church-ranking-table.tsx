
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, DollarSign, Activity } from 'lucide-react'

interface ChurchRanking {
  id: string
  name: string
  members: number
  users: number
  donations: number
}

interface ChurchRankingTableProps {
  churches: ChurchRanking[]
}

export function ChurchRankingTable({ churches }: ChurchRankingTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Top Iglesias por Miembros
        </CardTitle>
      </CardHeader>
      <CardContent>
        {churches.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
        ) : (
          <div className="space-y-4">
            {churches.map((church, index) => (
              <div key={church.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">{church.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        {church.members} miembros
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Activity className="h-4 w-4" />
                        {church.users} usuarios
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                    <DollarSign className="h-5 w-5" />
                    {church.donations.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">Total donaciones</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
