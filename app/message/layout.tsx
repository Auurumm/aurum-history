import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "메시지",
  description: "오럼에게 메시지를 보내세요.",
}

export default function MessageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}