
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MemberForm } from '@/components/members/member-form'
import { MemberImportDialog } from '@/components/members/member-import-dialog'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users,
  Download,
  Upload,
  Filter,
  Mail,
  Calendar,
  Gift,
  UserCheck,
  UserX,
  Clock,
  Heart,
  ChevronDown,
  FileText,
  Send,
  CheckCircle2,
  Star,
  MapPin,
  TrendingUp,
  UserPlus,
  Crown,
  PlayCircle,
  Target
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
// import { Member } from '@prisma/client'
import { toast } from 'sonner'

interface Member {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  status: string
  isActive?: boolean
  gender?: string
  occupation?: string
  maritalStatus?: string
  membershipDate?: Date
  baptismDate?: Date
  birthDate?: Date
  ministryId?: string
  spiritualGifts?: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
  // Add other fields as needed
}

interface MembersClientProps {
  userRole: string
  churchId: string
}

export function MembersClient({ userRole, churchId }: MembersClientProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [qualificationSettings, setQualificationSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState('all')
  
  // Smart Lists & Bulk Actions State
  const [activeSmartList, setActiveSmartList] = useState('all')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  // Volunteer Integration State
  const [isVolunteerRecruitOpen, setIsVolunteerRecruitOpen] = useState(false)
  const [selectedMemberForVolunteer, setSelectedMemberForVolunteer] = useState<Member | null>(null)
  const [volunteerRecommendations, setVolunteerRecommendations] = useState<any[]>([])
  const [showLeadershipTrack, setShowLeadershipTrack] = useState(false)

  useEffect(() => {
    fetchMembers()
    fetchVolunteers()
    fetchQualificationSettings()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchTerm, genderFilter, activeSmartList])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members')
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVolunteers = async () => {
    try {
      const response = await fetch('/api/volunteers')
      if (response.ok) {
        const data = await response.json()
        setVolunteers(data)
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error)
    }
  }

  const fetchQualificationSettings = async () => {
    try {
      const response = await fetch('/api/qualification-settings')
      if (response.ok) {
        const data = await response.json()
        setQualificationSettings(data)
      }
    } catch (error) {
      console.error('Error fetching qualification settings:', error)
      // Use default settings if API fails
      setQualificationSettings({
        leadershipMinMembershipDays: 365,
        volunteerMinMembershipDays: 0,
        leadershipMinSpiritualScore: 70,
        volunteerMinSpiritualScore: 0
      })
    }
  }

  // Helper function to check if member is already a volunteer
  const getMemberVolunteerStatus = (memberId: string) => {
    return volunteers.find(v => v.memberId === memberId)
  }

  // Handle volunteer recruitment for a member
  const handleVolunteerRecruitment = async (member: Member) => {
    setSelectedMemberForVolunteer(member)
    
    // Fetch volunteer recommendations for this member
    try {
      const response = await fetch(`/api/volunteer-matching?memberId=${member.id}`)
      if (response.ok) {
        const data = await response.json()
        setVolunteerRecommendations(data.recommendations || [])
      }
    } catch (error) {
      console.error('Error fetching volunteer recommendations:', error)
    }
    
    setIsVolunteerRecruitOpen(true)
  }

  // Handle creating volunteer from member
  const handleCreateVolunteerFromMember = async (ministryId: string) => {
    if (!selectedMemberForVolunteer) return

    try {
      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: selectedMemberForVolunteer.id,
          firstName: selectedMemberForVolunteer.firstName,
          lastName: selectedMemberForVolunteer.lastName,
          email: selectedMemberForVolunteer.email,
          phone: selectedMemberForVolunteer.phone,
          ministryId: ministryId !== 'no-ministry' ? ministryId : null,
        }),
      })

      if (response.ok) {
        fetchVolunteers()
        setIsVolunteerRecruitOpen(false)
        setSelectedMemberForVolunteer(null)
        toast.success('¡Miembro reclutado como voluntario exitosamente!')
      } else {
        toast.error('Error al reclutar voluntario')
      }
    } catch (error) {
      console.error('Error creating volunteer:', error)
      toast.error('Error al reclutar voluntario')
    }
  }

  const filterMembers = () => {
    let filtered = members

    // Apply Smart List Filters First
    switch (activeSmartList) {
      case 'new-members':
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        filtered = filtered.filter(member => 
          new Date(member.membershipDate || member.createdAt) >= thirtyDaysAgo
        )
        break
        
      case 'inactive-members':
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        filtered = filtered.filter(member => 
          !member.isActive || new Date(member.updatedAt) <= sixMonthsAgo
        )
        break
        
      case 'birthdays':
        const today = new Date()
        const currentMonth = today.getMonth()
        filtered = filtered.filter(member => 
          member.birthDate && new Date(member.birthDate).getMonth() === currentMonth
        )
        break
        
      case 'anniversaries':
        const currentMonth2 = new Date().getMonth()
        filtered = filtered.filter(member => 
          member.membershipDate && new Date(member.membershipDate).getMonth() === currentMonth2
        )
        break
        
      case 'ministry-leaders':
        filtered = filtered.filter(member => 
          member.ministryId || (member.spiritualGifts && Array.isArray(member.spiritualGifts) && member.spiritualGifts.length > 0)
        )
        break
        
      case 'visitors-becoming-members':
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
        filtered = filtered.filter(member => 
          member.membershipDate && new Date(member.membershipDate) >= ninetyDaysAgo && !member.baptismDate
        )
        break
        
      case 'prayer-needed':
        filtered = filtered.filter(member => 
          member.notes && member.notes.toLowerCase().includes('oración')
        )
        break
        
      case 'volunteer-candidates':
        // Show members who are eligible to be volunteers using custom criteria
        const volunteerMinDays = qualificationSettings?.volunteerMinMembershipDays || 0
        const volunteerMinSpiritualScore = qualificationSettings?.volunteerMinSpiritualScore || 0
        const requireActiveStatus = qualificationSettings?.volunteerRequireActiveStatus || true
        const requireSpiritualAssessment = qualificationSettings?.volunteerRequireSpiritualAssessment || false
        
        filtered = filtered.filter(member => {
          // Must not already be a volunteer
          if (getMemberVolunteerStatus(member.id)) return false
          
          // Check active status if required
          if (requireActiveStatus && !member.isActive) return false
          
          // Check membership duration
          if (member.membershipDate) {
            const membershipDuration = Date.now() - new Date(member.membershipDate).getTime()
            const daysSinceMembership = membershipDuration / (24 * 60 * 60 * 1000)
            if (daysSinceMembership < volunteerMinDays) return false
          }
          
          // Additional checks would include spiritual assessment requirements
          // TODO: Check for completed spiritual assessment if required
          
          return true
        })
        break
        
      case 'active-volunteers':
        // Show members who ARE volunteers
        filtered = filtered.filter(member => getMemberVolunteerStatus(member.id))
        break
        
      case 'leadership-ready':
        // Show members ready for leadership using custom criteria
        const leadershipMinDays = qualificationSettings?.leadershipMinMembershipDays || 365
        const leadershipMinSpiritualScore = qualificationSettings?.leadershipMinSpiritualScore || 70
        const requireVolunteerExp = qualificationSettings?.leadershipRequireVolunteerExp || false
        const requireTraining = qualificationSettings?.leadershipRequireTraining || false
        
        filtered = filtered.filter(member => {
          // Basic criteria
          if (!member.isActive || !member.membershipDate) return false
          
          // Check membership duration
          const membershipDuration = Date.now() - new Date(member.membershipDate).getTime()
          const daysSinceMembership = membershipDuration / (24 * 60 * 60 * 1000)
          if (daysSinceMembership < leadershipMinDays) return false
          
          // Check volunteer experience if required
          if (requireVolunteerExp && !getMemberVolunteerStatus(member.id)) return false
          
          // Additional checks would include spiritual assessment scores
          // TODO: Integrate with member spiritual profiles for scoring
          
          return true
        })
        break
        
      case 'all':
      default:
        // No additional filtering
        break
    }

    // Apply Search Filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone?.includes(searchTerm)
      )
    }

    // Apply Gender Filter
    if (genderFilter !== 'all') {
      filtered = filtered.filter(member => member.gender === genderFilter)
    }

    setFilteredMembers(filtered)
  }

  const handleSaveMember = async (memberData: any) => {
    try {
      const url = editingMember ? `/api/members/${editingMember.id}` : '/api/members'
      const method = editingMember ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      })

      if (response.ok) {
        await fetchMembers()
        setIsFormOpen(false)
        setEditingMember(null)
      } else {
        const error = await response.json()
        alert(error.message || 'Error al guardar el miembro')
      }
    } catch (error) {
      console.error('Error saving member:', error)
      alert('Error al guardar el miembro')
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este miembro?')) {
      return
    }

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchMembers()
      } else {
        alert('Error al eliminar el miembro')
      }
    } catch (error) {
      console.error('Error deleting member:', error)
      alert('Error al eliminar el miembro')
    }
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingMember(null)
    setIsFormOpen(true)
  }

  // Bulk Actions Handlers
  const handleSelectMember = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers(prev => [...prev, memberId])
    } else {
      setSelectedMembers(prev => prev.filter(id => id !== memberId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(filteredMembers.map(member => member.id))
    } else {
      setSelectedMembers([])
    }
  }

  const handleBulkEmail = () => {
    const selectedMemberEmails = members
      .filter(member => selectedMembers.includes(member.id) && member.email)
      .map(member => member.email)
      .join(',')
    
    if (selectedMemberEmails) {
      window.location.href = `mailto:${selectedMemberEmails}`
    }
  }

  const handleBulkExport = () => {
    const selectedMemberData = members
      .filter(member => selectedMembers.includes(member.id))
      .map(member => ({
        Nombre: `${member.firstName} ${member.lastName}`,
        Email: member.email || '',
        Teléfono: member.phone || '',
        Género: member.gender || '',
        Estado: member.isActive ? 'Activo' : 'Inactivo',
        'Fecha Membresía': member.membershipDate ? formatDate(member.membershipDate) : '',
        'Fecha Bautismo': member.baptismDate ? formatDate(member.baptismDate) : ''
      }))

    const csv = [
      Object.keys(selectedMemberData[0]).join(','),
      ...selectedMemberData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', `miembros_${activeSmartList}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleBulkStatusUpdate = async (status: boolean) => {
    try {
      const updatePromises = selectedMembers.map(memberId => 
        fetch(`/api/members/${memberId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: status })
        })
      )

      await Promise.all(updatePromises)
      await fetchMembers()
      setSelectedMembers([])
    } catch (error) {
      console.error('Error updating members:', error)
    }
  }

  const clearSelection = () => {
    setSelectedMembers([])
    setShowBulkActions(false)
  }

  // Smart List Definitions
  const smartLists = [
    { id: 'all', name: 'Todos los Miembros', icon: Users, count: members.length },
    { id: 'new-members', name: 'Nuevos Miembros (30d)', icon: UserCheck, count: 0 },
    { id: 'inactive-members', name: 'Miembros Inactivos', icon: UserX, count: 0 },
    { id: 'volunteer-candidates', name: 'Candidatos Voluntarios', icon: UserPlus, count: members.filter(m => !getMemberVolunteerStatus(m.id)).length },
    { id: 'active-volunteers', name: 'Son Voluntarios', icon: Target, count: volunteers.filter(v => v.memberId).length },
    { id: 'leadership-ready', name: 'Listos para Liderazgo', icon: Crown, count: 0 },
    { id: 'birthdays', name: 'Cumpleaños este Mes', icon: Calendar, count: 0 },
    { id: 'anniversaries', name: 'Aniversarios de Membresía', icon: Gift, count: 0 },
    { id: 'ministry-leaders', name: 'Líderes de Ministerio', icon: Star, count: 0 },
    { id: 'visitors-becoming-members', name: 'Visitantes → Miembros', icon: TrendingUp, count: 0 },
    { id: 'prayer-needed', name: 'Necesitan Oración', icon: Heart, count: 0 }
  ]

  // Calculate Smart List Counts
  useEffect(() => {
    // This would normally be calculated in the filtering logic or backend
    // For now, we'll keep it simple
  }, [members])

  const canEdit = ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(userRole)
  const canDelete = ['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(userRole)

  if (isFormOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {editingMember ? 'Editar Miembro' : 'Nuevo Miembro'}
          </h1>
        </div>
        <MemberForm
          member={editingMember}
          onSave={handleSaveMember}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingMember(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Miembros CRM</h1>
          <p className="text-muted-foreground">
            Sistema avanzado de gestión pastoral con listas inteligentes
          </p>
        </div>
        <div className="flex gap-2">
          {selectedMembers.length > 0 && (
            <Button variant="outline" onClick={clearSelection}>
              Limpiar ({selectedMembers.length})
            </Button>
          )}
          {canEdit && (
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Miembros
            </Button>
          )}
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Miembro
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedMembers.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedMembers.length} miembro{selectedMembers.length > 1 ? 's' : ''} seleccionado{selectedMembers.length > 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleBulkEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Estado
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate(true)}>
                      Activar Miembros
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate(false)}>
                      Desactivar Miembros
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Lists & Content */}
      <Tabs value={activeSmartList} onValueChange={setActiveSmartList} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-muted/50">
            {smartLists.map((list) => {
              const IconComponent = list.icon
              return (
                <TabsTrigger key={list.id} value={list.id} className="text-xs">
                  <IconComponent className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{list.name}</span>
                  <span className="sm:hidden">{list.name.split(' ')[0]}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="w-48">
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los géneros</SelectItem>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{filteredMembers.length}</p>
                  <p className="text-sm text-muted-foreground">
                    {activeSmartList !== 'all' ? 'En Lista' : 'Total Miembros'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                  M
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {filteredMembers.filter(m => m.gender === 'masculino').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Hombres</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm font-bold">
                  F
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {filteredMembers.filter(m => m.gender === 'femenino').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Mujeres</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {selectedMembers.length}
                </div>
                <div>
                  <p className="text-2xl font-bold">{selectedMembers.length}</p>
                  <p className="text-sm text-muted-foreground">Seleccionados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Members Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {smartLists.find(l => l.id === activeSmartList)?.name || 'Lista de Miembros'} ({filteredMembers.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleSelectAll(selectedMembers.length !== filteredMembers.length)}>
                  {selectedMembers.length === filteredMembers.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p>Cargando miembros...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay miembros en esta lista</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {activeSmartList !== 'all' ? 'Prueba con otra lista inteligente' : 'Agrega tu primer miembro'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Información</TableHead>
                      <TableHead>Fechas</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedMembers.includes(member.id)}
                            onCheckedChange={(checked) => handleSelectMember(member.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {member.firstName} {member.lastName}
                            </p>
                            {member.occupation && (
                              <p className="text-sm text-muted-foreground">
                                {member.occupation}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {member.email && (
                              <p className="text-sm">{member.email}</p>
                            )}
                            {member.phone && (
                              <p className="text-sm text-muted-foreground">{member.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {member.gender && (
                              <Badge variant="secondary" className="text-xs">
                                {member.gender}
                              </Badge>
                            )}
                            {member.maritalStatus && (
                              <Badge variant="outline" className="text-xs ml-1">
                                {member.maritalStatus}
                              </Badge>
                            )}
                            {member.ministryId && (
                              <Badge variant="default" className="text-xs ml-1">
                                <Star className="h-3 w-3 mr-1" />
                                Líder
                              </Badge>
                            )}
                            {getMemberVolunteerStatus(member.id) && (
                              <Badge variant="default" className="text-xs ml-1 bg-green-600">
                                <UserPlus className="h-3 w-3 mr-1" />
                                Voluntario
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {member.membershipDate && (
                              <p>Membresía: {formatDate(member.membershipDate)}</p>
                            )}
                            {member.baptismDate && (
                              <p className="text-muted-foreground">
                                Bautismo: {formatDate(member.baptismDate)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.isActive ? "default" : "secondary"}>
                            {member.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* Volunteer Actions */}
                            {!getMemberVolunteerStatus(member.id) && canEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleVolunteerRecruitment(member)}
                                title="Reclutar como Voluntario"
                              >
                                <UserPlus className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            {getMemberVolunteerStatus(member.id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open('/volunteers', '_blank')}
                                title="Ver Perfil de Voluntario"
                              >
                                <Target className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}
                            {/* Leadership Development Action */}
                            {member.isActive && member.membershipDate && canEdit &&
                             new Date(member.membershipDate) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toast.info('Función de desarrollo de liderazgo próximamente')}
                                title="Considerar para Liderazgo"
                              >
                                <Crown className="h-4 w-4 text-yellow-600" />
                              </Button>
                            )}
                            {/* Existing Actions */}
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(member)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMember(member.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Import Dialog */}
      <MemberImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImportComplete={fetchMembers}
      />

      {/* Volunteer Recruitment Dialog */}
      <Dialog open={isVolunteerRecruitOpen} onOpenChange={setIsVolunteerRecruitOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-600" />
              Reclutar Voluntario
            </DialogTitle>
            <DialogDescription>
              Convierte a {selectedMemberForVolunteer?.firstName} {selectedMemberForVolunteer?.lastName} en voluntario
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Member Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Información del Miembro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Nombre:</Label>
                    <p>{selectedMemberForVolunteer?.firstName} {selectedMemberForVolunteer?.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email:</Label>
                    <p>{selectedMemberForVolunteer?.email || 'No disponible'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Teléfono:</Label>
                    <p>{selectedMemberForVolunteer?.phone || 'No disponible'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Membresía:</Label>
                    <p>{selectedMemberForVolunteer?.membershipDate ? formatDate(selectedMemberForVolunteer.membershipDate) : 'No disponible'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            {volunteerRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recomendaciones de IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {volunteerRecommendations.slice(0, 3).map((rec: any, index: number) => (
                    <div key={index} className="p-2 border rounded flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{rec.ministryName || 'Ministerio General'}</p>
                        <p className="text-xs text-muted-foreground">Compatibilidad: {rec.matchScore}%</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleCreateVolunteerFromMember(rec.ministryId)}
                      >
                        Reclutar
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="default"
                onClick={() => handleCreateVolunteerFromMember('no-ministry')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Reclutar como Voluntario General
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsVolunteerRecruitOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
