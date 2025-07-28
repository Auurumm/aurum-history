"use client"

import Image from "next/image"

export default function HeroSection() {
  const handleScroll = () => {
    const target = document.getElementById("scroll-target")
    if (target) {
      // 헤더 높이를 고려하여 오프셋 추가
      const headerOffset = 100; // 헤더 높이에 맞게 조정
      const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  }

  return (
    <section className="relative h-[90vh] flex flex-col justify-center items-center text-center overflow-hidden">
      <Image
        src="/images/girl.png"
        alt="Hero Background"
        fill
        className="object-cover brightness-50"
        priority
      />
      <div className="relative z-10">
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-8 drop-shadow-2xl">
          안내드립니다
        </h1>
        <button
          onClick={handleScroll}
          className="mt-8 text-white text-4xl animate-bounce cursor-pointer focus:outline-none hover:text-yellow-400 transition-colors duration-300"
          aria-label="아래로 스크롤"
        >
          ↓
        </button>
      </div>
    </section>
  )
}