// components/ui/smart-text.tsx
"use client"

import React from 'react'
import { useResponsive } from '@/app/contexts/responsive-context'

interface SmartTextProps {
  children: string
  className?: string
  as?: React.ElementType
  breakPoints?: {
    mobile?: number    // 몇 글자마다 줄바꿈할지
    tablet?: number
    desktop?: number
  }
}

export function SmartText({ 
  children,
  className = "",
  as: Component = 'div',
  breakPoints = { mobile: 6, tablet: 10, desktop: 15 }
}: SmartTextProps) {
  const { screenSize } = useResponsive()
  
  const autoBreak = (text: string): React.ReactNode => {
    const maxLength = breakPoints[screenSize] || breakPoints.desktop || 15
    
    // 의미 단위로 자르기 (한국어 조사/어미 고려)
    const meaningfulBreaks = [
      '은', '는', '이', '가', '을', '를', '에', '에서', '으로', '로', 
      '와', '과', '의', '도', '만', '부터', '까지', '처럼', '같이', '하는', '되는'
    ]
    
    if (text.length <= maxLength) return text
    
    const words = text.split('')
    const result: React.ReactNode[] = []
    let currentLine = ''
    
    for (let i = 0; i < words.length; i++) {
      currentLine += words[i]
      
      if (currentLine.length >= maxLength) {
        // 의미 단위에서 자르기
        let cutPoint = currentLine.length
        for (let j = currentLine.length - 1; j >= Math.max(0, currentLine.length - 3); j--) {
          const checkText = currentLine.substring(j)
          if (meaningfulBreaks.some(ending => checkText.startsWith(ending))) {
            cutPoint = j + 2
            break
          }
        }
        
        result.push(currentLine.substring(0, cutPoint))
        result.push(<br key={i} />)
        currentLine = currentLine.substring(cutPoint)
      }
    }
    
    if (currentLine) result.push(currentLine)
    return result
  }

  return <Component className={className}>{autoBreak(children)}</Component>
}

// 미리 정의된 스타일 컴포넌트들
export function SmartHeroText({ children, className = "" }: { children: string, className?: string }) {
  return (
    <SmartText
      as="h1"
      breakPoints={{ mobile: 4, tablet: 6, desktop: 8 }}
      className={`font-blackHanSans text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] text-[#D4AF37] leading-tight tracking-wide ${className}`}
    >
      {children}
    </SmartText>
  )
}

export function SmartTitle({ children, className = "" }: { children: string, className?: string }) {
  return (
    <SmartText
      as="h1"
      breakPoints={{ mobile: 6, tablet: 10, desktop: 15 }}
      className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight ${className}`}
    >
      {children}
    </SmartText>
  )
}

export function SmartHeading({ children, className = "" }: { children: string, className?: string }) {
  return (
    <SmartText
      as="h2"
      breakPoints={{ mobile: 8, tablet: 12, desktop: 20 }}
      className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold leading-tight tracking-tight ${className}`}
    >
      {children}
    </SmartText>
  )
}

export function SmartBody({ children, className = "" }: { children: string, className?: string }) {
  return (
    <SmartText
      as="p"
      breakPoints={{ mobile: 12, tablet: 20, desktop: 30 }}
      className={`text-base sm:text-lg lg:text-xl leading-relaxed tracking-tight ${className}`}
    >
      {children}
    </SmartText>
  )
}