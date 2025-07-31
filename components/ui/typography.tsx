"use client"

import { ResponsiveText } from './responsive-text'

interface ResponsiveTextProps {
  mobile: React.ReactNode
  tablet?: React.ReactNode
  desktop: React.ReactNode
  className?: string
}

// 🎯 히어로 섹션용 대형 텍스트
export function ResponsiveHeroText({ mobile, tablet, desktop, className = "" }: ResponsiveTextProps) {
  return (
    <ResponsiveText
      mobile={mobile}
      tablet={tablet}
      desktop={desktop}
      as="h1"
      className={`font-blackHanSans text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] text-[#D4AF37] leading-tight tracking-wide ${className}`}
    />
  )
}

// 🎯 메인 제목용
export function ResponsiveTitle({ mobile, tablet, desktop, className = "" }: ResponsiveTextProps) {
  return (
    <ResponsiveText
      mobile={mobile}
      tablet={tablet}
      desktop={desktop}
      as="h1"
      className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight ${className}`}
    />
  )
}

// 🎯 섹션 제목용
export function ResponsiveHeading({ mobile, tablet, desktop, className = "" }: ResponsiveTextProps) {
  return (
    <ResponsiveText
      mobile={mobile}
      tablet={tablet}
      desktop={desktop}
      as="h2"
      className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold leading-tight tracking-tight ${className}`}
    />
  )
}

// 🎯 소제목용
export function ResponsiveSubheading({ mobile, tablet, desktop, className = "" }: ResponsiveTextProps) {
  return (
    <ResponsiveText
      mobile={mobile}
      tablet={tablet}
      desktop={desktop}
      as="h3"
      className={`text-2xl sm:text-3xl lg:text-4xl font-medium leading-tight tracking-tight ${className}`}
    />
  )
}

// 🎯 본문 텍스트용
export function ResponsiveBody({ mobile, tablet, desktop, className = "" }: ResponsiveTextProps) {
  return (
    <ResponsiveText
      mobile={mobile}
      tablet={tablet}
      desktop={desktop}
      as="p"
      className={`text-base sm:text-lg lg:text-xl leading-relaxed tracking-tight ${className}`}
    />
  )
}

// 🎯 작은 텍스트용 (설명, 캡션 등)
export function ResponsiveCaption({ mobile, tablet, desktop, className = "" }: ResponsiveTextProps) {
  return (
    <ResponsiveText
      mobile={mobile}
      tablet={tablet}
      desktop={desktop}
      as="p"
      className={`text-sm sm:text-base lg:text-lg leading-relaxed tracking-tight ${className}`}
    />
  )
}

// 🎯 강조 텍스트용
export function ResponsiveEmphasis({ mobile, tablet, desktop, className = "" }: ResponsiveTextProps) {
  return (
    <ResponsiveText
      mobile={mobile}
      tablet={tablet}
      desktop={desktop}
      as="span"
      className={`text-lg sm:text-xl lg:text-2xl font-semibold leading-tight tracking-tight ${className}`}
    />
  )
}