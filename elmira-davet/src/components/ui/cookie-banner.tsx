"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Cookie, Settings, Check, X } from "lucide-react";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

const STORAGE_KEY = "elmira_cookie_consent";

export function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);
  const [marketingAllowed, setMarketingAllowed] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Small delay for smooth appearance after page load
        const timer = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const savePreferences = (preferences: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      window.dispatchEvent(
        new CustomEvent("cookie_consent_updated", { detail: preferences })
      );
    } catch {}
    setIsOpen(false);
    setShowDetails(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      decidedAt: new Date().toISOString(),
    });
  };

  const handleRejectNonEssential = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      decidedAt: new Date().toISOString(),
    });
  };

  const handleSaveCustom = () => {
    savePreferences({
      necessary: true,
      analytics: analyticsAllowed,
      marketing: marketingAllowed,
      decidedAt: new Date().toISOString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Çerez ve Gizlilik Bildirimi"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-bg-secondary/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl p-5 text-text-primary">
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0 text-gold">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-base text-cream flex items-center gap-2">
              <span>Çerez & Gizlilik Tercihleri</span>
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-gold/20 text-gold font-medium">
                KVKK Uyumlu
              </span>
            </h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Elmira Davet olarak deneyiminizi iyileştirmek, site performansını analiz etmek ve size özel düğün & davet teklifleri sunabilmek (Meta reklamları) için çerezler kullanmaktayız.{" "}
              <Link
                href="/kvkk"
                className="text-gold underline hover:text-gold-light ml-0.5"
                target="_blank"
              >
                Aydınlatma Metni
              </Link>
            </p>
          </div>
        </div>

        {/* Detailed Preferences Accordion */}
        {showDetails && (
          <div className="mt-4 pt-3 border-t border-border/60 space-y-3 text-xs">
            {/* 1. Zorunlu Çerezler */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface/50 border border-border/40">
              <div>
                <p className="font-medium text-cream flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Zorunlu Çerezler
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Sitenin güvenliği, oturum ve temel işlevleri için gereklidir (Kapatılamaz).
                </p>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                Aktif
              </span>
            </div>

            {/* 2. Analitik Çerezler */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface/50 border border-border/40 cursor-pointer hover:border-gold/30 transition-colors">
              <div>
                <p className="font-medium text-cream">Performans ve Analitik</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Ziyaretçi trafiğini ve sayfa hızını ölçümlememize yardımcı olur.
                </p>
              </div>
              <input
                type="checkbox"
                checked={analyticsAllowed}
                onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                className="w-4 h-4 rounded text-gold bg-surface border-border focus:ring-gold cursor-pointer"
              />
            </label>

            {/* 3. Pazarlama & Meta Pixel */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface/50 border border-border/40 cursor-pointer hover:border-gold/30 transition-colors">
              <div>
                <p className="font-medium text-cream">Pazarlama & Meta Pixel</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Instagram ve Facebook üzerinde size özel kampanya ve teklifler sunar.
                </p>
              </div>
              <input
                type="checkbox"
                checked={marketingAllowed}
                onChange={(e) => setMarketingAllowed(e.target.checked)}
                className="w-4 h-4 rounded text-gold bg-surface border-border focus:ring-gold cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-text-muted hover:text-cream flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-surface/50"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{showDetails ? "Basit Görünüm" : "Tercihleri Özelleştir"}</span>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {showDetails ? (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-3.5 py-1.5 rounded-full bg-gold/20 hover:bg-gold/30 text-gold text-xs font-medium border border-gold/40 transition-colors cursor-pointer"
              >
                Seçimleri Kaydet
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-3 py-1.5 rounded-full bg-surface hover:bg-surface-hover text-text-secondary hover:text-cream text-xs font-medium border border-border transition-colors cursor-pointer"
              >
                Yalnızca Zorunlu
              </button>
            )}

            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-1.5 rounded-full bg-gradient-gold hover:opacity-95 text-bg-primary text-xs font-semibold shadow-gold transition-opacity cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Tümünü Kabul Et</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
