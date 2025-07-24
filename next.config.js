// next.config.js
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔥 이미지 도메인 허용
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com'
    ],
  },
  
  // 🔥 실험적 기능
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // 🔥 swcMinify 제거 (Next.js 15에서는 기본 활성화)
  // swcMinify: true, // 이 줄 제거!
  
  // 🔥 빌드 최적화
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig