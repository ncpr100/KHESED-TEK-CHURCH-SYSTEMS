import { NextRequest, NextResponse } from 'next/server'
import { enhancedCache } from '@/lib/enhanced-cache'

interface SearchResult {
  id: string
  type: 'member' | 'donation' | 'event' | 'sermon' | 'volunteer' | 'prayer'
  title: string
  subtitle?: string
  description?: string
  url: string
  metadata?: Record<string, any>
  relevance?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const churchId = searchParams.get('churchId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const filtersParam = searchParams.get('filters')
    
    let filters: Record<string, string[]> = {}
    if (filtersParam) {
      try {
        filters = JSON.parse(filtersParam)
      } catch (error) {
        console.warn('Invalid filters parameter:', error)
      }
    }

    if (!churchId) {
      return NextResponse.json({ error: 'Church ID is required' }, { status: 400 })
    }

    // Generate cache key based on search parameters
    const cacheKey = `search_${churchId}_${query}_${JSON.stringify(filters)}_${limit}`
    
    const searchResults = await enhancedCache.get(cacheKey, async () => {
      const results: SearchResult[] = []
      
      // Simulate search across different entity types
      // In a real implementation, this would use a proper search engine like Elasticsearch
      // or sophisticated database queries with full-text search

      const searchTerm = query.toLowerCase().trim()
      
      // Mock member search results
      if (!filters.type || filters.type.includes('member')) {
        const memberResults = await searchMembers(churchId, searchTerm, filters)
        results.push(...memberResults)
      }

      // Mock donation search results
      if (!filters.type || filters.type.includes('donation')) {
        const donationResults = await searchDonations(churchId, searchTerm, filters)
        results.push(...donationResults)
      }

      // Mock event search results
      if (!filters.type || filters.type.includes('event')) {
        const eventResults = await searchEvents(churchId, searchTerm, filters)
        results.push(...eventResults)
      }

      // Mock sermon search results
      if (!filters.type || filters.type.includes('sermon')) {
        const sermonResults = await searchSermons(churchId, searchTerm, filters)
        results.push(...sermonResults)
      }

      // Mock volunteer search results
      if (!filters.type || filters.type.includes('volunteer')) {
        const volunteerResults = await searchVolunteers(churchId, searchTerm, filters)
        results.push(...volunteerResults)
      }

      // Mock prayer search results
      if (!filters.type || filters.type.includes('prayer')) {
        const prayerResults = await searchPrayerRequests(churchId, searchTerm, filters)
        results.push(...prayerResults)
      }

      // Sort by relevance and limit results
      return results
        .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
        .slice(0, limit)
    }, {
      ttl: 60, // Cache search results for 1 minute
      tags: ['search', `church_${churchId}`]
    })

    return NextResponse.json({
      results: searchResults,
      total: searchResults.length,
      query,
      filters
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}

async function searchMembers(churchId: string, query: string, filters: Record<string, string[]>): Promise<SearchResult[]> {
  // Mock member search - in real implementation would query database
  const mockMembers = [
    { id: '1', name: 'María García López', email: 'maria@email.com', phone: '300-123-4567', status: 'active' },
    { id: '2', name: 'Juan Pérez Rodríguez', email: 'juan@email.com', phone: '300-234-5678', status: 'active' },
    { id: '3', name: 'Ana Sofía Martínez', email: 'ana@email.com', phone: '300-345-6789', status: 'inactive' },
    { id: '4', name: 'Carlos Eduardo Silva', email: 'carlos@email.com', phone: '300-456-7890', status: 'active' },
    { id: '5', name: 'Lucía Fernández Gómez', email: 'lucia@email.com', phone: '300-567-8901', status: 'active' }
  ]

  return mockMembers
    .filter(member => {
      const matchesQuery = !query || 
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.phone.includes(query)
      
      const matchesStatus = !filters.status || filters.status.includes(member.status)
      
      return matchesQuery && matchesStatus
    })
    .map(member => ({
      id: member.id,
      type: 'member' as const,
      title: member.name,
      subtitle: member.email,
      description: `Tel: ${member.phone} • Estado: ${member.status === 'active' ? 'Activo' : 'Inactivo'}`,
      url: `/dashboard/members/${member.id}`,
      relevance: calculateRelevance(query, [member.name, member.email]),
      metadata: { status: member.status, phone: member.phone }
    }))
}

async function searchDonations(churchId: string, query: string, filters: Record<string, string[]>): Promise<SearchResult[]> {
  const mockDonations = [
    { id: '1', donorName: 'María García', amount: 150000, date: '2024-09-10', category: 'Diezmo' },
    { id: '2', donorName: 'Juan Pérez', amount: 250000, date: '2024-09-08', category: 'Ofrenda' },
    { id: '3', donorName: 'Anónimo', amount: 100000, date: '2024-09-05', category: 'Construcción' }
  ]

  return mockDonations
    .filter(donation => {
      return !query || 
        donation.donorName.toLowerCase().includes(query) ||
        donation.category.toLowerCase().includes(query)
    })
    .map(donation => ({
      id: donation.id,
      type: 'donation' as const,
      title: `Donación de ${donation.donorName}`,
      subtitle: `$${donation.amount.toLocaleString()} COP`,
      description: `Categoría: ${donation.category} • Fecha: ${donation.date}`,
      url: `/dashboard/donations/${donation.id}`,
      relevance: calculateRelevance(query, [donation.donorName, donation.category]),
      metadata: { amount: donation.amount, category: donation.category, date: donation.date }
    }))
}

async function searchEvents(churchId: string, query: string, filters: Record<string, string[]>): Promise<SearchResult[]> {
  const mockEvents = [
    { id: '1', name: 'Servicio Dominical', date: '2024-09-15', location: 'Santuario Principal', type: 'Servicio' },
    { id: '2', name: 'Estudio Bíblico', date: '2024-09-12', location: 'Aula 2', type: 'Educación' },
    { id: '3', name: 'Reunión de Jóvenes', date: '2024-09-14', location: 'Salón de Jóvenes', type: 'Ministerio' }
  ]

  return mockEvents
    .filter(event => {
      return !query || 
        event.name.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query)
    })
    .map(event => ({
      id: event.id,
      type: 'event' as const,
      title: event.name,
      subtitle: event.date,
      description: `Ubicación: ${event.location} • Tipo: ${event.type}`,
      url: `/dashboard/events/${event.id}`,
      relevance: calculateRelevance(query, [event.name, event.location, event.type]),
      metadata: { date: event.date, location: event.location, type: event.type }
    }))
}

async function searchSermons(churchId: string, query: string, filters: Record<string, string[]>): Promise<SearchResult[]> {
  const mockSermons = [
    { id: '1', title: 'Fe que Mueve Montañas', preacher: 'Pastor González', date: '2024-09-08', scripture: 'Mateo 17:20' },
    { id: '2', title: 'El Amor de Dios', preacher: 'Pastor Martínez', date: '2024-09-01', scripture: 'Juan 3:16' },
    { id: '3', title: 'Esperanza en Tiempos Difíciles', preacher: 'Pastor González', date: '2024-08-25', scripture: 'Romanos 8:28' }
  ]

  return mockSermons
    .filter(sermon => {
      return !query || 
        sermon.title.toLowerCase().includes(query) ||
        sermon.preacher.toLowerCase().includes(query) ||
        sermon.scripture.toLowerCase().includes(query)
    })
    .map(sermon => ({
      id: sermon.id,
      type: 'sermon' as const,
      title: sermon.title,
      subtitle: sermon.preacher,
      description: `Escritura: ${sermon.scripture} • Fecha: ${sermon.date}`,
      url: `/dashboard/sermons/${sermon.id}`,
      relevance: calculateRelevance(query, [sermon.title, sermon.preacher, sermon.scripture]),
      metadata: { preacher: sermon.preacher, date: sermon.date, scripture: sermon.scripture }
    }))
}

async function searchVolunteers(churchId: string, query: string, filters: Record<string, string[]>): Promise<SearchResult[]> {
  const mockVolunteers = [
    { id: '1', name: 'Andrea López', ministry: 'Alabanza', role: 'Cantante', status: 'active' },
    { id: '2', name: 'Miguel Torres', ministry: 'Juventud', role: 'Líder', status: 'active' },
    { id: '3', name: 'Carmen Ruiz', ministry: 'Niños', role: 'Maestra', status: 'inactive' }
  ]

  return mockVolunteers
    .filter(volunteer => {
      const matchesQuery = !query || 
        volunteer.name.toLowerCase().includes(query) ||
        volunteer.ministry.toLowerCase().includes(query) ||
        volunteer.role.toLowerCase().includes(query)
      
      const matchesStatus = !filters.status || filters.status.includes(volunteer.status)
      
      return matchesQuery && matchesStatus
    })
    .map(volunteer => ({
      id: volunteer.id,
      type: 'volunteer' as const,
      title: volunteer.name,
      subtitle: `${volunteer.role} - ${volunteer.ministry}`,
      description: `Ministerio: ${volunteer.ministry} • Estado: ${volunteer.status === 'active' ? 'Activo' : 'Inactivo'}`,
      url: `/dashboard/volunteers/${volunteer.id}`,
      relevance: calculateRelevance(query, [volunteer.name, volunteer.ministry, volunteer.role]),
      metadata: { ministry: volunteer.ministry, role: volunteer.role, status: volunteer.status }
    }))
}

async function searchPrayerRequests(churchId: string, query: string, filters: Record<string, string[]>): Promise<SearchResult[]> {
  const mockPrayers = [
    { id: '1', title: 'Por sanidad familiar', requester: 'María García', date: '2024-09-10', status: 'open' },
    { id: '2', title: 'Por trabajo', requester: 'Juan Pérez', date: '2024-09-08', status: 'answered' },
    { id: '3', title: 'Por los jóvenes de la iglesia', requester: 'Anónimo', date: '2024-09-05', status: 'open' }
  ]

  return mockPrayers
    .filter(prayer => {
      const matchesQuery = !query || 
        prayer.title.toLowerCase().includes(query) ||
        prayer.requester.toLowerCase().includes(query)
      
      const matchesStatus = !filters.status || filters.status.includes(prayer.status)
      
      return matchesQuery && matchesStatus
    })
    .map(prayer => ({
      id: prayer.id,
      type: 'prayer' as const,
      title: prayer.title,
      subtitle: `Solicitado por: ${prayer.requester}`,
      description: `Fecha: ${prayer.date} • Estado: ${prayer.status === 'open' ? 'Abierto' : 'Respondido'}`,
      url: `/dashboard/prayer-requests/${prayer.id}`,
      relevance: calculateRelevance(query, [prayer.title, prayer.requester]),
      metadata: { requester: prayer.requester, date: prayer.date, status: prayer.status }
    }))
}

function calculateRelevance(query: string, searchableFields: string[]): number {
  if (!query) return 50 // Default relevance when no query

  let relevance = 0
  const queryLower = query.toLowerCase()
  
  searchableFields.forEach(field => {
    const fieldLower = field.toLowerCase()
    
    // Exact match gets highest score
    if (fieldLower === queryLower) {
      relevance += 100
    }
    // Starts with query gets high score
    else if (fieldLower.startsWith(queryLower)) {
      relevance += 80
    }
    // Contains query gets medium score
    else if (fieldLower.includes(queryLower)) {
      relevance += 60
    }
    // Partial word match gets low score
    else if (queryLower.split(' ').some(word => fieldLower.includes(word))) {
      relevance += 30
    }
  })
  
  return Math.min(relevance, 100) // Cap at 100
}