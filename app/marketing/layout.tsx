import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "마케팅",
  description: "오럼의 마케팅 사업을 소개합니다.",
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}