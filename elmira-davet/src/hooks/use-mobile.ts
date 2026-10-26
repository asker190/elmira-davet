"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect mobile devices based on screen width.
 * Defaults to false during SSR to prevent hydration mismatch.
 */
export function useMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();

    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}
