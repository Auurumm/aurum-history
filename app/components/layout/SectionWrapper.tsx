// components/layout/SectionWrapper.tsx
import { ReactNode } from "react"

export default function SectionWrapper({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`px-4 sm:px-6 lg:px-8 max-w-full xl:max-w-screen-xl mx-auto w-full ${className}`}>
      {children}
    </div>
  )
}
