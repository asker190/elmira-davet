"use client";

import { useEffect, useRef, createContext, useContext, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface SmoothScrollContextType {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
});

export const useLenis = () => useContext(SmoothScrollContext);

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * Smooth scroll provider integrating Lenis with GSAP ScrollTrigger.
 * Synchronizes Lenis scroll events with ScrollTrigger.update()
 * and hooks Lenis.raf() into the GSAP ticker.
 * Automatically deactivates when prefers-reduced-motion is enabled.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Register GSAP ScrollTrigger plugin on client
    gsap.registerPlugin(ScrollTrigger);

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    // Synchronize Lenis scroll updates with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis RAF from GSAP ticker for synchronized animation frames
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Handle dynamic preference changes
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handlePreferenceChange = (e: MediaQueryListEvent) => {
      if (e.matches && lenisRef.current) {
        gsap.ticker.remove(tickerCallback);
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };

    mql.addEventListener("change", handlePreferenceChange);

    return () => {
      mql.removeEventListener("change", handlePreferenceChange);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
