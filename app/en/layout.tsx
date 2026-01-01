import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "English",
  description: "Aurum Inc. - Creating lifestyles that make people happy.",
}

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}