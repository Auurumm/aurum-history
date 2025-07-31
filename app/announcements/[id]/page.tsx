"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getAnnouncementById } from "../../../lib/announcements"
import { Announcement } from "@/types/announcement"
import { useAuth } from "../../../lib/auth"

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { isAdmin } = useAuth()
  const [post, setPost] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPost = async () => {
      try {
        if (params?.id) {
          const postData = await getAnnouncementById(params.id as string)
          setPost(postData)
        }
      } catch (error) {
        console.error("게시글 로딩 실패:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPost()
  }, [params?.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">게시글을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">게시글을 찾을 수 없습니다</h2>
          <button
            onClick={() => router.push("/announcements")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 sm:px-6 py-2 rounded-md transition-colors text-sm sm:text-base"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 - 모바일 최적화 */}
      <div className="bg-white shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-24">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center text-yellow-600 hover:text-yellow-700 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
            >
              ← 목록으로 돌아가기
            </button>
            
            <div className="space-y-3 sm:space-y-4">
              {/* 카테고리 */}
              <div className="flex items-center">
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium whitespace-nowrap">
                  {post.category}
                </span>
              </div>
              
              {/* 제목 */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight break-words">
                {post.title}
              </h1>
              
              {/* 메타 정보 */}
              <div className="flex flex-col sm:flex-row sm:items-center text-gray-500 text-xs sm:text-sm space-y-1 sm:space-y-0 sm:space-x-4">
                <span>{post.date}</span>
                {post.published ? (
                  <span className="text-green-600 flex items-center">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1"></span>
                    게시됨
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full mr-1"></span>
                    비공개
                  </span>
                )}
              </div>
              
              {/* 관리자 버튼 - 모바일에서는 하단으로 */}
              {isAdmin && (
                <div className="pt-2">
                  <button
                    onClick={() => router.push(`/admin/edit/${post.id}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm transition-colors w-full sm:w-auto"
                  >
                    수정하기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 - 모바일 최적화 */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* 썸네일 이미지 - 반응형 */}
            {post.image && (
              <div className="w-full h-48 sm:h-64 lg:h-96 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-4 sm:p-6 lg:p-8">
              {/* 요약 */}
              {post.excerpt && (
                <div className="bg-gray-50 border-l-4 border-yellow-500 p-3 sm:p-4 mb-4 sm:mb-8">
                  <p className="text-gray-700 italic text-sm sm:text-base leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              )}

              {/* 본문 - 모바일 최적화된 HTML 렌더링 */}
              <div 
                dangerouslySetInnerHTML={{ __html: post.content || "" }}
                className="mobile-content-area"
              />
            </div>
          </div>

          {/* 하단 네비게이션 - 모바일 최적화 */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
            <button
              onClick={() => router.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md transition-colors text-sm sm:text-base order-2 sm:order-1"
            >
              목록으로 돌아가기
            </button>
            
            {isAdmin && (
              <button
                onClick={() => router.push(`/admin/edit/${post.id}`)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md transition-colors text-sm sm:text-base order-1 sm:order-2"
              >
                수정하기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 최적화된 스타일 */}
      <style jsx global>{`
        .mobile-content-area {
          line-height: 1.6;
          color: #374151;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
        }
        
        .mobile-content-area * {
          max-width: 100%;
          box-sizing: border-box;
        }
        
        .mobile-content-area h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 1.2em 0 0.8em 0;
          color: #111827;
          line-height: 1.3;
        }
        
        .mobile-content-area h2 {
          font-size: 1.3rem;
          font-weight: 600;
          margin: 1.1em 0 0.7em 0;
          color: #1f2937;
          line-height: 1.3;
        }
        
        .mobile-content-area h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 1em 0 0.6em 0;
          color: #374151;
          line-height: 1.4;
        }
        
        .mobile-content-area h4 {
          font-size: 1.05rem;
          font-weight: 600;
          margin: 0.9em 0 0.5em 0;
          color: #4b5563;
          line-height: 1.4;
        }
        
        .mobile-content-area h5 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0.8em 0 0.4em 0;
          color: #6b7280;
          line-height: 1.4;
        }
        
        .mobile-content-area h6 {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0.8em 0 0.4em 0;
          color: #9ca3af;
          line-height: 1.4;
        }
        
        .mobile-content-area p {
          margin: 0.8em 0;
          line-height: 1.6;
          font-size: 0.95rem;
        }
        
        .mobile-content-area ul {
          list-style-type: disc;
          margin: 1em 0;
          padding-left: 1.5rem;
        }
        
        .mobile-content-area ol {
          list-style-type: decimal;
          margin: 1em 0;
          padding-left: 1.5rem;
        }
        
        .mobile-content-area li {
          margin: 0.4em 0;
          line-height: 1.5;
          font-size: 0.95rem;
        }
        
        .mobile-content-area br {
          display: block;
          margin: 0.3em 0;
          content: "";
        }
        
        .mobile-content-area a {
          color: #3b82f6;
          text-decoration: underline;
          word-break: break-all;
        }
        
        .mobile-content-area a:hover {
          color: #1d4ed8;
        }
        
        .mobile-content-area strong, 
        .mobile-content-area b {
          font-weight: 600;
        }
        
        .mobile-content-area em, 
        .mobile-content-area i {
          font-style: italic;
        }
        
        .mobile-content-area u {
          text-decoration: underline;
        }
        
        .mobile-content-area blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 0.8rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
          font-size: 0.9rem;
        }
        
        .mobile-content-area img {
          max-width: 100% !important;
          height: auto !important;
          margin: 1rem 0;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          display: block;
        }
        
        .mobile-content-area code {
          background-color: #f3f4f6;
          padding: 0.1rem 0.3rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.85rem;
          word-break: break-all;
        }
        
        .mobile-content-area pre {
          background-color: #f3f4f6;
          padding: 0.8rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
          font-size: 0.85rem;
        }
        
        .mobile-content-area pre code {
          background-color: transparent;
          padding: 0;
          word-break: normal;
        }
        
        .mobile-content-area table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.9rem;
          overflow-x: auto;
          display: block;
          white-space: nowrap;
        }
        
        .mobile-content-area th,
        .mobile-content-area td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
          text-align: left;
        }
        
        .mobile-content-area th {
          background-color: #f9fafb;
          font-weight: 600;
        }

        /* 데스크톱에서는 더 큰 폰트 사용 */
        @media (min-width: 640px) {
          .mobile-content-area h1 {
            font-size: 2rem;
          }
          
          .mobile-content-area h2 {
            font-size: 1.6rem;
          }
          
          .mobile-content-area h3 {
            font-size: 1.3rem;
          }
          
          .mobile-content-area h4 {
            font-size: 1.15rem;
          }
          
          .mobile-content-area h5 {
            font-size: 1.05rem;
          }
          
          .mobile-content-area h6 {
            font-size: 1rem;
          }
          
          .mobile-content-area p,
          .mobile-content-area li {
            font-size: 1rem;
          }
          
          .mobile-content-area ul,
          .mobile-content-area ol {
            padding-left: 2rem;
          }
          
          .mobile-content-area table {
            display: table;
            white-space: normal;
          }
        }

        @media (min-width: 1024px) {
          .mobile-content-area h1 {
            font-size: 2.25rem;
          }
          
          .mobile-content-area h2 {
            font-size: 1.875rem;
          }
          
          .mobile-content-area h3 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}