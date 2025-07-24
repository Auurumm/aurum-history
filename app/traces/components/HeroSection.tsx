"use client";

import Image from "next/image";

export default function HeroSection() {
  const handleScroll = () => {
    const target = document.getElementById("scroll-target");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-72 bg-white text-black dark:bg-black dark:text-white overflow-hidden flex flex-col justify-center items-center text-center">
      <Image
        src="/images/members3.png" // ✅ 사내 이미지 추천: 팀워크, 커뮤니티, 도시풍 등
        alt="Trace Hero"
        fill
        className="object-cover opacity-90"
        priority
      />
      <div className="relative z-10 px-4">
        <h1 className="text-4xl font-extrabold mb-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-relaxed">
          팀원들과의 <br /> 즐거운 순간, 회고, 모임 기록을 함께 남기세요.
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto drop-shadow-sm">
          
        </p>
        <button
           className="mt-10 px-6 py-3 bg-yellow-400 text-white hover:bg-yellow-500 hover:text-black rounded-full transition-colors"
        >
          지금 피드 보기 ↓
        </button>
      </div>
    </section>
  );
}
