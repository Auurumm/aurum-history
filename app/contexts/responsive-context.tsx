// contexts/responsive-context.tsx (새 파일)
"use client"
import { createContext, useContext, useState, useEffect } from 'react'

type ResponsiveContextType = {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop'
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined)

export function ResponsiveProvider({ children }: { children: React.ReactNode }) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width < 768) setScreenSize('mobile')
      else if (width < 1024) setScreenSize('tablet') 
      else setScreenSize('desktop')
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  return (
    <ResponsiveContext.Provider value={{
      isMobile: screenSize === 'mobile',
      isTablet: screenSize === 'tablet', 
      isDesktop: screenSize === 'desktop',
      screenSize
    }}>
      {children}
    </ResponsiveContext.Provider>
  )
}

export const useResponsive = () => {
  const context = useContext(ResponsiveContext)
  if (!context) throw new Error('useResponsive must be used within ResponsiveProvider')
  return context
}