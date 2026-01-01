import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "흔적들",
  description: "오럼이 남긴 흔적들을 소개합니다.",
}

export default function TracesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}