import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "엔터테인먼트",
  description: "오럼의 엔터테인먼트 사업을 소개합니다.",
}

export default function EntertainmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}