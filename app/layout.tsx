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
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <Providers>
            <ResponsiveProvider>
              <CustomCursor />
              <ZoomPrevention />
              <ScrollToTop />
              <Header />
              {children}
              <Footer />
            </ResponsiveProvider>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}


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
    default: "오럼 | Aurum",
    template: "오럼 | Aurum | %s",  // ✅ 순서 변경됨
  },
  description: "주식회사 오럼(Aurum Inc.) - 사람이 행복한 라이프 스타일을 만듭니다.",
  keywords: [
    "오럼", "Aurum", "(주)오럼", "주식회사 오럼", "Aurum Inc", 
    "브랜드", "마케팅", "엔터테인먼트", "라이프스타일"
  ],
  
  // Open Graph (Facebook, 카카오톡, 링크드인 등)
  openGraph: {
    type: 'website',
    url: 'https://www.aurum.nexus',
    title: '오럼 | Aurum - 사람이 행복한 라이프 스타일',
    description: '주식회사 오럼(Aurum)은 세상 모두가 더 행복해질 수 있도록, 함께 합니다.',
    images: [
      {
        url: 'https://www.aurum.nexus/images/og-image.png',
        width: 1200,
        height: 630,
        alt: '오럼 | Aurum 미리보기 이미지',
      }
    ],
    siteName: '오럼 | Aurum',
    locale: 'ko_KR',
  },

  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: '오럼 | Aurum - 사람이 행복한 라이프 스타일',
    description: '주식회사 오럼(Aurum)은 세상 모두가 더 행복해질 수 있도록, 함께 합니다.',
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
    google: 'ahNsH9XpaLexcmOc3-ZR-tJMxiN2i-Eiw1aklSS7wVE',
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
      "name": "주식회사 오럼",
      "legalName": "(주)오럼",
      "alternateName": ["Aurum Inc.", "오럼", "Aurum", "아우럼"],
      "url": "https://www.aurum.nexus",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.aurum.nexus/images/logo.png",
        "width": 400,
        "height": 400
      },
      "description": "주식회사 오럼(Aurum Inc.) - 사람이 행복한 라이프 스타일을 만듭니다.",
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
      "name": "오럼 | Aurum",
      "description": "주식회사 오럼(Aurum) - 사람이 행복한 라이프 스타일을 만듭니다.",
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
      "name": "오럼 | Aurum - 사람이 행복한 라이프 스타일",
      "isPartOf": {
        "@id": "https://www.aurum.nexus/#website"
      },
      "about": {
        "@id": "https://www.aurum.nexus/#organization"
      },
      "description": "주식회사 오럼(Aurum)은 세상 모두가 더 행복해질 수 있도록, 함께 합니다.",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "오럼",
            "item": "https://www.aurum.nexus"
          }
        ]
      }
    }
  ]
}