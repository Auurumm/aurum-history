"use client";

import { useEffect, useState } from "react";
import { Shield, Zap, Globe, Sparkles } from "lucide-react";

export default function CoreValues() {
  const [mounted, setMounted] = useState(false);
  const [flipped, setFlipped] = useState(false);

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
            onClick={() => setFlipped(prev => !prev)}
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

            {/* ⭐ 방법 1: 그라디언트 오버레이 (눈 부분 투명하게) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />

            {/* ⭐ 텍스트를 하단에 배치 (반투명 배경 제거) */}
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-12">
              {!flipped ? (
                <p className="text-white text-xl sm:text-2xl font-semibold text-center leading-relaxed drop-shadow-lg">
                  모두를 행복하게 <br /> 할 수는 없지만
                </p>
              ) : (
                <p className="text-white text-xl sm:text-2xl font-semibold text-center leading-relaxed drop-shadow-lg">
                  조금은 더, <br /> 행복하게 만들 수 있습니다.
                </p>
              )}
            </div>

            {/* ⭐ 방법 3: 호버/클릭 시 텍스트가 나타나는 효과 (대안) */}
            {/* <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              flipped ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
            }`}>
              <div className={`transition-all duration-500 ${
                flipped ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}>
                <p className="text-white text-2xl font-semibold text-center px-4 leading-relaxed">
                  조금은 더, <br /> 행복하게 만들 수 있습니다.
                </p>
              </div>
            </div> */}
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

// ==========================================
// 🎨 대안 2: 텍스트를 좌우로 분할 배치

export function CoreValuesAlternative2() {
  const [mounted, setMounted] = useState(false);
  const [flipped, setFlipped] = useState(false);

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
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          
          {/* 왼쪽 텍스트 */}
          <div className="flex-1 text-center lg:text-right">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8">
              <p className="text-white text-2xl font-semibold leading-relaxed">
                {!flipped ? "모두를 행복하게 할 수는 없지만" : ""}
              </p>
            </div>
          </div>

          {/* 중앙 이미지 */}
          <div className="flex-shrink-0">
            <div
              className="w-[20rem] h-[20rem] rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative cursor-pointer"
              onClick={() => setFlipped(prev => !prev)}
            >
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
              
              {/* 가벼운 오버레이만 */}
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>

          {/* 오른쪽 텍스트 */}
          <div className="flex-1 text-center lg:text-left">
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8">
              <p className="text-white text-2xl font-semibold leading-relaxed">
                {flipped ? "조금은 더, 행복하게 만들 수 있습니다." : ""}
              </p>
            </div>
          </div>
        </div>

        {/* 아래 텍스트는 동일 */}
        <div className="space-y-12 mt-16 text-center">
          <div className="mt-4">
            <p className="text-white text-xl sm:text-2xl leading-relaxed">세상 모두가</p>
          </div>
          <div className="-mt-2">
            <p className="text-white text-3xl sm:text-4xl font-semibold leading-relaxed">
              보다 더 따뜻하게, 보다 더 즐겁게
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

// ==========================================
// 🎨 대안 3: 플로팅 텍스트 (눈 주변 피하기)

export function CoreValuesAlternative3() {
  const [mounted, setMounted] = useState(false);
  const [flipped, setFlipped] = useState(false);

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
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* 이미지와 플로팅 텍스트 */}
        <div className="mb-8 relative">
          <div
            className="w-[24rem] h-[24rem] max-w-[80vw] max-h-[80vw] mx-auto rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative cursor-pointer"
            onClick={() => setFlipped(prev => !prev)}
          >
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
            
            {/* 최소한의 오버레이 */}
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* 플로팅 텍스트 - 이미지 주변에 배치 */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/70 backdrop-blur-sm rounded-full px-6 py-3">
              <p className="text-white text-lg font-medium whitespace-nowrap">
                {!flipped ? "모두를 행복하게" : "조금은 더,"}
              </p>
            </div>
          </div>
          
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/70 backdrop-blur-sm rounded-full px-6 py-3">
              <p className="text-white text-lg font-medium whitespace-nowrap">
                {!flipped ? "할 수는 없지만" : "행복하게 만들 수 있습니다."}
              </p>
            </div>
          </div>
        </div>

        {/* 나머지 콘텐츠는 동일 */}
        <div className="space-y-12">
          <div className="mt-4">
            <p className="text-white text-xl sm:text-2xl leading-relaxed">세상 모두가</p>
          </div>
          <div className="-mt-2">
            <p className="text-white text-3xl sm:text-4xl font-semibold leading-relaxed">
              보다 더 따뜻하게, 보다 더 즐겁게
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