"use client"

import { useEffect, useState } from "react"
import HeroSection from "../components/hero-section"
// import VisionSection from "../components/vision-section"
import CoreValues from "../components/core-values"
import CultureCarousel from "../components/culture-carousel"
import JoinBanner from "../components/join-banner"

export default function EnglishHomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen"> {/* 🟢 한글 페이지와 동일한 구조 */}
      <main className="flex-grow"> {/* 🟢 layout.tsx의 <main>과 맞물림 */}
        <section className="relative min-h-screen overflow-hidden bg-black">
          <HeroSection />
        </section>

        {/* VisionSection 주석처리 - 한글 페이지와 동일 */}
        {/* <VisionSection /> */}
        
        <CoreValues />
        <CultureCarousel />
        <JoinBanner />
      </main>
      {/* Footer는 layout.tsx에 이미 들어있기 때문에 여기선 필요 없음 */}
    </div>
  )
}