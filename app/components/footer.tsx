"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { useLanguage } from "../contexts/language-context"

export default function Footer() {
  const [mounted, setMounted] = useState(false)
  const { t, locale } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const getLocalizedPath = (path: string) => {
    return locale === "en" ? `/en${path}` : path
  }

  return (
    <>
      {/* ✅ 모바일 전용 푸터 */}
      <footer className="block sm:hidden bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white px-4 py-16 transition-colors duration-300">
        <div className="max-w-md mx-auto space-y-3 text-left">
          <div className="text-base space-y-2 text-gray-500 dark:text-gray-400">
            <p>Aurum Inc</p>
            <p>사업자 등록번호 : 538-86-01639 | CEO : 박동근 | 주소 : 서울시 송파구 위례성대로12길 36, 금원빌딩 4층 전체 </p>
          </div>
        </div>
      </footer>

      {/* ✅ 데스크탑/태블릿 전용 푸터 */}
      <footer className="hidden sm:block bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-20">
          {/* 사이트 선택 드롭다운 영역 (오른쪽 상단) */}
          <div className="flex justify-end mb-4">
            <select className="text-base bg-transparent border border-gray-300 dark:border-gray-600 rounded px-4 py-2 text-gray-600 dark:text-gray-400">
              <option value="main">관련 사이트</option>
              <option value="site1">사이트 1</option>
              <option value="site2">사이트 2</option>
            </select>
          </div>

          {/* 상단 네비게이션 링크들 */}
          <div className="flex flex-wrap justify-start gap-x-8 gap-y-2 mb-16">
            <Link href={getLocalizedPath("/company-info")} className="text-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              오시는 길
            </Link>
            <Link href={getLocalizedPath("/announcements")} className="text-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              공지사항
            </Link>
            <Link href={getLocalizedPath("/career")} className="text-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              인재영입
            </Link>
            <Link href={getLocalizedPath("/wonders")} className="text-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              제휴문의
            </Link>
            <Link href={getLocalizedPath("/trace")} className="text-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              흔적들
            </Link>
          </div>

          {/* 회사 정보 */}
          <div className="text-left space-y-4">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Aurum Inc
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400">
              사업자 등록번호 : 538-86-01639 | CEO : 박동근 | 주소 : 서울시 송파구 위례성대로12길 36, 금원빌딩 4층 전체  
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}