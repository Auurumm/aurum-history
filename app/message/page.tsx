"use client"

import { useEffect, useRef, useState } from "react"
import MessageHero from "./components/message-hero"
import MissionSection from "./components/mission-section"

export default function MessagePage() {
  const [mounted, setMounted] = useState(false)
  const missionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToMission = () => {
    missionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* 콘텐츠를 채우는 본문 영역 */}
      <div className="flex-grow">
        <section className="min-h-screen">
          <MessageHero onScrollToNext={scrollToMission} />
        </section>

        <section ref={missionRef} className="min-h-screen">
          <MissionSection />
        </section>
      </div>
    </div>
  )
}
