import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "임직원",
  description: "오럼 임직원 전용 페이지",
}

export default function EmployeesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}