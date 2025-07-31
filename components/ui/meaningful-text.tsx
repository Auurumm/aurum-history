// components/ui/meaningful-text.tsx
import { addMeaningfulBreaks } from '@/utils/text-utils'

interface MeaningfulTextProps {
  children: string
  className?: string
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div'
}

export function MeaningfulText({ 
  children, 
  className = "", 
  as: Component = 'p' 
}: MeaningfulTextProps) {
  return (
    <Component 
      className={className}
      dangerouslySetInnerHTML={{ 
        __html: addMeaningfulBreaks(children) 
      }}
    />
  )
}

// 미리 스타일링된 버전들
export function MeaningfulTitle({ children, className = "" }: { children: string, className?: string }) {
  return (
    <MeaningfulText 
      as="h1" 
      className={`title ${className}`}
    >
      {children}
    </MeaningfulText>
  )
}

export function MeaningfulBody({ children, className = "" }: { children: string, className?: string }) {
  return (
    <MeaningfulText 
      as="p" 
      className={`body ${className}`}
    >
      {children}
    </MeaningfulText>
  )
}