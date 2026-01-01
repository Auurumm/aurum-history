import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "브랜드",
  description: "오럼의 브랜드 사업을 소개합니다.",
}

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}