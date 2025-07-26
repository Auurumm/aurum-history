// app/head.tsx
export default function Head() {
  return (
    <>
      <title>Aurum, 오럼</title>
      <meta name="description" content="사람이 행복한, 라이프 스타일을 만듭니다." />

      {/* Open Graph */}
      <meta property="og:title" content="Aurum, 오럼 - 사람이 행복한 라이프 스타일" />
      <meta property="og:description" content="세상 모두가 더 행복해질 수 있도록, 오럼이 함께 합니다." />
      <meta property="og:image" content="https://www.aurum.nexus/images/og-image.png" />
      <meta property="og:url" content="https://www.aurum.nexus" />
      <meta property="og:type" content="website" />
    </>
  )
}
