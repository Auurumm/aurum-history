"use client"

import { useLanguage } from "@/app/contexts/language-context"
import CoreValues from "./core-values"

export default function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden mb-[-1px] bg-black will-change-transform">
      {/* ✅ 강제 배경 덮기 */}
      <div className="absolute top-0 left-0 w-full h-full bg-black z-0" />

      {/* ✅ 하단 덮개 (회색띠 제거용) */}
      <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-black z-50 pointer-events-none" />

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover opacity-50 z-0"
      >
        <source src="/images/main.mp4" type="video/mp4" />
      </video>


      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/30 z-10" />

      {/* Radial Background */}
      <div className="absolute inset-0 opacity-10 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-24">
        <h2
          className="font-eastSeaDokdo text-7xl sm:text-8xl lg:text-9xl xl:text-[10rem] text-[#D4AF37] leading-tight tracking-wide mb-12"
          style={{
            textShadow: "6px 6px 12px rgba(0, 0, 0, 0.85)"
          }}
        >
          흐르는 <br /> 강물처럼<span className="opacity-60 font-serif">...</span>
        </h2>


        <p className="text-white text-base leading-relaxed break-keep max-w-xs sm:max-w-md mx-auto text-balance">
          모두의 삶에 도움이 되는 기능들, <br />
          언제나 항상 있어야 하는 그러한 서비스를 만듭니다
        </p>



      </div>



      {/* Scroll Down Button */}
      <button
        onClick={() => {
          const nextSection = document.getElementById("next-section")
          nextSection?.scrollIntoView({ behavior: "smooth" })
        }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce"
        aria-label="Scroll down"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>


      
      {/* ✅ 덮개 박스 */}
    <div className="absolute bottom-0 left-0 w-full h-[4px] bg-gradient-to-b from-black to-transparent z-50 pointer-events-none" />
    </section>
  )
}
