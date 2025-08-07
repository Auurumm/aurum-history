"use client"

import { useEffect } from 'react'

export default function ZoomPrevention() {
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault()
      }
    }

    const preventWheelZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
      }
    }

    const preventKeyboardZoom = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchstart', preventZoom, { passive: false })
    document.addEventListener('touchmove', preventZoom, { passive: false })
    document.addEventListener('wheel', preventWheelZoom, { passive: false })
    document.addEventListener('keydown', preventKeyboardZoom, { passive: false })

    return () => {
      document.removeEventListener('touchstart', preventZoom)
      document.removeEventListener('touchmove', preventZoom)
      document.removeEventListener('wheel', preventWheelZoom)
      document.removeEventListener('keydown', preventKeyboardZoom)
    }
  }, [])

  return null
}