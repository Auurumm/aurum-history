import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "MEMBERS",
  description: "오럼과 함께하는 구성원들을 소개합니다.",
}

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}