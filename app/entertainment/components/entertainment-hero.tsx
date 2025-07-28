"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

export default function EntertainmentHero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/entertainment.png')",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* 텍스트 콘텐츠 */}
      <div className="relative z-10 text-center px-6 sm:px-8 lg:px-12 max-w-4xl mx-auto space-y-4">
        <p className="text-white text-xl sm:text-2xl leading-relaxed">너무 재미있는,</p>
        <p className="text-gray-300 text-lg sm:text-xl leading-relaxed">페인 킬러가 아닌 비타민?</p>
        <p className="text-gray-400 text-base sm:text-lg italic leading-relaxed">아니아니..</p>

        <p className="text-2xl sm:text-3xl font-bold text-amber-300 mt-6 leading-relaxed">우리는, 캔디와 초콜렛</p>

        <p className="text-white text-lg sm:text-xl mt-6 leading-relaxed">계속 맛보고 싶은,</p>
        <p className="text-white text-base sm:text-lg tracking-wide leading-relaxed">우리의 엔터테인먼트</p>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-8 text-white leading-tight">
          <span className="text-pink-300">"심지어 눈물도 즐거운"</span>
        </h1>

        <p className="text-base sm:text-lg italic text-gray-500 mb-10 leading-relaxed mt-6">
          Aurum,
          <br />– entertainment department representative, chief
        </p>

        <button
          onClick={() => {
            const el = document.getElementById("seasoning")
            if (el) {
              el.scrollIntoView({ behavior: "smooth" })
            }
          }}
          className="animate-bounce mt-6"
          aria-label="아래로 스크롤"
        >
          <ArrowDown className="h-8 w-8 text-amber-200 mx-auto drop-shadow-lg" />
        </button>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-4 h-4 border-2 border-green-400 rotate-45 animate-pulse"></div>
      <div className="absolute bottom-32 right-16 w-6 h-6 border-2 border-yellow-400 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-20 w-3 h-3 bg-pink-400 rotate-45 animate-pulse delay-500"></div>
    </section>
  )
}