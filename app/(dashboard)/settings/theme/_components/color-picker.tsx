
'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Palette, RotateCcw } from 'lucide-react'

interface ColorPickerProps {
  label: string
  value?: string
  onChange: (value: string) => void
  defaultValue: string
}

// Function to convert HSL string to hex color
function hslToHex(hsl: string): string {
  const hslMatch = hsl.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/)
  if (!hslMatch) return '#000000'

  const h = parseFloat(hslMatch[1]) / 360
  const s = parseFloat(hslMatch[2]) / 100
  const l = parseFloat(hslMatch[3]) / 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h * 6) % 2 - 1))
  const m = l - c / 2

  let r = 0, g = 0, b = 0

  if (0 <= h && h < 1/6) {
    r = c; g = x; b = 0
  } else if (1/6 <= h && h < 1/3) {
    r = x; g = c; b = 0
  } else if (1/3 <= h && h < 1/2) {
    r = 0; g = c; b = x
  } else if (1/2 <= h && h < 2/3) {
    r = 0; g = x; b = c
  } else if (2/3 <= h && h < 5/6) {
    r = x; g = 0; b = c
  } else if (5/6 <= h && h < 1) {
    r = c; g = 0; b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

// Function to convert hex color to HSL string
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  h = Math.round(h * 360)
  s = Math.round(s * 100)
  l = Math.round(l * 100)

  return `${h} ${s}% ${l}%`
}

export function ColorPicker({ label, value, onChange, defaultValue }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const currentValue = value || defaultValue
  const hexColor = hslToHex(currentValue)

  const handleColorChange = (hex: string) => {
    const hsl = hexToHsl(hex)
    onChange(hsl)
  }

  const resetToDefault = () => {
    onChange(defaultValue)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={resetToDefault}
          className="h-8 px-2"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-12 h-10 p-0 border-2"
              style={{ backgroundColor: hexColor }}
            >
              <span className="sr-only">Seleccionar color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="text-sm font-medium">{label}</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color-input">Color (Hex)</Label>
                <div className="flex gap-2">
                  <Input
                    id="color-input"
                    type="color"
                    value={hexColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-16 h-10 p-1 border"
                  />
                  <Input
                    value={hexColor}
                    onChange={(e) => {
                      if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                        handleColorChange(e.target.value)
                      }
                    }}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>HSL Value</Label>
                <Input
                  value={currentValue}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="0 0% 0%"
                  className="font-mono text-xs"
                />
              </div>
              
              <div className="pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetToDefault}
                  className="w-full"
                >
                  Restablecer a default
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Input
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0 0% 0%"
          className="font-mono text-sm"
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        Formato HSL: tono saturación% luminosidad%
      </p>
    </div>
  )
}
