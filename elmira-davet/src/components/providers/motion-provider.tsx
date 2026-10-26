"use client";

import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import { type ReactNode } from "react";

interface MotionProviderProps {
  children: ReactNode;
}

/**
 * Framer Motion provider with lazy loading and reduced-motion enforcement.
 * When reducedMotion="user" is passed, Framer Motion automatically detects
 * the prefers-reduced-motion media query and switches all animations to instant transitions.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
