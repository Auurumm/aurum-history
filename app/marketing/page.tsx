// MarketingPage with Scroll Snap
"use client"

import { useEffect, useState } from "react"
import MarketingHero from "./components/marketing-hero"
import MarketingContact from "./components/marketing-contact"
import ProductFeature from "./components/marketing-feature"

export default function MarketingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <div className="flex-grow">
        
        {/* 히어로 섹션 - 일반 스크롤 */}
        <section className="min-h-screen">
          <MarketingHero />
        </section>

        {/* 상품 섹션들 - 스크롤 스냅 적용 */}
        <div className="snap-y snap-mandatory overflow-y-auto">
          <section id="hexar" className="h-auto py-40 snap-start">
            <ProductFeature
              color="red"
              title="HEXar [헥사르, 115]"
              description={`핵심 타겟의 심장에 각인되는 브랜딩 마케팅을\n누구나 접할 수 있는 일상에서 구현합니다.`}
              image="/images/marketing1.png"
            />
          </section>

          <section className="h-auto py-40 snap-start">
            <ProductFeature
              color="green"
              title="Leaf [리프, 032]"
              description={`강력한 미디어 셀링, 아트워크 중심의 빠른 이슈화\n브랜드 인식과 대중 파급을 동시에 이끌어냅니다.`}
              image="/images/marketing2.png"
            />
          </section>

          <section className="h-auto py-40 snap-start">
            <ProductFeature
              color="blue"
              title="Ainess [아이네스, 030]"
              description={`아티스트의 셀럽룸 브랜딩과 유니버스 확장으로\n더 큰 세계 시장 진출을 서포트합니다.`}
              image="/images/marketing3.png"
            />
          </section>
        </div>

        {/* 연락처 섹션 - 일반 스크롤 */}
        <section className="min-h-screen">
          <MarketingContact />
        </section>
      </div>
    </div>
  )
}