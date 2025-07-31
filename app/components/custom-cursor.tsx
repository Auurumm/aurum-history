"use client";

import type React from "react";
import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trackerPosition, setTrackerPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [shouldShowCursor, setShouldShowCursor] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      // 🎯 더 강력한 데스크톱 감지
      const hasHoverSupport = window.matchMedia("(hover: hover)").matches;
      const hasMousePointer = window.matchMedia("(pointer: fine)").matches;
      const isNotTouchDevice = !window.matchMedia("(pointer: coarse)").matches;
      const isNotMobileUA = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // 모든 조건을 만족해야 커서 표시
      const shouldShow = hasHoverSupport && hasMousePointer && isNotTouchDevice && isNotMobileUA;
      
      setShouldShowCursor(shouldShow);
      
      // 🔍 디버그 정보 (개발 중에만 사용)
      console.log('🔍 Cursor Detection:', {
        hasHoverSupport,
        hasMousePointer,
        isNotTouchDevice,
        isNotMobileUA,
        shouldShow,
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth
      });
    }
  }, []);

  useEffect(() => {
    if (!mounted || !shouldShowCursor) return;

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    document.addEventListener("mousemove", updateMousePosition);

    const interactiveElements = document.querySelectorAll("a, button, [role='button']");
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      document.removeEventListener("mousemove", updateMousePosition);
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [mounted, shouldShowCursor]);

  // 부드러운 추적 애니메이션
  useEffect(() => {
    if (!mounted || !shouldShowCursor) return;

    let frameId: number;
    const animate = () => {
      setTrackerPosition((prev) => ({
        x: prev.x + (mousePosition.x - prev.x) * 0.1,
        y: prev.y + (mousePosition.y - prev.y) * 0.1,
      }));
      frameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, [mousePosition, mounted, shouldShowCursor]);

  // 🎯 강화된 조건: 모바일/터치 디바이스에서는 완전히 숨김
  if (!mounted || !shouldShowCursor) return null;

  return (
    <>
      {/* Main dot cursor */}
      <div
        className="fixed top-0 left-0 w-2 h-2 bg-gray-800 rounded-full pointer-events-none z-50 mix-blend-difference transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${mousePosition.x - 4}px, ${mousePosition.y - 4}px) scale(${isHovering ? 1.5 : 1})`,
        }}
      />

      {/* Secondary hover ring */}
      <div
        className="fixed top-0 left-0 w-4 h-4 border border-gray-800 rounded-full pointer-events-none z-40 transition-all duration-300 ease-out"
        style={{
          transform: `translate(${mousePosition.x - 8}px, ${mousePosition.y - 8}px) scale(${isHovering ? 1.2 : 1})`,
          opacity: isHovering ? 0.6 : 0.3,
        }}
      />

      {/* Trailing blur cursor */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-30 transition-all duration-500 ease-out"
        style={
          {
            transform: `translate(${trackerPosition.x - 12}px, ${trackerPosition.y - 12}px)`,
            "--cursor-color": "#6b7280",
            "--cursor-size": "24px",
          } as React.CSSProperties
        }
      >
        <div
          className="rounded-full bg-gray-400/20 backdrop-blur-sm border border-gray-400/30"
          style={{
            width: "var(--cursor-size)",
            height: "var(--cursor-size)",
            backgroundColor: "color-mix(in srgb, var(--cursor-color) 20%, transparent)",
            borderColor: "color-mix(in srgb, var(--cursor-color) 30%, transparent)",
          }}
        />
      </div>
    </>
  );
}