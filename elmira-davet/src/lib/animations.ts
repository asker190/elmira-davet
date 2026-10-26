import type { Variants } from "framer-motion";

/**
 * Shared animation variants for consistent motion across the site.
 * All animations use transform/opacity only for GPU acceleration.
 */

// Ease curve matching the CSS custom property
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// ─── Fade In ─────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

// ─── Fade Up ─────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

// ─── Fade Down ───────────────────────────────────────────

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

// ─── Fade Left ───────────────────────────────────────────

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

// ─── Fade Right ──────────────────────────────────────────

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

// ─── Scale Up ────────────────────────────────────────────

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

// ─── Stagger Container ──────────────────────────────────

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// ─── Stagger Item ────────────────────────────────────────

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

// ─── Slide In ────────────────────────────────────────────

export const slideIn = (
  direction: "left" | "right" | "up" | "down",
  delay: number = 0
): Variants => {
  const isHorizontal = direction === "left" || direction === "right";
  const offset = direction === "left" || direction === "up" ? -100 : 100;

  return {
    hidden: isHorizontal
      ? { opacity: 0, x: offset }
      : { opacity: 0, y: offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.8,
        delay,
        ease: EASE_OUT_EXPO,
      },
    },
  };
};

// ─── Gold Shimmer (for decorative elements) ──────────────

export const goldShimmer: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1,
      ease: EASE_OUT_EXPO,
    },
  },
};

// ─── Page Transition ─────────────────────────────────────

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// ─── Viewport Settings ───────────────────────────────────

export const defaultViewport = {
  once: true,
  margin: "-50px",
  amount: 0.2 as const,
};
