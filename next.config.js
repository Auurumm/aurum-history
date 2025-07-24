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
  
  // 🔥 실험적 기능 (필요한 경우만)
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // 🔥 환경변수 검증
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 🔥 빌드 최적화
  swcMinify: true,
  
  // 🔥 정적 내보내기 설정 (필요한 경우)
  // output: 'export',
  // trailingSlash: true,
}

module.exports = nextConfig