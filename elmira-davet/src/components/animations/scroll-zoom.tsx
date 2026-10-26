"use client";

import { useRef, type ReactNode } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface ScrollZoomProps {
  children: ReactNode;
  scaleRange?: [number, number]; // e.g. [1, 1.15]
  className?: string;
  wrapperClassName?: string;
  disabled?: boolean;
}

export function ScrollZoom({
  children,
  scaleRange = [1, 1.15],
  className = "",
  wrapperClassName = "",
  disabled = false,
}: ScrollZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);

  if (prefersReduced || disabled) {
    return <div className={wrapperClassName}><div className={className}>{children}</div></div>;
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${wrapperClassName}`}>
      <m.div style={{ scale }} className={`will-change-transform ${className}`}>
        {children}
      </m.div>
    </div>
  );
}
