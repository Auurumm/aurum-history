"use client";

import Image from "next/image";

export default function WondersHeroSection() {
  const handleScroll = () => {
    const target = document.getElementById("scroll-target");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-72 bg-white text-black dark:bg-black dark:text-white overflow-hidden flex flex-col justify-center items-center text-center">
      <Image
        src="/images/recruit-hero.png"
        alt="Customer Support"
        fill
        className="object-cover opacity-80"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50"></div>
      
      <div className="relative z-10 px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] leading-tight">
          궁금해요
        </h1>
        <p className="text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-sm mb-8 leading-relaxed">
          저희에 대해 궁금한 점이나 문의사항이 있으시면 언제든지 연락해주세요.<br />
          오럼의 전문 상담원이 신속하고 정확하게 답변드리겠습니다.
        </p>
        
        {/* 연락처 정보 */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
            <h3 className="font-semibold mb-1">📞 전화 문의</h3>
            <p className="text-sm opacity-90">02-417-7009</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
            <h3 className="font-semibold mb-1">📧 이메일 문의</h3>
            <p className="text-sm opacity-90">account@aurum.nexus</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
            <h3 className="font-semibold mb-1">🕘 운영 시간</h3>
            <p className="text-sm opacity-90">평일 10:00 - 17:00</p>
          </div>
        </div>
        
        <button
          onClick={handleScroll}
          className="mt-6 px-8 py-4 bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black rounded-full transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          궁금해요 게시판 보기 ↓
        </button>
      </div>
    </section>
  );
}