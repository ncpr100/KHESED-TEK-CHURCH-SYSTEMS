'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Search,
  Filter,
  X,
  Users,
  DollarSign,
  Calendar,
  FileText,
  Settings,
  Clock,
  Star,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface SearchFilter {
  key: string
  label: string
  icon: React.ComponentType<any>
  values: Array<{ value: string; label: string; count?: number }>
}

interface SmartSearchProps {
  churchId: string
  placeholder?: string
  className?: string
  maxResults?: number
  onResultSelect?: (result: SearchResult) => void
}

export function SmartSearch({ 
  churchId, 
  placeholder = "Buscar miembros, donaciones, eventos...", 
  className,
  maxResults = 10,
  onResultSelect
}: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [availableFilters, setAvailableFilters] = useState<SearchFilter[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  
  const searchRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`recent-searches-${churchId}`)
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [churchId])

  // Initialize available filters
  useEffect(() => {
    const filters: SearchFilter[] = [
      {
        key: 'type',
        label: 'Tipo',
        icon: Filter,
        values: [
          { value: 'member', label: 'Miembros', count: 0 },
          { value: 'donation', label: 'Donaciones', count: 0 },
          { value: 'event', label: 'Eventos', count: 0 },
          { value: 'sermon', label: 'Sermones', count: 0 },
          { value: 'volunteer', label: 'Voluntarios', count: 0 },
          { value: 'prayer', label: 'Oraciones', count: 0 }
        ]
      },
      {
        key: 'status',
        label: 'Estado',
        icon: Settings,
        values: [
          { value: 'active', label: 'Activo', count: 0 },
          { value: 'inactive', label: 'Inactivo', count: 0 },
          { value: 'pending', label: 'Pendiente', count: 0 }
        ]
      },
      {
        key: 'date',
        label: 'Fecha',
        icon: Clock,
        values: [
          { value: 'today', label: 'Hoy' },
          { value: 'week', label: 'Esta semana' },
          { value: 'month', label: 'Este mes' },
          { value: 'year', label: 'Este año' }
        ]
      }
    ]
    setAvailableFilters(filters)
  }, [])

  const performSearch = async (searchQuery: string, filters: Record<string, string[]> = {}) => {
    if (!searchQuery.trim() && Object.keys(filters).length === 0) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        churchId,
        limit: maxResults.toString(),
        filters: JSON.stringify(filters)
      })

      const response = await fetch(`/api/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setQuery(value)
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      performSearch(value, selectedFilters)
    }, 300)
  }

  const addRecentSearch = (search: string) => {
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem(`recent-searches-${churchId}`, JSON.stringify(updated))
  }

  const handleResultSelect = (result: SearchResult) => {
    addRecentSearch(query)
    setIsOpen(false)
    setQuery('')
    
    if (onResultSelect) {
      onResultSelect(result)
    } else {
      window.location.href = result.url
    }
  }

  const toggleFilter = (filterKey: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[filterKey] || []
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      
      const newFilters = { ...prev, [filterKey]: updated }
      if (updated.length === 0) {
        delete newFilters[filterKey]
      }
      
      performSearch(query, newFilters)
      return newFilters
    })
  }

  const clearAllFilters = () => {
    setSelectedFilters({})
    performSearch(query, {})
  }

  const getResultIcon = (type: string) => {
    const iconProps = { className: "h-4 w-4" }
    switch (type) {
      case 'member':
        return <Users {...iconProps} />
      case 'donation':
        return <DollarSign {...iconProps} />
      case 'event':
        return <Calendar {...iconProps} />
      case 'sermon':
        return <FileText {...iconProps} />
      case 'volunteer':
        return <Users {...iconProps} />
      case 'prayer':
        return <Star {...iconProps} />
      default:
        return <Search {...iconProps} />
    }
  }

  const activeFiltersCount = Object.values(selectedFilters).flat().length

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="pl-10 pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="h-6 px-2 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-[400px] p-0" align="start">
          {showFilters && (
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Filtros</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    Limpiar todo
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                {availableFilters.map((filter) => (
                  <div key={filter.key}>
                    <label className="text-xs font-medium text-muted-foreground">
                      {filter.label}
                    </label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {filter.values.map((value) => {
                        const isSelected = selectedFilters[filter.key]?.includes(value.value)
                        return (
                          <Badge
                            key={value.value}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer text-xs"
                            onClick={() => toggleFilter(filter.key, value.value)}
                          >
                            {value.label}
                            {value.count !== undefined && ` (${value.count})`}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Command>
            <CommandList>
              {query.length === 0 && results.length === 0 && recentSearches.length > 0 && (
                <CommandGroup heading="Búsquedas recientes">
                  {recentSearches.map((search, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => {
                        setQuery(search)
                        handleSearch(search)
                      }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {search}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              )}
              
              {results.length > 0 && (
                <CommandGroup heading={`Resultados (${results.length})`}>
                  {results.map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleResultSelect(result)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="p-1 rounded bg-muted">
                          {getResultIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {result.title}
                            </p>
                            <Badge variant="outline" className="text-xs capitalize">
                              {result.type}
                            </Badge>
                          </div>
                          {result.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          )}
                          {result.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {result.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {query.length > 0 && results.length === 0 && !isLoading && (
                <CommandEmpty>
                  <div className="text-center py-6">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No se encontraron resultados para "{query}"
                    </p>
                  </div>
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}