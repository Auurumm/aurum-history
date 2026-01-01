import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "검색",
  description: "오럼 홈페이지 내 검색",
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}