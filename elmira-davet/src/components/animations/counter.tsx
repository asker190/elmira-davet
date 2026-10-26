"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  label?: string;
  sublabel?: string;
  decimals?: number;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
}

export function Counter({
  value,
  suffix = "",
  prefix = "",
  duration = 2,
  label,
  sublabel,
  decimals = 0,
  className = "",
  valueClassName = "text-3xl sm:text-4xl lg:text-5xl font-heading text-gradient-gold font-bold tracking-tight",
  labelClassName = "text-sm font-medium text-cream mt-2 tracking-wide font-heading",
}: CounterProps) {
  const prefersReduced = useReducedMotion();
  const [count, setCount] = useState(prefersReduced ? value : 0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    if (prefersReduced) {
      setCount(value);
      return;
    }

    if (!isInView) return;

    let start = 0;
    const end = value;
    const totalFrames = Math.round(duration * 60);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      // easeOutExpo curve
      const progress = 1 - Math.pow(2, -10 * (frame / totalFrames));
      const current = start + (end - start) * progress;

      if (decimals > 0) {
        setCount(Number(current.toFixed(decimals)));
      } else {
        setCount(Math.round(current));
      }

      if (frame >= totalFrames) {
        clearInterval(counter);
        setCount(end);
      }
    }, 1000 / 60);

    return () => clearInterval(counter);
  }, [isInView, value, duration, decimals, prefersReduced]);

  const formattedCount = decimals > 0
    ? count.toLocaleString("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : count.toLocaleString("tr-TR");

  return (
    <div
      ref={ref}
      className={`text-center p-6 rounded-2xl bg-surface/50 border border-border backdrop-blur-xs ${className}`}
    >
      <div className={valueClassName}>
        {prefix}
        {formattedCount}
        {suffix}
      </div>
      {label && <p className={labelClassName}>{label}</p>}
      {sublabel && (
        <p className="text-xs text-text-muted mt-0.5 font-sans">
          {sublabel}
        </p>
      )}
    </div>
  );
}

// Named alias for convenience
export const AnimatedCounter = Counter;
