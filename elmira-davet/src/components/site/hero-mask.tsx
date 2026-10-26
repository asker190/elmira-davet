"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, CalendarCheck2, MapPin, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { TextReveal } from "@/components/animations/text-reveal";
import { MagneticButton } from "@/components/animations/magnetic-button";

interface HeroMaskProps {
  title?: string;
  subtitle?: string;
  location?: string;
  posterUrl?: string;
  videoUrl?: string;
}

export function HeroMask({
  title = "Aşkınızın En Görkemli Sahnesi",
  subtitle = "İstanbul Gaziosmanpaşa'da hayalinizdeki düğün, kristal avizeler ve büyüleyici kır bahçesiyle gerçeğe dönüşüyor.",
  location = "İstanbul - Gaziosmanpaşa",
  posterUrl = "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=85",
  videoUrl = "/videos/hero.mp4",
}: HeroMaskProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const prefersReduced = useReducedMotion();

  // Lazy-load video after mount so initial LCP from poster is immediate
  useEffect(() => {
    if (prefersReduced || !videoUrl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current && !hasVideoError) {
            videoRef.current.load();
            videoRef.current
              .play()
              .then(() => setVideoLoaded(true))
              .catch(() => {
                setVideoLoaded(false);
              });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [prefersReduced, videoUrl, hasVideoError]);

  const toggleSound = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] lg:min-h-screen w-full overflow-hidden flex items-center justify-center bg-bg-primary select-none pt-24 pb-16"
    >
      {/* ── Background Layer: Poster Image (LCP optimized) + Lazy Video ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src={posterUrl}
          alt="Elmira Davet Salonu Gaziosmanpaşa"
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover transition-opacity duration-1000"
          style={{ opacity: videoLoaded && !hasVideoError ? 0.35 : 1 }}
        />

        {/* Lazy Video Component */}
        {!prefersReduced && videoUrl && !hasVideoError && (
          <video
            ref={videoRef}
            poster={posterUrl}
            preload="none"
            muted={isMuted}
            loop
            playsInline
            onError={() => {
              setHasVideoError(true);
              setVideoLoaded(false);
            }}
            onCanPlay={() => setVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? "opacity-40" : "opacity-0"
            }`}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}

        {/* Multi-layered cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-black/80" />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* Atmospheric Gold Radial Glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gold/10 rounded-full blur-[140px] pointer-events-none z-10"
      />

      {/* ── Foreground Content Container ── */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
        {/* Location & Brand Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/85 border border-gold/30 text-gold text-xs tracking-widest uppercase backdrop-blur-md shadow-card">
          <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
          <span>{location}</span>
          <span className="w-1 h-1 rounded-full bg-gold" />
          <span className="text-cream font-medium">Elmira Davet Salonu</span>
        </div>

        {/* Heading with Satır/Harf/Kelime Mask Reveal */}
        <TextReveal
          text={title}
          type="words"
          highlightWords={["Görkemli", "Sahnesi", "Aşkınızın"]}
          highlightClassName="text-gradient-gold italic font-accent"
          className="text-4xl sm:text-6xl md:text-7xl font-heading text-cream font-normal tracking-tight leading-[1.18]"
          as="h1"
        />

        {/* Subtitle */}
        <p className="text-text-secondary text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-sans">
          {subtitle}
        </p>

        {/* Quick Capacity Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <div className="px-4 py-2 rounded-xl bg-surface/80 border border-border text-xs text-text-primary backdrop-blur-sm flex items-center gap-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>
              <strong className="text-cream">Kristal Salon</strong> – 600 Kişilik Kapasite
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-surface/80 border border-border text-xs text-text-primary backdrop-blur-sm flex items-center gap-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>
              <strong className="text-cream">Kır Bahçesi</strong> – 300 Kişilik Açık Hava
            </span>
          </div>
        </div>

        {/* Actions with MagneticButton */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 max-w-md mx-auto sm:max-w-none">
          <MagneticButton
            href="#randevu"
            className="w-full sm:w-auto"
            aria-label="Tarih Seçin ve Randevu Alın"
          >
            <div className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-gold text-bg-primary font-semibold text-xs tracking-wider uppercase shadow-gold hover:opacity-95 transition-all flex items-center justify-center gap-2">
              <CalendarCheck2 className="w-4 h-4" />
              <span>Teklif & Randevu Al</span>
            </div>
          </MagneticButton>

          <MagneticButton
            href="/salonlar"
            className="w-full sm:w-auto"
            aria-label="Salonlarımızı Detaylı İnceleyin"
          >
            <div className="w-full sm:w-auto px-8 py-4 rounded-full bg-surface/80 hover:bg-surface text-cream border border-border hover:border-gold/40 text-xs tracking-wider uppercase transition-colors backdrop-blur-md flex items-center justify-center gap-2">
              <span>Salonlarımızı İnceleyin</span>
              <ArrowRight className="w-4 h-4 text-gold" />
            </div>
          </MagneticButton>
        </div>

        {/* Video Audio Control Button (when video is active) */}
        {!prefersReduced && videoLoaded && !hasVideoError && (
          <div className="pt-2 flex justify-center">
            <button
              onClick={toggleSound}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 hover:bg-black/80 text-[11px] text-text-muted hover:text-cream border border-white/10 backdrop-blur-md transition-colors"
              aria-label={isMuted ? "Video sesini aç" : "Video sesini kapat"}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-gold" />
                  <span>Sesi Aç</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-gold" />
                  <span>Sesi Kapat</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Elegant Scroll Indicator */}
      <div
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-[10px] tracking-widest uppercase text-text-muted pointer-events-none"
      >
        <span>Keşfet</span>
        <div className="w-[1px] h-7 bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  );
}
