"use client"

import { ArrowDown } from "lucide-react"

export default function BrandHero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/brand.png')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-12">
        <p className="text-base sm:text-lg text-amber-200 mb-4 tracking-wide drop-shadow-lg">
          브랜드는, 만드는 것이 아니에요
        </p>

        <p className="text-base sm:text-xl text-amber-100 mb-4 drop-shadow-lg leading-relaxed">
          빚어내는 것
        </p>

        <h1 className="text-4xl sm:text-7xl lg:text-8xl font-bold mb-8 leading-snug sm:leading-tight text-white drop-shadow-2xl">
          "<span className="text-yellow-400">정성으로 빚는 것</span>"
        </h1>

        <p className="text-sm sm:text-lg text-amber-50 mb-10 leading-relaxed sm:leading-loose drop-shadow-lg">
          브랜드는 하루아침에 만들어지지 않아.<br />
          장인의 손길처럼, 시간과 정성으로 빚어내는 것
        </p>

        <p className="text-xs sm:text-base italic text-amber-200 mb-10 drop-shadow-lg leading-relaxed">
          Aurum,<br />– Brand department representative, chief
        </p>

        <button
          onClick={() => {
            const el = document.getElementById("brand-story")
            if (el) el.scrollIntoView({ behavior: "smooth" })
          }}
          className="animate-bounce mt-4"
          aria-label="아래로 스크롤"
        >
          <ArrowDown className="h-7 w-7 text-amber-200 mx-auto drop-shadow-lg" />
        </button>
      </div>

      <div className="absolute top-20 left-10 w-4 h-4 border-2 border-amber-400 rotate-45 animate-pulse"></div>
      <div className="absolute bottom-32 right-16 w-6 h-6 border-2 border-orange-400 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-20 w-3 h-3 bg-amber-500 rotate-45 animate-pulse delay-500"></div>
    </section>
  )
}