"use client"
import { Suspense, useEffect, useState } from "react"
import GalleryHero from "./components/gallery-hero"
import GalleryGrid from "./components/gallery-grid"

function GalleryContent() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <div className="flex-grow snap-y snap-mandatory">
        {/* Hero - snap scroll */}
        <section className="min-h-screen snap-start">
          <GalleryHero />
        </section>
        {/* Grid - 자유 스크롤 영역 */}
        <section className="bg-white dark:bg-black text-black dark:text-white py-20">
          <GalleryGrid />
        </section>
      </div>
    </div>
  )
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-400">로딩 중...</div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  )
}
