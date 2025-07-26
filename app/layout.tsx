// app/layout.tsx
import "./globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import Header from "./components/header"
import Footer from "./components/footer"
import Providers from "./providers"
import CustomCursor from "./components/custom-cursor"
import ScrollToTop from "./components/scroll-to-top"
import Head from "next/head" // ✅ 추가

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Aurum, 오럼",
    template: "%s | Aurum",
  },
  description: "사람이 행복한, 라이프 스타일을 만듭니다.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="scroll-smooth">
      <Head>
        <title>Aurum, 오럼</title>
        <meta name="description" content="사람이 행복한, 라이프 스타일을 만듭니다." />

        {/* ✅ Open Graph 메타태그 */}
        <meta property="og:title" content="Aurum, 오럼 - 사람이 행복한 라이프 스타일" />
        <meta property="og:description" content="세상 모두가 더 행복해질 수 있도록, 오럼이 함께 합니다." />
        <meta property="og:image" content="https://www.aurum.nexus/images/og-image.png" />
        <meta property="og:url" content="https://www.aurum.nexus" />
        <meta property="og:type" content="website" />
      </Head>

      <body
        className={`${inter.className} bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 min-h-screen flex flex-col`}
      >
        <Providers>
          <CustomCursor />
          <ScrollToTop />
          <Header />
          <main className="flex-grow flex flex-col">
            <div className="flex-grow">{children}</div>
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
