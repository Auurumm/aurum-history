"use client";

import { useEffect, useState } from "react";
import { Shield, Zap, Globe, Sparkles } from "lucide-react";

export default function CoreValues() {
  const [mounted, setMounted] = useState(false);
  const [flipped, setFlipped] = useState(false); // ✅ 클릭 토글 상태 추가

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section
      id="next-section"
      className="relative min-h-[100vh] py-32 mt-[-1px] bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
      style={{
        backgroundImage: "url('/images/crayon.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 이미지 토글 박스 */}
        <div className="mb-8">
          <div
            className="w-[24rem] h-[24rem] max-w-[80vw] max-h-[80vw] mx-auto rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative cursor-pointer"
            onClick={() => setFlipped(prev => !prev)} // ✅ 클릭 토글
          >
            {/* 이미지 전환 */}
            <img
              src="/images/girl3.png"
              alt="Brand Character"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                flipped ? "opacity-0" : "opacity-100"
              }`}
            />
            <img
              src="/images/girl2.png"
              alt="Happy Character"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                flipped ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* 어두운 반투명 오버레이 */}
            <div className="absolute inset-0 bg-black/40" />

            {/* 텍스트 전환 */}
            <div className="absolute inset-0 flex items-center justify-center">
              {!flipped ? (
                <p className="text-white text-2xl font-semibold text-center px-4 leading-relaxed">
                  모두를 행복하게 <br /> 할 수는 없지만
                </p>
              ) : (
                <p className="text-white text-2xl font-semibold text-center px-4 leading-relaxed">
                  조금은 더, <br /> 행복하게 만들 수 있습니다.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 아래 텍스트 고정 콘텐츠 */}
        <div className="space-y-12">
          <div className="mt-4">
            <p className="text-white text-xl sm:text-2xl leading-relaxed">세상 모두가</p>
          </div>

          <div className="-mt-2">
            <p className="text-white text-3xl sm:text-4xl font-semibold leading-relaxed">
              보다 더 따뜻하게,
              <br />
              보다 더 즐겁게
            </p>
          </div>

          <div className="-mt-1">
            <p className="text-white text-xl sm:text-2xl leading-relaxed">당신의 꿈에, 항상</p>
          </div>

          <div className="pt-4">
            <p className="text-white text-5xl sm:text-6xl font-bold leading-relaxed">
              오럼이 함께 하겠습니다
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
