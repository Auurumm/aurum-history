"use client"

import React from 'react'
import { useResponsive } from '@/app/contexts/responsive-context'

interface ResponsiveTextProps {
  mobile: React.ReactNode
  tablet?: React.ReactNode
  desktop: React.ReactNode
  className?: string
  as?: React.ElementType
}

export function ResponsiveText({ 
  mobile, 
  tablet, 
  desktop, 
  className = "",
  as: Component = 'div'
}: ResponsiveTextProps) {
  const { isMobile, isTablet } = useResponsive()

  let content: React.ReactNode

  if (isMobile) {
    content = mobile
  } else if (isTablet && tablet) {
    content = tablet
  } else {
    content = desktop
  }

  return <Component className={className}>{content}</Component>
}