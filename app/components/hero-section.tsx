"use client"

import { useLanguage } from "@/app/contexts/language-context"

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

      {/* Content with Magic Circles + Flowing Golden Effect - 전체적으로 아래로 이동 */}
      <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-16 pt-16">
        
        {/* 마법진 + 흐르는 효과 컨테이너 - 크기를 줄이고 위치 조정 */}
        <div className="relative flex items-center justify-center mb-16">
          
          {/* 외부 큰 원 - 천천히 시계방향 회전, 크기 축소 */}
          <div className="absolute w-[38rem] h-[38rem] max-w-[75vw] max-h-[75vw] animate-spin-slow">
            <svg className="w-full h-full" viewBox="0 0 400 400">
              <circle
                cx="200"
                cy="200"
                r="180"
                fill="none"
                stroke="rgba(212, 175, 55, 0.3)"
                strokeWidth="2"
                strokeDasharray="10 5"
                className="animate-pulse"
              />
              <circle
                cx="200"
                cy="200"
                r="160"
                fill="none"
                stroke="rgba(212, 175, 55, 0.2)"
                strokeWidth="1"
                strokeDasharray="5 10"
              />
              {/* 마법진 장식 원들 */}
              <circle cx="200" cy="40" r="8" fill="rgba(212, 175, 55, 0.4)" className="animate-pulse" />
              <circle cx="360" cy="200" r="6" fill="rgba(212, 175, 55, 0.3)" className="animate-pulse" />
              <circle cx="200" cy="360" r="8" fill="rgba(212, 175, 55, 0.4)" className="animate-pulse" />
              <circle cx="40" cy="200" r="6" fill="rgba(212, 175, 55, 0.3)" className="animate-pulse" />
            </svg>
          </div>

          {/* 중간 원 - 반시계방향 회전, 크기 축소 */}
          <div className="absolute w-[28rem] h-[28rem] max-w-[60vw] max-h-[60vw] animate-reverse-spin">
            <svg className="w-full h-full" viewBox="0 0 300 300">
              <circle
                cx="150"
                cy="150"
                r="120"
                fill="none"
                stroke="rgba(212, 175, 55, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="15 5 5 5"
              />
              <circle
                cx="150"
                cy="150"
                r="100"
                fill="none"
                stroke="rgba(212, 175, 55, 0.25)"
                strokeWidth="1"
                strokeDasharray="8 12"
              />
              {/* 기하학적 패턴 */}
              <polygon
                points="150,50 200,100 150,150 100,100"
                fill="none"
                stroke="rgba(212, 175, 55, 0.2)"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* 내부 작은 원 - 빠른 시계방향 회전, 크기 축소 */}
          <div className="absolute w-[20rem] h-[20rem] max-w-[45vw] max-h-[45vw] animate-spin-fast">
            <svg className="w-full h-full" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="rgba(212, 175, 55, 0.5)"
                strokeWidth="2"
                strokeDasharray="3 7"
                className="animate-pulse"
              />
              <circle
                cx="100"
                cy="100"
                r="60"
                fill="none"
                stroke="rgba(212, 175, 55, 0.3)"
                strokeWidth="1"
                strokeDasharray="20 5"
              />
              {/* 중앙 별 모양 */}
              <polygon
                points="100,40 108,68 136,68 114,86 122,114 100,96 78,114 86,86 64,68 92,68"
                fill="rgba(212, 175, 55, 0.2)"
                className="animate-pulse"
              />
            </svg>
          </div>

          {/* 🌟 새로 추가: 마법진 위로 흐르는 황금 라인 효과, 크기 축소 */}
          <div className="absolute w-[42rem] h-[42rem] max-w-[80vw] max-h-[80vw] pointer-events-none">
            {/* 첫 번째 흐르는 라인 - 마법진을 가로지르며 */}
            <div className="absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 800 800" preserveAspectRatio="none">
                <path
                  d="M-200,400 Q200,200 400,400 T1000,400"
                  fill="none"
                  stroke="url(#flowingGradient1)"
                  strokeWidth="4"
                  className="animate-flow-1"
                />
                <defs>
                  <linearGradient id="flowingGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255, 215, 0, 0)" />
                    <stop offset="30%" stopColor="rgba(255, 215, 0, 0.8)" />
                    <stop offset="50%" stopColor="rgba(255, 223, 0, 1)" />
                    <stop offset="70%" stopColor="rgba(255, 215, 0, 0.8)" />
                    <stop offset="100%" stopColor="rgba(255, 215, 0, 0)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* 두 번째 흐르는 라인 - 다른 각도로 */}
            <div className="absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 800 800" preserveAspectRatio="none">
                <path
                  d="M-200,350 Q300,550 500,350 T1000,350"
                  fill="none"
                  stroke="url(#flowingGradient2)"
                  strokeWidth="3"
                  className="animate-flow-2"
                />
                <defs>
                  <linearGradient id="flowingGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(212, 175, 55, 0)" />
                    <stop offset="40%" stopColor="rgba(212, 175, 55, 0.7)" />
                    <stop offset="60%" stopColor="rgba(255, 215, 0, 0.9)" />
                    <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* 세 번째 흐르는 라인 - 또 다른 각도 */}
            <div className="absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 800 800" preserveAspectRatio="none">
                <path
                  d="M-200,450 Q150,250 450,450 T1000,450"
                  fill="none"
                  stroke="url(#flowingGradient3)"
                  strokeWidth="3.5"
                  className="animate-flow-3"
                />
                <defs>
                  <linearGradient id="flowingGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255, 215, 0, 0)" />
                    <stop offset="25%" stopColor="rgba(255, 215, 0, 0.5)" />
                    <stop offset="50%" stopColor="rgba(255, 223, 0, 1)" />
                    <stop offset="75%" stopColor="rgba(255, 215, 0, 0.5)" />
                    <stop offset="100%" stopColor="rgba(255, 215, 0, 0)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* 🌟 흐르는 파티클 효과 - 마법진 위를 지나감, 크기 축소 */}
          <div className="absolute w-[46rem] h-[46rem] max-w-[85vw] max-h-[85vw] overflow-hidden pointer-events-none">
            <div className="absolute w-3 h-3 bg-[#FFD700] rounded-full animate-particle-1 opacity-90 shadow-lg shadow-yellow-500/60"></div>
            <div className="absolute w-2 h-2 bg-[#FFF700] rounded-full animate-particle-2 opacity-80 shadow-md shadow-yellow-400/50"></div>
            <div className="absolute w-4 h-4 bg-[#FFD700] rounded-full animate-particle-3 opacity-85 shadow-lg shadow-yellow-500/40"></div>
            <div className="absolute w-1 h-1 bg-[#FFF700] rounded-full animate-particle-4 opacity-95"></div>
            <div className="absolute w-2 h-2 bg-[#D4AF37] rounded-full animate-particle-5 opacity-70"></div>
            {/* 추가 파티클들 */}
            <div className="absolute w-3 h-3 bg-[#FFE55C] rounded-full animate-particle-6 opacity-75 shadow-md shadow-yellow-300/30"></div>
            <div className="absolute w-1 h-1 bg-[#FFD700] rounded-full animate-particle-7 opacity-90"></div>
          </div>

          {/* 반짝이는 파티클들 (기존 고정 파티클), 크기 축소 */}
          <div className="absolute w-[42rem] h-[42rem] max-w-[80vw] max-h-[80vw]">
            <div className="absolute top-10 left-20 w-2 h-2 bg-[#D4AF37] rounded-full animate-ping opacity-70"></div>
            <div className="absolute top-32 right-16 w-1 h-1 bg-[#D4AF37] rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 left-32 w-3 h-3 bg-[#D4AF37] rounded-full animate-bounce opacity-50"></div>
            <div className="absolute bottom-40 right-24 w-1 h-1 bg-[#D4AF37] rounded-full animate-ping"></div>
            <div className="absolute top-1/2 left-8 w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse opacity-60"></div>
            <div className="absolute top-1/2 right-8 w-1 h-1 bg-[#D4AF37] rounded-full animate-bounce"></div>
          </div>

          {/* 메인 텍스트 - 폰트 크기 약간 축소 */}
          <h2 className="relative z-30 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-[#D4AF37] leading-tight"
            style={{
              fontFamily: 'OotmanFont, Black Han Sans, sans-serif',
              letterSpacing: '0.02em',
              fontWeight: 'normal',
              textShadow: '0 0 20px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.3), 0 0 60px rgba(255, 215, 0, 0.2)'
            }}>
            흐르는 <br /> 강물처럼
          </h2>
        </div>

        {/* 설명 텍스트 - 크기 확대 및 위치 조정 */}
        <p className="text-white text-lg sm:text-xl lg:text-2xl leading-relaxed break-keep max-w-md sm:max-w-lg lg:max-w-xl mx-auto text-balance mt-8">
          모두의 삶에 도움이 되는 기능들, <br />
          언제나 항상 있어야 하는 그러한 서비스를 만듭니다
        </p>

        {/* 🆕 클릭 유도 버튼 - 모바일에서 특히 눈에 띄게 */}
        <div className="mt-12 sm:mt-16">
          <button
            onClick={() => {
              const nextSection = document.getElementById("next-section")
              nextSection?.scrollIntoView({ behavior: "smooth" })
            }}
            className="group relative bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-sm border border-amber-400/30 rounded-full px-6 py-3 sm:px-8 sm:py-4 text-white hover:bg-gradient-to-r hover:from-amber-500/30 hover:to-yellow-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            {/* 반짝이는 테두리 효과 */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-amber-400/50 to-transparent animate-pulse opacity-60"></div>
            
            { /*버튼 텍스트 
            <span className="relative text-base sm:text-lg font-medium text-amber-100 group-hover:text-white transition-colors duration-300">
              모두를 행복하게 할 수는 없지만
            </span>*/}
            
            {/* 우측 화살표 아이콘 */}
            <svg 
              className="inline-block ml-2 w-4 h-4 sm:w-5 sm:h-5 text-amber-300 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* 🆕 모바일 전용 추가 힌트 텍스트 */}
          <p className="block sm:hidden text-amber-200/70 text-sm mt-3 animate-pulse">
            탭하여 자세히 알아보기 ↑
          </p>
        </div>
      </div>

      {/* Scroll Down Button - 기존 위치 유지 */}
      <button
        onClick={() => {
          const nextSection = document.getElementById("next-section")
          nextSection?.scrollIntoView({ behavior: "smooth" })
        }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce opacity-60"
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

      {/* 커스텀 애니메이션 스타일 */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        /* 🌊 흐르는 황금 라인 애니메이션 */
        @keyframes flow-1 {
          0% { stroke-dasharray: 0 2000; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 200 2000; stroke-dashoffset: -400; }
          100% { stroke-dasharray: 0 2000; stroke-dashoffset: -800; }
        }
        
        @keyframes flow-2 {
          0% { stroke-dasharray: 0 1800; stroke-dashoffset: 0; }
          60% { stroke-dasharray: 150 1800; stroke-dashoffset: -350; }
          100% { stroke-dasharray: 0 1800; stroke-dashoffset: -700; }
        }
        
        @keyframes flow-3 {
          0% { stroke-dasharray: 0 2200; stroke-dashoffset: 0; }
          40% { stroke-dasharray: 180 2200; stroke-dashoffset: -450; }
          100% { stroke-dasharray: 0 2200; stroke-dashoffset: -900; }
        }
        
        /* ✨ 파티클 흐름 애니메이션 */
        @keyframes particle-1 {
          0% { transform: translateX(-100px) translateY(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(calc(100vw + 100px)) translateY(-20px); opacity: 0; }
        }
        
        @keyframes particle-2 {
          0% { transform: translateX(-80px) translateY(10px); opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.8; }
          100% { transform: translateX(calc(100vw + 80px)) translateY(-10px); opacity: 0; }
        }
        
        @keyframes particle-3 {
          0% { transform: translateX(-120px) translateY(-5px); opacity: 0; }
          8% { opacity: 1; }
          92% { opacity: 1; }
          100% { transform: translateX(calc(100vw + 120px)) translateY(15px); opacity: 0; }
        }
        
        @keyframes particle-4 {
          0% { transform: translateX(-60px) translateY(15px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(calc(100vw + 60px)) translateY(-25px); opacity: 0; }
        }
        
        @keyframes particle-5 {
          0% { transform: translateX(-90px) translateY(-10px); opacity: 0; }
          12% { opacity: 0.7; }
          88% { opacity: 0.7; }
          100% { transform: translateX(calc(100vw + 90px)) translateY(20px); opacity: 0; }
        }
        
        /* ✨ 추가 파티클 애니메이션 */
        @keyframes particle-6 {
          0% { transform: translateX(-110px) translateY(5px); opacity: 0; }
          12% { opacity: 0.9; }
          88% { opacity: 0.9; }
          100% { transform: translateX(calc(100vw + 110px)) translateY(-15px); opacity: 0; }
        }
        
        @keyframes particle-7 {
          0% { transform: translateX(-70px) translateY(-8px); opacity: 0; }
          18% { opacity: 1; }
          82% { opacity: 1; }
          100% { transform: translateX(calc(100vw + 70px)) translateY(12px); opacity: 0; }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-reverse-spin {
          animation: reverse-spin 15s linear infinite;
        }
        
        .animate-spin-fast {
          animation: spin-fast 8s linear infinite;
        }
        
        /* 흐르는 라인 애니메이션 적용 */
        .animate-flow-1 {
          animation: flow-1 5s ease-in-out infinite;
        }
        
        .animate-flow-2 {
          animation: flow-2 6s ease-in-out infinite 2s;
        }
        
        .animate-flow-3 {
          animation: flow-3 5.5s ease-in-out infinite 4s;
        }
        
        /* 파티클 애니메이션 적용 */
        .animate-particle-1 {
          animation: particle-1 7s linear infinite;
        }
        
        .animate-particle-2 {
          animation: particle-2 8s linear infinite 1.5s;
        }
        
        .animate-particle-3 {
          animation: particle-3 6s linear infinite 3s;
        }
        
        .animate-particle-4 {
          animation: particle-4 9s linear infinite 0.5s;
        }
        
        .animate-particle-5 {
          animation: particle-5 7.5s linear infinite 4.5s;
        }
        
        .animate-particle-6 {
          animation: particle-6 6.5s linear infinite 2.5s;
        }
        
        .animate-particle-7 {
          animation: particle-7 8.5s linear infinite 5s;
        }
      `}</style>
    </section>
  )
}