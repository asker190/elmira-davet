"use client";

import { type ElementType, type ReactNode } from "react";
import { m } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface RevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "zoom" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
  as?: ElementType;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.65,
  distance = 30,
  threshold = 0.1,
  once = true,
  className = "",
}: RevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: distance, scale: 1 };
      case "down":
        return { opacity: 0, y: -distance, scale: 1 };
      case "left":
        return { opacity: 0, x: -distance, scale: 1 };
      case "right":
        return { opacity: 0, x: distance, scale: 1 };
      case "zoom":
        return { opacity: 0, scale: 0.94, y: 0, x: 0 };
      case "none":
        return { opacity: 0, y: 0, x: 0, scale: 1 };
      default:
        return { opacity: 0, y: distance, scale: 1 };
    }
  };

  return (
    <m.div
      initial={getInitialPosition()}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once, amount: threshold, margin: "0px 0px -30px 0px" }}
      transition={{
        duration,
        delay,
        ease: EASE_OUT_EXPO,
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}
