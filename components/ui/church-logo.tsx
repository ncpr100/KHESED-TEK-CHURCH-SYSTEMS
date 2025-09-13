
'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Building2 } from 'lucide-react'

interface ChurchLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
  fallbackToPlatform?: boolean
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8', 
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
}

const textSizeClasses = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl', 
  xl: 'text-3xl'
}

export function ChurchLogo({ 
  size = 'md', 
  className, 
  showText = true,
  fallbackToPlatform = false
}: ChurchLogoProps) {
  const { data: session } = useSession() || {}
  const church = session?.user?.church
  const [theme, setTheme] = useState<any>(null)

  // Load church theme
  useEffect(() => {
    const loadTheme = async () => {
      if (session?.user?.churchId) {
        try {
          const response = await fetch('/api/church/theme')
          if (response.ok) {
            const data = await response.json()
            setTheme(data.theme)
          }
        } catch (error) {
          console.error('Error loading theme:', error)
        }
      }
    }
    
    loadTheme()
  }, [session?.user?.churchId])

  // Parse theme colors
  const getThemeColors = () => {
    if (theme?.brandColors) {
      try {
        return JSON.parse(theme.brandColors)
      } catch (e) {
        return { primary: '#3B82F6' }
      }
    }
    return { primary: '#3B82F6' }
  }

  const colors = getThemeColors()

  // If no church data and fallbackToPlatform is false, show placeholder
  if (!church && !fallbackToPlatform) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className={cn('relative flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300', sizeClasses[size])}>
          <Building2 className="w-4 h-4 text-gray-400" />
        </div>
        {showText && (
          <div>
            <h1 className={cn('font-bold text-foreground', textSizeClasses[size])}>
              Iglesia
            </h1>

          </div>
        )}
      </div>
    )
  }

  // If no church data but fallbackToPlatform is true, show platform logo
  if (!church && fallbackToPlatform) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className={cn('relative', sizeClasses[size])}>
          <Image
            src="/logo.png"
            alt="Kḥesed-tek Church Management Systems"
            fill
            className="object-contain"
            priority
          />
        </div>
        {showText && (
          <div>
            <h1 className={cn('font-bold text-foreground', textSizeClasses[size])}>
              Kḥesed-tek
            </h1>
            {size !== 'sm' && (
              <p className="text-xs text-muted-foreground">
                Church Management Systems
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  // Show church branding
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Church Logo */}
      <div className={cn('relative', sizeClasses[size])}>
        {church?.logo ? (
          <Image
            src={church.logo}
            alt={`${church.name} logo`}
            fill
            className="object-contain rounded-lg"
            priority
            onError={(e) => {
              const img = e.target as HTMLImageElement
              img.style.display = 'none'
            }}
          />
        ) : (
          <div 
            className={cn('w-full h-full rounded-lg flex items-center justify-center', sizeClasses[size])}
            style={{ backgroundColor: colors.primary }}
          >
            <span className="text-white font-bold text-sm">
              {church?.name?.charAt(0)?.toUpperCase() || 'I'}
            </span>
          </div>
        )}
      </div>
      
      {/* Church Name & Description */}
      {showText && (
        <div>
          <h1 
            className={cn('font-bold text-foreground', textSizeClasses[size])}
            style={{ 
              fontFamily: theme?.headingFont || 'Inter',
              color: colors.primary
            }}
          >
            {church?.name || 'Iglesia'}
          </h1>

        </div>
      )}
    </div>
  )
}
