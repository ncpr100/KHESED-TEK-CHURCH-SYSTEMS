
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  description?: string
  trend?: string
  index: number
}

export function StatsCard({ title, value, icon: Icon, description, trend, index }: StatsCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const animation = setTimeout(() => {
      const increment = value / 50
      const timer = setInterval(() => {
        setAnimatedValue(prev => {
          if (prev >= value) {
            clearInterval(timer)
            return value
          }
          return Math.min(prev + increment, value)
        })
      }, 20)
      return () => clearInterval(timer)
    }, index * 200)

    return () => clearTimeout(animation)
  }, [value, index])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.floor(animatedValue).toLocaleString()}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          {trend && (
            <p className="text-xs text-green-600 mt-1">
              {trend}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
