// 📄 brand-barracks.tsx (모바일 여백 개선)
"use client"

export default function BrandBarracks() {
  return (
    <section className="snap-start min-h-screen flex items-center justify-center px-6 py-20 sm:px-6 sm:py-24 lg:px-8 bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        {/* 이미지 및 라벨 */}
        <div className="relative mb-14">
          <img
            src="/images/barracks.png"
            alt="BarRacks"
            className="w-full max-w-xs aspect-square object-cover mx-auto rounded-lg shadow-lg border border-emerald-400"
          />
          <div className="absolute top-4 left-4 bg-green-400 text-black text-xl px-6 py-2 font-extrabold rounded-full shadow-lg">
            02. BarRacks
          </div>
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-green-400 mb-6 leading-snug">
          BarRacks
        </h2>

        <p className="text-base sm:text-xl font-semibold text-green-500 dark:text-green-300 mb-4 leading-relaxed">
          #인사가 만사라는데.. 신입 뽑기가 제일 무서워..!
        </p>

        <p className="italic text-sm sm:text-lg text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          이젠 직접 같이 일해보고 뽑으세요.
          <br />
          예측이 아닌 확신으로! 기대가 아닌 결과로!
        </p>

        <p className="text-base sm:text-xl leading-loose text-gray-800 dark:text-gray-300">
          신입 인재 채용 플랫폼 <strong>"배럭스"</strong> 는, <br />
          우리 회사의 문화와 직무에 가장 잘 커스터마이징된 인재를 찾아 실제 업무 프로젝트를 진행, 그 성과를 바탕으로 채용 여부를 결정하는 인재 발굴 서비스입니다.
          회사 젊은 미래를 <strong>배럭스</strong>에서 탄탄하게 키워보세요!
        </p>
      </div>
    </section>
  )
}
