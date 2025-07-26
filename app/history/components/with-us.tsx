"use client"

export default function WithUs() {
  return (
    <section className="bg-white dark:bg-black py-48 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 text-black dark:text-white">
          With Us 제휴 기관/단체/협회
        </h2>

        <button className="bg-green-400 text-black text-base font-semibold px-6 py-2 rounded-full mb-6 mx-auto">
          함께하고 있어요!
        </button>

        <p className="text-yellow-500 font-semibold text-lg mb-3">Association Relationship</p>
        <hr className="border-yellow-400 mb-8 mx-auto w-64" />

        <div className="text-base sm:text-lg leading-relaxed space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            중소벤처기업부 · 한국콘텐츠진흥원(Kocca) · 서울시 창조경제혁신센터(용산) · 고려대학교 캠퍼스타운 · BGN 밝은눈안과 잠실 · 네이버 웹툰 · 한국소아암재단 · 고려대학연합 클럽 후원위원회 · K-ICT 창업멘토링센터 · 쿠팡플레이 · 아메바컬쳐
          </p>
        </div>
      </div>
    </section>
  )
}
