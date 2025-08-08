"use client"

import { useEffect, useState } from "react"
import LifeHero from "./components/life-hero"
import LifeFeature from "./components/life-feature"
import LifeContact from "./components/life-contact"

// 은은한 구분선 컴포넌트
const SectionDivider = () => (
  <div className="relative w-full h-px my-8">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/60 to-transparent dark:via-gray-600/40"></div>
  </div>
)

export default function LifePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col w-full h-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="snap-start h-screen w-full flex-shrink-0">
        <LifeHero />
      </section>

      <SectionDivider />

      {/* Product Features (snap scroll 대상) */}
      <section id="product-feature-1" className="snap-start h-screen w-full flex-shrink-0">
        <LifeFeature
          color="red"
          title="돈키호테"
          description={`돈키호테 유닛은, 불특정 다수 대중들의 보편적인 레저 형태에서 벗어나, 그동안 내가 겪어보지 않아서, 생소했던 새로운 경험들과 재미들을 찾고, 내 삶의 일부분으로 융합할 수 있는 라이프 서비스입니다.`}
          image="/images/Lifeplatform1.webp"
          tags={["모험적", "탐험", "새로움", "어드벤쳐"]}
        />
      </section>

      <SectionDivider />

      <section className="snap-start h-screen w-full flex-shrink-0">
        <LifeFeature
          color="green"
          title="알렉산드리아"
          description={`알렉산드리아 유닛은, 그 순간이 지나면 그대로 흘러가 주워담을 수 없는, 실제 삶 속의 나의 말과 행동, 흔적과 기록 중 내가 원하는 것들을 아카이빙하여, 나의 라이프의 가치를 올려줍니다.`}
          image="/images/Lifeplatform2.webp"
          tags={["수집", "기록", "아카이빙", "기억"]}
        />
      </section>

      <SectionDivider />

      <section className="snap-start h-screen w-full flex-shrink-0">
        <LifeFeature
          color="blue"
          title="사트라프"
          description={`샤프라트 유닛은, 나의 삶을 세상과 가장 밀접한 형태로 연결하여, 같이, 함께 하는 사회 속에서 나의 위치와 정체성을 공고히 하고 더 나아가 그 다음의 방향을 정확하게 탐색하는 라이프 서비스입니다.`}
          image="/images/Lifeplatform3.webp"
          tags={["연결", "상호작용", "방향", "긴밀함"]}
        />
      </section>

      <SectionDivider />

      {/* Contact Section (scroll snap 제외) */}
      <section className="min-h-screen w-full">
        <LifeContact />
      </section>
    </div>
  )
}