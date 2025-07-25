"use client"

import { ArrowDown } from "lucide-react"

export default function HistoryHero() {
  return (
    <section className="relative h-[600px] overflow-hidden">
        {/* 배경 이미지 */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/sailing.png')",
            }}
          />
        </div>

        {/* 콘텐츠 영역 */}
        <div className="relative z-10 text-center px-6 sm:px-8 lg:px-12 max-w-4xl mx-auto pt-52">
          <p className="text-3xl text-black mb-4 text-shadow">🕒 2020~현재</p>

          <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 mb-6">
            WAY WE RUN
          </h1>

          <p className="text-lg sm:text-xl text-gray-700 mb-8">
            사회의 일원으로서, 주어진 책임을 다하겠습니다
          </p>

        {/* 해시태그 */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-base font-medium">#시작</span>
          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-base font-medium">#지속성장</span>
          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-base font-medium">#책임</span>
          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-base font-medium">#여정</span>
        </div>


        {/* 스크롤 유도
        <button
          onClick={() => {
            const el = document.getElementById("history-timeline")
            if (el) {
              el.scrollIntoView({ behavior: "smooth" })
            }
          }}
          className="animate-bounce mt-2"
          aria-label="아래로 스크롤"
        >
          <ArrowDown className="h-6 w-6 text-yellow-600 mx-auto drop-shadow" />
        </button>  */}
      </div>

      {/* 플로팅 포인트들 */}
      <div className="absolute top-20 left-10 w-3 h-3 border-2 border-yellow-400 rotate-45 animate-pulse"></div>
      <div className="absolute bottom-32 right-16 w-4 h-4 border-2 border-orange-400 rounded-full animate-pulse delay-500"></div>
    </section>
  )
}
