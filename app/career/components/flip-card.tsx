// components/flip-card.tsx
"use client"

import Image from "next/image"
import "./flip-card.css"

interface FlipCardProps {
  title: string
  description: React.ReactNode
  image: string
}

export default function FlipCard({ title, description, image }: FlipCardProps) {
  return (
    <div className="flip-card w-full h-[28rem] md:h-[36rem] lg:h-[40rem]">
      <div className="flip-card-inner">
        {/* 앞면 */}
        <div className="flip-card-front relative">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white z-10 px-4 text-center leading-tight">
              {title}
            </h3>
          </div>
        </div>

       {/* 뒷면 */}
      <div className="flip-card-back relative rounded-xl overflow-hidden">
        {/* 배경 이미지 */}
        <Image
          src={image}
          alt={`${title}-bg`}
          fill
          className="object-cover"
        />

        {/* 어두운 오버레이 */}
        <div className="absolute inset-0 bg-black/60" />

        {/* 텍스트 콘텐츠 */}
        <div className="absolute inset-0 flex items-center justify-center text-center px-8 md:px-12">
          <p className="text-lg md:text-xl lg:text-2xl text-gray-100 leading-relaxed z-10 max-w-2xl">
            {description}
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}