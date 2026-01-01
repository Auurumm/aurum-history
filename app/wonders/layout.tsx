import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "문의사항",
  description: "오럼에 대해 궁금한 점을 문의해주세요.",
}

export default function WondersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}