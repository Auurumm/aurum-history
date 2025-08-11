// app/layout.tsx
import "./globals.css"
import type { Metadata, Viewport } from "next"
import Header from "./components/header"
import Footer from "./components/footer"
import Providers from "./providers"
import CustomCursor from "./components/custom-cursor"
import ScrollToTop from "./components/scroll-to-top"
import ZoomPrevention from "./components/zoom-prevention"
import { ResponsiveProvider } from "./contexts/responsive-context"

// ✅ 뷰포트 설정 - 확대/축소 완전 비활성화
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: {
    default: "(주)오럼 | 주식회사 오럼 | Aurum Inc.",
    template: "%s | (주)오럼 | Aurum Inc.",
  },
  description: "주식회사 오럼(Aurum Inc.) - 사람이 행복한 라이프 스타일을 만듭니다. (주)오럼은 브랜드, 마케팅, 엔터테인먼트 분야의 전문 기업입니다.",
  keywords: [
    "(주)오럼", "주식회사 오럼", "오럼", "Aurum Inc", "Aurum", 
    "브랜드", "마케팅", "엔터테인먼트", "라이프스타일",
    "주식회사오럼", "오럼회사", "아우럼"
  ],
  
  // Open Graph (Facebook, 카카오톡, 링크드인 등)
  openGraph: {
    type: 'website',
    url: 'https://www.aurum.nexus',
    title: '(주)오럼 | 주식회사 오럼 | Aurum Inc. - 사람이 행복한 라이프 스타일',
    description: '주식회사 오럼(Aurum Inc.)은 세상 모두가 더 행복해질 수 있도록, 오럼이 함께 합니다.',
    images: [
      {
        url: 'https://www.aurum.nexus/images/og-image.png',
        width: 1200,
        height: 630,
        alt: '(주)오럼 | Aurum Inc. 미리보기 이미지',
      }
    ],
    siteName: '(주)오럼 | Aurum Inc.',
    locale: 'ko_KR',
  },

  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: '(주)오럼 | 주식회사 오럼 | Aurum Inc. - 사람이 행복한 라이프 스타일',
    description: '주식회사 오럼(Aurum Inc.)은 세상 모두가 더 행복해질 수 있도록, 오럼이 함께 합니다.',
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
    google: 'your-google-verification-code', // Google Search Console에서 받은 코드로 교체
    // naver: 'your-naver-verification-code', // 네이버 웹마스터도구
  },

  // 🆕 사이트링크를 위한 추가 메타데이터
  alternates: {
    canonical: 'https://www.aurum.nexus',
  },
}

// 🆕 구조화된 데이터 스키마 (사이트링크 최적화)
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.aurum.nexus/#organization",
      "name": "Aurum",
      "alternateName": "오럼",
      "url": "https://www.aurum.nexus",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.aurum.nexus/images/logo.png",
        "width": 400,
        "height": 400
      },
      "description": "사람이 행복한, 라이프 스타일을 만듭니다.",
      "foundingDate": "2024", // 실제 설립 연도로 수정
      "sameAs": [
        "https://www.instagram.com/aurum_official", // 실제 소셜미디어 URL로 수정
        "https://www.linkedin.com/company/aurum"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+82-2-582-6101", // 실제 전화번호로 수정
        "contactType": "customer service",
        "availableLanguage": ["Korean", "English"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://www.aurum.nexus/#website",
      "url": "https://www.aurum.nexus",
      "name": "Aurum",
      "description": "사람이 행복한, 라이프 스타일을 만듭니다.",
      "publisher": {
        "@id": "https://www.aurum.nexus/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.aurum.nexus/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://www.aurum.nexus/#webpage",
      "url": "https://www.aurum.nexus",
      "name": "Aurum, 오럼 - 사람이 행복한 라이프 스타일",
      "isPartOf": {
        "@id": "https://www.aurum.nexus/#website"
      },
      "about": {
        "@id": "https://www.aurum.nexus/#organization"
      },
      "description": "세상 모두가 더 행복해질 수 있도록, 오럼이 함께 합니다.",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "홈",
            "item": "https://www.aurum.nexus"
          }
        ]
      }
    }
  ]
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        {/* 🆕 Google Search Console 인증 메타태그 */}
        <meta 
          name="google-site-verification" 
          content="여기에_실제_구글_인증_코드를_붙여넣으세요" 
        />

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
        
        {/* 커스텀 폰트 preload */}
        <link
          rel="preload"
          href="/fonts/OKMAN%20FONT.ttf"
          as="font"
          type="font/ttf"
          crossOrigin=""
        />

        {/* 🆕 구조화된 데이터 추가 (사이트링크 최적화) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className="font-pretendard bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 min-h-screen flex flex-col antialiased">
        <div className="site-wrapper">
          <Providers>
            <ResponsiveProvider>
              <ZoomPrevention />
              <CustomCursor />
              <ScrollToTop />
              <Header />
              <main className="flex-grow flex flex-col">
                <div className="flex-grow">{children}</div>
              </main>
              <Footer />
            </ResponsiveProvider>
          </Providers>
        </div>
      </body>
    </html>
  )
}