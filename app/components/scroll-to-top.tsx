"use client"

import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"
import { usePathname } from "next/navigation"

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // 마운트 상태 및 모바일 감지
  useEffect(() => {
    const checkIsMobile = () => {
      // 화면 크기와 터치 지원 여부로 모바일 감지
      const screenWidth = window.innerWidth
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      return screenWidth < 768 || isTouchDevice
    }

    setIsMobile(checkIsMobile())
    setMounted(true)

    const handleResize = () => {
      setIsMobile(checkIsMobile())
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 페이지 이동 시 스크롤 맨 위로
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
          setScrollProgress(scrollPercent)
          // 데스크톱에서만 표시 (스크롤이 300px 이상일 때)
          setIsVisible(!isMobile && scrollTop > 300)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [isMobile])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const radius = 18
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

  // 모바일이거나 마운트되지 않았거나 보이지 않는 경우 렌더링하지 않음
  if (!mounted || isMobile || !isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className="group transition-transform duration-300 hover:scale-110"
      aria-label="Scroll to top"
      style={{
        // 데스크톱 전용 고정 위치
        position: 'fixed',
        bottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
        right: 'max(24px, env(safe-area-inset-right, 24px))',
        zIndex: 40,
        // 렌더링 최적화
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitTransform: 'translateZ(0)',
        WebkitBackfaceVisibility: 'hidden',
        // 최소 크기 보장
        minWidth: '48px',
        minHeight: '48px',
        maxWidth: '48px',
        maxHeight: '48px',
        // 렌더링 안정화
        contain: 'layout style paint',
        willChange: 'transform'
      }}
    >
      {/* 컨테이너: 고정 크기 + 상대 위치 */}
      <div 
        className="relative w-12 h-12"
        style={{
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* 백그라운드 프로그레스 */}
        <svg 
          className="absolute top-0 left-0 w-full h-full -rotate-90" 
          viewBox="0 0 48 48"
          style={{
            width: '48px',
            height: '48px',
            pointerEvents: 'none'
          }}
        >
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            className="text-gray-300 dark:text-gray-700"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-yellow-500 transition-[stroke-dashoffset] duration-200 ease-out"
            strokeLinecap="round"
          />
        </svg>

        {/* 중앙 아이콘 */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            pointerEvents: 'none'
          }}
        >
          <div 
            className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center group-hover:bg-yellow-100 dark:group-hover:bg-gray-700 transition-colors"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronUp 
              className="w-4 h-4 text-gray-700 dark:text-gray-200 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors"
              style={{
                width: '16px',
                height: '16px'
              }}
            />
          </div>
        </div>
      </div>
    </button>
  )
}