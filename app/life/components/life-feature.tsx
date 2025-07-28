"use client"
import Image from "next/image"

interface LifeFeatureProps {
  title: string
  description: string
  image: string
  color: string
  bgColor?: string
  tags?: string[] // 태그 props
}

export default function LifeFeature({
  title,
  description,
  image,
  bgColor = "bg-white",
  tags = [],
}: LifeFeatureProps) {
  return (
    <section
      className={`min-h-screen bg-white dark:bg-black transition-colors duration-300 px-6 md:px-16 py-20 flex flex-col md:flex-row items-center justify-center gap-8`}
    >
      {/* 텍스트 영역 */}
      <div className="md:w-2/3 w-full mb-12 md:mb-0">
        <div className="max-w-3xl mx-auto text-left space-y-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">{title}</h2>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 leading-loose">{description}</p>

          {/* 태그 영역 */}
          {tags.length > 0 && (
            <div className="mt-8 flex gap-3 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm md:text-base border px-4 py-2 rounded-full text-yellow-500 border-yellow-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 이미지 영역 */}
      <div className="md:w-1/3 w-full flex justify-center">
        <Image
          src={image}
          alt={title}
          width={350}
          height={350}
          className="rounded-2xl object-cover shadow-md"
        />
      </div>
    </section>
  )
}