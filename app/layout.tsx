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

// 🆕 구조화된 데이터 스키마 (사이트링크 최적화)
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.aurum.nexus/#organization",
      "name": "주식회사 오럼",
      "legalName": "주식회사 오럼",
      "alternateName": ["(주)오럼", "주식회사오럼", "오럼", "Aurum", "Aurum Inc.", "아우름"],
      "url": "https://www.aurum.nexus",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.aurum.nexus/images/logo.png",
        "width": 400,
        "height": 400
      },
      "description": "주식회사 오럼(Aurum Inc.) - 사람이 행복한 라이프 스타일을 만듭니다.",
      "foundingDate": "2024",
      "sameAs": [
        "https://www.instagram.com/aurum_official",
        "https://www.linkedin.com/company/aurum"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+82-2-582-6101",
        "contactType": "customer service",
        "availableLanguage": ["Korean", "English"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://www.aurum.nexus/#website",
      "url": "https://www.aurum.nexus",
      "name": "주식회사 오럼 | Aurum",
      "description": "주식회사 오럼(Aurum Inc.) - 사람이 행복한 라이프 스타일을 만듭니다.",
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
      "name": "주식회사 오럼 | Aurum - 사람이 행복한 라이프 스타일",
      "isPartOf": {
        "@id": "https://www.aurum.nexus/#website"
      },
      "about": {
        "@id": "https://www.aurum.nexus/#organization"
      },
      "description": "주식회사 오럼(Aurum Inc.)은 세상 모두가 더 행복해질 수 있도록, 함께 합니다.",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "주식회사 오럼",
            "item": "https://www.aurum.nexus"
          }
        ]
      }
    }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
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
    default: "주식회사 오럼 | Aurum",
    template: "주식회사 오럼 | Aurum | %s",
  },
  description: "주식회사 오럼(Aurum Inc.) - 사람이 행복한 라이프 스타일을 만듭니다. 브랜드, 마케팅, 엔터테인먼트, 라이프 사업을 운영합니다.",
  keywords: [
    "주식회사 오럼", "주식회사오럼", "(주)오럼", "오럼", "Aurum", "Aurum Inc",
    "아우름", "오럼 회사", "오럼 브랜드", "오럼 마케팅",
    "브랜드", "마케팅", "엔터테인먼트", "라이프스타일"
  ],
  
  // Open Graph (Facebook, 카카오톡, 링크드인 등)
  openGraph: {
    type: 'website',
    url: 'https://www.aurum.nexus',
    title: '주식회사 오럼 | Aurum - 사람이 행복한 라이프 스타일',
    description: '주식회사 오럼(Aurum Inc.)은 세상 모두가 더 행복해질 수 있도록, 함께 합니다.',
    images: [
      {
        url: 'https://www.aurum.nexus/images/og-image.png',
        width: 1200,
        height: 630,
        alt: '주식회사 오럼 | Aurum 미리보기 이미지',
      }
    ],
    siteName: '주식회사 오럼 | Aurum',
    locale: 'ko_KR',
  },

  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: '주식회사 오럼 | Aurum - 사람이 행복한 라이프 스타일',
    description: '주식회사 오럼(Aurum Inc.)은 세상 모두가 더 행복해질 수 있도록, 함께 합니다.',
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

  // 검증 메타태그
  verification: {
    google: 'ahNsH9XpaLexcmOc3-ZR-tJMxiN2i-Eiw1aklSS7wVE',
  },

  // 사이트링크를 위한 추가 메타데이터
  alternates: {
    canonical: 'https://www.aurum.nexus',
  },
}