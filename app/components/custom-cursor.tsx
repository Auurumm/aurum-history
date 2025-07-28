"use client";

import type React from "react";
import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trackerPosition, setTrackerPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [hasHover, setHasHover] = useState(true); // ← 디바이스에서 hover 지원 여부 판단

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setHasHover(window.matchMedia("(hover: hover)").matches);
    }
  }, []);

  useEffect(() => {
    if (!mounted || !hasHover) return;

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
  }, [mounted, hasHover]);

  // 부드러운 추적 애니메이션 (requestAnimationFrame 루프)
  useEffect(() => {
    if (!mounted || !hasHover) return;

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
  }, [mousePosition, mounted, hasHover]);

  // 모바일에서는 아예 렌더링 X
  if (!mounted || !hasHover) return null;

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
