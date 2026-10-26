"use client";

import { type ElementType } from "react";
import { m } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface TextRevealProps {
  text: string;
  type?: "words" | "chars" | "lines";
  delay?: number;
  stagger?: number;
  duration?: number;
  className?: string;
  as?: ElementType;
  highlightWords?: string[];
  highlightClassName?: string;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function TextReveal({
  text,
  type = "words",
  delay = 0.05,
  stagger = 0.06,
  duration = 0.7,
  className = "",
  as: Component = "h2",
  highlightWords = [],
  highlightClassName = "text-gradient-gold italic font-accent",
}: TextRevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <Component className={className}>{text}</Component>;
  }

  // Tokenize based on type
  if (type === "chars") {
    const chars = text.split("");
    return (
      <Component className={className}>
        {chars.map((char, i) => (
          <span
            key={i}
            className="inline-block overflow-hidden align-bottom"
          >
            <m.span
              initial={{ y: "115%", opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration,
                delay: delay + i * (stagger * 0.4),
                ease: EASE_OUT_EXPO,
              }}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </m.span>
          </span>
        ))}
      </Component>
    );
  }

  if (type === "lines") {
    const lines = text.split("\n");
    return (
      <Component className={className}>
        {lines.map((line, i) => (
          <span key={i} className="block overflow-hidden">
            <m.span
              initial={{ y: "110%", opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration,
                delay: delay + i * stagger,
                ease: EASE_OUT_EXPO,
              }}
              className="block"
            >
              {line}
            </m.span>
          </span>
        ))}
      </Component>
    );
  }

  // Default: Words
  const words = text.split(" ");

  return (
    <Component className={className}>
      {words.map((word, i) => {
        const isHighlighted = highlightWords.some(
          (hw) =>
            hw.toLowerCase() ===
            word.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase()
        );

        return (
          <span
            key={i}
            className="inline-block overflow-hidden align-bottom mr-[0.25em] last:mr-0 py-0.5"
          >
            <m.span
              initial={{ y: "115%", opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration,
                delay: delay + i * stagger,
                ease: EASE_OUT_EXPO,
              }}
              className={`inline-block ${
                isHighlighted ? highlightClassName : ""
              }`}
            >
              {word}
            </m.span>
          </span>
        );
      })}
    </Component>
  );
}
