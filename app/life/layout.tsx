import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "라이프",
  description: "오럼의 라이프 사업을 소개합니다.",
}

export default function LifeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}