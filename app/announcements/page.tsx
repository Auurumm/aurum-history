"use client"

import { useEffect, useState } from "react"
import { getAllAnnouncements } from "../../lib/announcements"
import { Announcement } from "../../types/announcement"
import HeroSection from "./components/announcements-hero"
import Image from "next/image"
import Link from "next/link"

const categories = ["전체", "Media", "Service", "Cooperation", "Recruit", "Social", "Others"]

export default function AnnouncementsPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [visibleCount, setVisibleCount] = useState(2)
  const [allPosts, setAllPosts] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const posts = await getAllAnnouncements()
      setAllPosts(posts)
      setLoading(false)
    }

    fetchData()
  }, [])

  const filtered = selectedCategory === "전체"
    ? allPosts
    : allPosts.filter((post) => post.category === selectedCategory)

  const visiblePosts = filtered.slice(0, visibleCount)
  const isAllLoaded = visiblePosts.length >= filtered.length

  return (
    <div className="bg-white text-black dark:bg-black dark:text-white min-h-screen pb-20 transition-colors duration-300">
      <HeroSection />

      <div id="scroll-target">
        {/* 카테고리 필터 - 모바일 최적화 */}
        <div className="py-8 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-4">
            {/* 데스크톱: 중앙 정렬된 플렉스 */}
            <div className="hidden md:flex justify-center flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat)
                    setVisibleCount(2)
                  }}
                  className={`text-base px-5 py-2.5 rounded-full transition-all font-medium ${
                    selectedCategory === cat
                      ? "bg-yellow-400 text-black font-semibold shadow-md scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-102"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 모바일: 가로 스크롤 */}
            <div className="md:hidden">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex gap-3 px-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat)
                        setVisibleCount(2)
                      }}
                      className={`text-sm px-4 py-2 rounded-full transition-all font-medium whitespace-nowrap flex-shrink-0 ${
                        selectedCategory === cat
                          ? "bg-yellow-400 text-black font-semibold shadow-md"
                          : "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 스크롤 힌트 */}
              <div className="flex justify-center mt-3">
                <div className="flex space-x-1">
                  {Array.from({ length: Math.ceil(categories.length / 3) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 게시물 카드 */}
        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            // 로딩 스켈레톤
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-zinc-900 rounded-lg p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-300 dark:bg-zinc-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded mb-2 w-20"></div>
                  <div className="h-6 bg-gray-300 dark:bg-zinc-700 rounded mb-3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mt-12">
              {visiblePosts.map((post) => (
                <Link href={`/announcements/${post.id}`} key={post.id} className="block group">
                  <article className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] group-hover:border-yellow-400 dark:group-hover:border-yellow-500">

                    {/* 이미지 */}
                    {post.image ? (
                      <div className="relative overflow-hidden rounded-lg mb-5">
                        <Image
                          src={post.image}
                          alt={post.title}
                          width={600}
                          height={300}
                          className="object-cover w-full h-48 md:h-52 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 md:h-52 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-800 rounded-lg mb-5 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 dark:bg-zinc-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">이미지 없음</p>
                        </div>
                      </div>
                    )}

                    {/* 콘텐츠 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="inline-block text-sm font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                          {post.category}
                        </span>
                        <time className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {post.date}
                        </time>
                      </div>
                      
                      <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-base text-gray-700 dark:text-gray-400 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 더보기 버튼 */}
        {!loading && (
          <div className="text-center mt-16">
            {isAllLoaded ? (
              <div className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                <svg className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-base text-gray-500 dark:text-gray-400 font-medium">
                  모든 콘텐츠를 확인했습니다
                </span>
              </div>
            ) : (
              <button
                onClick={() => setVisibleCount((prev) => prev + 2)}
                className="inline-flex items-center justify-center px-8 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-yellow-400 dark:hover:bg-yellow-500 hover:text-black rounded-full transition-all duration-300 font-semibold text-base group hover:scale-105"
              >
                <span className="mr-2">더 많은 콘텐츠 보기</span>
                <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}