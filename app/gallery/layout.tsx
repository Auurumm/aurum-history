import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "오럼 갤러리",
  description: "오럼의 공간과 사람들, 우리의 하루를 엿보세요.",
}

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}