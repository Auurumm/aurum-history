"use client"

import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"
import { usePathname } from "next/navigation"

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const pathname = usePathname()

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
          setIsVisible(scrollTop > 300)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const radius = 18
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 group transition-transform duration-300 hover:scale-110"
      aria-label="Scroll to top"
    >
      {/* 컨테이너: 고정 크기 + 상대 위치 */}
      <div className="relative w-12 h-12">
        {/* 백그라운드 프로그레스 */}
        <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center group-hover:bg-yellow-100 dark:group-hover:bg-gray-700 transition-colors">
            <ChevronUp className="w-4 h-4 text-gray-700 dark:text-gray-200 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors" />
          </div>
        </div>
      </div>
    </button>
  )
}
