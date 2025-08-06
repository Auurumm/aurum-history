// app/layout.tsx
import "./globals.css"
import type { Metadata } from "next"
import Header from "./components/header"
import Footer from "./components/footer"
import Providers from "./providers"
import CustomCursor from "./components/custom-cursor"
import ScrollToTop from "./components/scroll-to-top"
import { ResponsiveProvider } from "./contexts/responsive-context"

export const metadata: Metadata = {
  title: {
    default: "Aurum, 오럼",
    template: "%s | Aurum",
  },
  description: "사람이 행복한, 라이프 스타일을 만듭니다.",
  keywords: ["Aurum", "오럼", "브랜드", "마케팅", "엔터테인먼트", "라이프스타일"],
  
  // Open Graph (Facebook, 카카오톡, 링크드인 등)
  openGraph: {
    type: 'website',
    url: 'https://www.aurum.nexus',
    title: 'Aurum, 오럼 - 사람이 행복한 라이프 스타일',
    description: '세상 모두가 더 행복해질 수 있도록, 오럼이 함께 합니다.',
    images: [
      {
        url: 'https://www.aurum.nexus/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Aurum 미리보기 이미지',
      }
    ],
    siteName: 'Aurum',
    locale: 'ko_KR',
  },

  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: 'Aurum, 오럼 - 사람이 행복한 라이프 스타일',
    description: '세상 모두가 더 행복해질 수 있도록, 오럼이 함께 합니다.',
    images: ['https://www.aurum.nexus/images/og-image.png'],
  },

  // 추가 메타데이터
  robots: {
    index: true,
    follow: true,
  },
  
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  // 검증 메타태그 (필요시)
  verification: {
    google: 'your-google-verification-code', // Google Search Console
    // naver: 'your-naver-verification-code', // 네이버 웹마스터도구
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        {/* CDN 폰트 최적화 로딩 */}
        <link 
          rel="preconnect" 
          href="https://cdn.jsdelivr.net" 
          crossOrigin=""
        />
        <link 
          rel="preload" 
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" 
          as="style"
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" 
        />
        
        {/* 커스텀 폰트 preload (URL 인코딩 적용) */}
        <link
          rel="preload"
          href="/fonts/OKMAN%20FONT.ttf"
          as="font"
          type="font/ttf"
          crossOrigin=""
        />
      </head>
      <body className="font-pretendard bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 min-h-screen flex flex-col antialiased">
        <Providers>
          <ResponsiveProvider>
            <CustomCursor />
            <ScrollToTop />
            <Header />
            <main className="flex-grow flex flex-col">
              <div className="flex-grow">{children}</div>
            </main>
            <Footer />
          </ResponsiveProvider>
        </Providers>
      </body>
    </html>
  )
}