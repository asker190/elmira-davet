"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface HeroSlideData {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  buttonText?: string | null;
  buttonLink?: string | null;
}

interface HeroSliderProps {
  slides: HeroSlideData[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReduced = useReducedMotion();

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-play interval
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, slides.length]);

  if (!slides || slides.length === 0) {
    return (
      <section className="relative h-screen min-h-[600px] flex items-center justify-center bg-bg-primary">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-6xl font-heading text-gradient-gold">
            Elmira Davet
          </h1>
          <p className="text-text-secondary mt-3 font-accent text-lg">
            Hayalinizdeki Düğün Burada Başlıyor
          </p>
        </div>
      </section>
    );
  }

  const slide = slides[current];

  return (
    <section
      className="relative h-screen min-h-[650px] w-full overflow-hidden bg-bg-primary select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with AnimatePresence */}
      <AnimatePresence mode="wait">
        <m.div
          key={slide.id}
          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={slide.imageUrl}
            alt={slide.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Multi-layered dark cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-black/70" />
          <div className="absolute inset-0 bg-black/30" />
        </m.div>
      </AnimatePresence>

      {/* Decorative Gold Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[120px] pointer-events-none z-10" />

      {/* Content Container */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
        <AnimatePresence mode="wait">
          <m.div
            key={slide.id}
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl space-y-6"
          >
            {slide.subtitle && (
              <span className="inline-block text-xs sm:text-sm font-accent uppercase tracking-[0.3em] text-gold-light border-b border-gold/40 pb-1">
                {slide.subtitle}
              </span>
            )}

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading text-text-primary tracking-tight leading-tight">
              {slide.title}
            </h1>

            <div className="divider-gold" />

            {slide.buttonText && (
              <div className="pt-2">
                <Link
                  href={slide.buttonLink || "/paketler"}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-gold text-bg-primary font-semibold text-sm tracking-wider uppercase hover:scale-105 transition-transform duration-300 shadow-gold"
                >
                  <span>{slide.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </m.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls (Arrows) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Önceki Slayt"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 hover:bg-gold/20 text-text-primary hover:text-gold border border-white/10 hover:border-gold/40 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Sonraki Slayt"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 hover:bg-gold/20 text-text-primary hover:text-gold border border-white/10 hover:border-gold/40 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Slayt ${idx + 1}`}
                className={`transition-all duration-300 cursor-pointer ${
                  idx === current
                    ? "w-8 h-2 bg-gradient-gold rounded-full"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70 rounded-full"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
