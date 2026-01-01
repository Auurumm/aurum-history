import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "발자국",
  description: "오럼이 걸어온 길, 우리의 역사를 소개합니다.",
}

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}