"use client"

import { useState } from "react"
import HeroSection from "./components/announcements-hero"
import Image from "next/image"
import Link from "next/link"


const allPosts = [
  {
    id: 1,
    title: "AI와 함께하는 강아지 콘텐츠",
    date: "2024. 6. 1",
    category: "Media",
    image: "/images/girl.png",
    excerpt: "낮잠이 불타오르는 중",
  },
  {
    id: 2,
    title: "외모 편향을 깨는 강아지 캠페인",
    date: "2024. 6. 4",
    category: "Media",
    image: "/images/sample2.jpg",
    excerpt: "그들의 외모 뒤에 숨은 이야기",
  },
  {
    id: 3,
    title: "반려견 식품 캠페인 성과 공개",
    date: "2024. 6. 10",
    category: "Media",
    image: "/images/sample3.jpg",
    excerpt: "함께 만든 의미 있는 변화",
  },
  {
    id: 3,
    title: "반려견 식품 캠페인 성과 공개",
    date: "2024. 6. 10",
    category: "Media",
    image: "/images/sample3.jpg",
    excerpt: "함께 만든 의미 있는 변화",
  },
  {
    id: 3,
    title: "반려견 식품 캠페인 성과 공개",
    date: "2024. 6. 10",
    category: "Media",
    image: "/images/sample3.jpg",
    excerpt: "함께 만든 의미 있는 변화",
  },
  {
    id: 3,
    title: "반려견 식품 캠페인 성과 공개",
    date: "2024. 6. 10",
    category: "Media",
    image: "/images/sample3.jpg",
    excerpt: "함께 만든 의미 있는 변화",
  },
]

const categories = ["전체", "Media", "Service", "Cooperation", "Recruit", "Social", "Others"]

export default function AnnouncementsPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [visibleCount, setVisibleCount] = useState(2)

  const filtered = selectedCategory === "전체"
    ? allPosts
    : allPosts.filter((post) => post.category === selectedCategory)

  const visiblePosts = filtered.slice(0, visibleCount)
  const isAllLoaded = visiblePosts.length >= filtered.length

  return (
    <div className="bg-white text-black dark:bg-black dark:text-white min-h-screen pb-20 transition-colors duration-300">
      {/* Hero Section */}
      <HeroSection />

      <div id="scroll-target">
        {/* 카테고리 필터 */}
        <div className="flex justify-center flex-wrap gap-4 py-12 border-b border-gray-200 dark:border-gray-700">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat)
                setVisibleCount(2)
              }}
              className={`text-lg px-6 py-3 rounded-full transition font-medium ${
                selectedCategory === cat
                  ? "bg-yellow-400 text-black font-semibold shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 게시물 카드 리스트 */}
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
          {visiblePosts.map((post) => (
            <Link href={`/announcements/${post.id}`} key={post.id} className="block">
              <div className="bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={600}
                  height={400}
                  className="rounded-lg mb-6 object-cover w-full h-64"
                />
                <div className="text-base text-yellow-600 dark:text-yellow-400 mb-3 font-medium">{post.category}</div>
                <h3 className="text-2xl font-bold mb-3 leading-tight">{post.title}</h3>
                <p className="text-lg text-gray-700 dark:text-gray-400 leading-relaxed">{post.excerpt}</p>
                <div className="text-sm text-gray-500 dark:text-gray-600 mt-4">{post.date}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* 더보기 or 종료 */}
        <div className="text-center mt-20">
          {isAllLoaded ? (
            <p className="text-lg text-gray-500 dark:text-gray-400">
              로드할 내용이 없습니다.
            </p>
          ) : (
            <button
              onClick={() => setVisibleCount((prev) => prev + 2)}
              className="text-lg text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white underline underline-offset-4 transition-colors font-medium px-4 py-2"
            >
              더보기 ↓
            </button>
          )}
        </div>
      </div>
    </div>
  )
}