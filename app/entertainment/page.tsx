"use client"

import { useEffect, useState } from "react"
import EntertainmentHero from "./components/entertainment-hero"
import EntertainmentContact from "./components/entertainment-contact"
import EntertainmentFeature from "./components/entertainment-feature"

// 은은한 구분선 컴포넌트
const SectionDivider = () => (
  <div className="relative w-full h-px my-8">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/60 to-transparent dark:via-gray-600/40"></div>
  </div>
)

export default function EntertainmentPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {/* ✅ Hero */}
        <section className="min-h-screen">
          <EntertainmentHero />
        </section>

        {/* ✅ Features - 구분선 추가 */}
        <section id="seasoning" className="bg-white dark:bg-black">
          <EntertainmentFeature 
            color="red"
            title="시즈닝 [Seasoning]"
            description={`시즈닝은, 엔터테인먼트 분야와 스타일 라인을 결합하여, 트렌디한 패션 제품들을 고객들에게 선보이는, 마케팅 서비스입니다.`}
            image="/images/Entertainment1.webp"
          />
        </section>

        <SectionDivider />

        <section className="bg-white dark:bg-black">
          <EntertainmentFeature 
            color="green"
            title="달콤 [dalkomm]"
            description={`달콤은, 엔터테인먼트 분야와 코스메틱 라인을 결합하여 신뢰성 있는 뷰티 제품을 고객들에게 선보이는, 마케팅 서비스 입니다.`}
            image="/images/Entertainment2.webp"
          />
        </section>

        <SectionDivider />

        <section className="bg-white dark:bg-black">
          <EntertainmentFeature 
            color="blue"
            title="다즐링 [dhazzling]"
            description={`다즐링은, 엔터테인먼트 분야와 이벤트 라인을 결합하여 매력적인 신상품들을 고객들에게 선보이는, 마케팅 서비스 입니다.`}
            image="/images/Entertainment3.webp"
          />
        </section>

        <SectionDivider />

        {/* ✅ Contact */}
        <section className="min-h-screen">
          <EntertainmentContact />
        </section>
      </div>
    </div>
  )
}