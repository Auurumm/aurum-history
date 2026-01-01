import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "알립니다",
  description: "오럼의 공지사항과 소식을 전합니다.",
}

export default function AnnouncementsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}