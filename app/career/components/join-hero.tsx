"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

export default function JoinHero() {
  const scrollToContent = () => {
    const nextSection = document.getElementById("join-content") || 
                       document.querySelector('section:nth-of-type(2)') ||
                       document.querySelector('[data-section="join"]');
    
    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
      
      // 추가적인 여백을 위한 미세 조정
      setTimeout(() => {
        window.scrollBy({
          top: -60, // 위쪽으로 60px 여백 추가
          behavior: "smooth"
        });
      }, 800); // 스크롤 완료 후 실행
    } else {
      // 대안으로 한 화면 아래로 스크롤
      window.scrollBy({
        top: window.innerHeight - 100, // 약간의 여백 추가
        behavior: 'smooth'
      });
    }
  }

  return (
    <section
        className="w-full h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center text-white px-6 relative"
        style={{ backgroundImage: "url('/images/recruit.png')" }}
        >
      <div className="max-w-4xl text-center mt-20 md:mt-40">
        <motion.h1
            className="text-4xl md:text-6xl font-bold leading-[1.8] text-white"
            style={{ textShadow: "2px 2px 6px rgba(0, 0, 0, 0.6)" }}
            >
            우리와 함께<br />
            다르게 일할 동료를 찾습니다
        </motion.h1>

        <motion.p
            className="mt-6 text-lg md:text-xl font-light text-white"
            style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.7)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            >
            원칙과 배려 사이, 효율과 공감 사이.<br />
            작지만 유연한 팀과 새로운 방식으로 일해요.
            </motion.p>


        {/* <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <a
            href="#apply"
            className="inline-block px-8 py-3 border border-yellow-400 bg-yellow-400 text-white rounded-full 
                      hover:bg-yellow-500 hover:text-black transition"
          >
            함께하기
          </a> 

        </motion.div>*/}
      </div>

      {/* Scroll Down Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <button
          onClick={scrollToContent}
          className="flex flex-col items-center text-white hover:text-yellow-400 transition-colors group animate-bounce"
        >
          <span 
            className="text-sm mb-2 opacity-90 font-medium"
            style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.7)" }}
          >
            Scroll Down
          </span>
          <ChevronDown 
            className="h-8 w-8 group-hover:scale-110 transition-transform" 
            style={{ filter: "drop-shadow(1px 1px 3px rgba(0,0,0,0.7))" }}
          />
        </button>
      </motion.div>
    </section>
  )
}