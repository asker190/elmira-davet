"use client";

import { useRef, type ReactNode } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface ParallaxProps {
  children: ReactNode;
  speed?: number; // e.g. 0.2 means moves by 20% of scroll
  offset?: [number, number]; // pixel offset range, e.g. [-40, 40]
  className?: string;
  disabled?: boolean;
}

export function Parallax({
  children,
  speed = 0.15,
  offset,
  className = "",
  disabled = false,
}: ParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const range = offset || [speed * -150, speed * 150];
  const y = useTransform(scrollYProgress, [0, 1], range);

  if (prefersReduced || disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <m.div style={{ y }} className="will-change-transform">
        {children}
      </m.div>
    </div>
  );
}
