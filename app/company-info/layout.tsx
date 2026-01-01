import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "회사 INFO",
  description: "오럼이 위치한 곳, 그리고 우리와 소통할 수 있는 모든 정보를 한눈에 확인하세요.",
}

export default function CompanyInfoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}