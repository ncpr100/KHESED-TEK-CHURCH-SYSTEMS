
'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/ui/logo'
import { Menu, X, LogOut, User } from 'lucide-react'
import { translateRole } from '@/lib/utils'

export function Header() {
  const { data: session } = useSession() || {}
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Logo size="md" />
        </div>

        <div className="flex items-center gap-4">
          {session?.user && (
            <>
              <div className="hidden md:flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{session.user.name}</span>
                <Badge variant="secondary">
                  {translateRole(session.user.role)}
                </Badge>
              </div>
              <Button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="hidden md:flex"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && session?.user && (
        <div className="md:hidden border-t bg-background p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{session.user.name}</span>
              <Badge variant="secondary">
                {translateRole(session.user.role)}
              </Badge>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
