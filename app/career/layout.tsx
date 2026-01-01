import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "인재영입",
  description: "오럼과 함께할 인재를 찾습니다.",
}

export default function CareerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}